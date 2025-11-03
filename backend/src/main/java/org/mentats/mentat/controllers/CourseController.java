package org.mentats.mentat.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.exceptions.CourseNotFoundException;
import org.mentats.mentat.exceptions.DataAccessException;
import org.mentats.mentat.exceptions.ExamResultNotFoundException;
import org.mentats.mentat.models.Course;
import org.mentats.mentat.payload.request.*;
import org.mentats.mentat.payload.response.CourseResponse;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.payload.response.StudentCourseResponse;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.services.CourseService;
import org.mentats.mentat.services.StudentCourseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import static java.lang.Long.parseLong;


/**
 * Exam Rest API Controller
 * Methods that drive and control api mappings
 * base URI is /api/course
 * @author Joshua Summers
 */
@RestController
@RequestMapping("/api/course")
public class CourseController {
    /**
     * CourseController Fields
     */
    // Services
    @Autowired
    private CourseService courseService;
    @Autowired
    private StudentCourseService studentCourseService;
    // Repository services
    private final CourseRepository courseRepository;
    // Logger
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    /**
     * Dependency Injection Constructor
     * @param courseRepository
     */
    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    /**
     * A method to creates a course and writes into the database.
     * @param courseRequest CourseRequest type object that masks request info
     * @return Returns message response.
     */
    @PostMapping("/createCourse")
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest courseRequest) {
        try {
            System.out.println("Creating course: " + courseRequest.getCourseName());
            System.out.println("Course section: " + courseRequest.getCourseSection());
            System.out.println("Course quarter: " + courseRequest.getCourseQuarter());
            System.out.println("Course year: " + courseRequest.getCourseYear());
            System.out.println("User ID: " + courseRequest.getCourseProfessorId());

            CourseResponse course = courseService.createCourse(courseRequest);
            System.out.println("Course successfully created: " + course.getCourseName());
            return ResponseEntity.ok(new MessageResponse("Course created successfully"));
        } catch (Exception e) {
            logger.error("Error creating course: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating course: " + e.getMessage()));
        }
    }

    /**
     * API Method for retrieving list of course with User Instructor ID
     * @param id String type user ID
     * @return Returns successful response with list of course information
     */
    @GetMapping("/listCourses")
    public ResponseEntity<?> listCourses(@RequestParam String id) {
        try {
            // Get courses by their creator Professor ID
            List<CourseResponse> courses = courseService.getCoursesByProfessorId(parseLong(id));

            // Empty check
            if (courses.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Return list of course by the Professor ID
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.error("Error retrieving courses for professor " + id + ": " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving courses: " + e.getMessage()));
        }
    }

    /**
     * API method for students to join a course
     * @param studentCourseRequest StudentCourseRequest
     * @return Response indicating success or failure
     */
    @PostMapping("/joinCourse")
    public ResponseEntity<?> joinCourse(@RequestBody StudentCourseRequest studentCourseRequest) {
        try {
            StudentCourseResponse course = studentCourseService.joinCourse(studentCourseRequest);
            System.out.println("Course successfully joined: " + course.getCourseId() + " " +
                    course.getStudentId());
            return ResponseEntity.ok(new MessageResponse("Course joined successfully"));
        } catch (Exception e) {
            logger.error("Error joining course: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error joining course: " + e.getMessage()));
        }
    }

    /**
     * Debug endpoint to check all enrollments in database
     * @return List of all enrollments
     */
    @GetMapping("/debug/enrollments")
    public ResponseEntity<?> getAllEnrollments() {
        // Use the service layer to get all the joined courses
        List<StudentCourseResponse> response = studentCourseService.getAllEnrollments();
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * API method for getting all courses a student is enrolled in
     * This method is a duplicate method for getting courses
     * as such, it defers to that function for processing
     * @param sid Student ID
     * @return Response with list of courses
     */
    @GetMapping("/enrollments/{studentID}")
    public ResponseEntity<?> getEnrolledCourses(@PathVariable("studentID") Long sid) {
        try {
            // Get courses by the student Id they are joined to
            List<CourseResponse> courses = studentCourseService.getEnrolledCourses(sid);

            // Empty check
            if (courses.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Return list of course by the Professor ID
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.error("Error retrieving courses for professor " + sid + ": " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving courses: " + e.getMessage()));
        }
    }

    /**
     * Get the instructor exams from the database
     * based on the instructor ID supplied in the URI
     * @return Map object that have {string, object} types
     */
    @GetMapping("/{courseID}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable("courseID") Long cid) {
        // Use the service layer to get the course based on the Course Id
        Course course = courseService.getCourseById(cid);
        CourseResponse response = new CourseResponse(course);
        // Convert to Response DTO
        return ResponseEntity.ok(response);
    }

    /**
     * Patch the course in the database
     * based on the course ID supplied in the URI
     * @param courseUpdates JSON object of data
     * @param cid course Id
     * @return ResponseEntity
     */
    @PatchMapping("/{courseID}")
    public ResponseEntity<?> updateCourse(@RequestBody CourseRequest courseUpdates,
                                        @PathVariable("courseID") Long cid) {
        try {
            // Use the service layer to handle the update
            Course updatedCourse = courseService.updateCourse(cid, courseUpdates);

            // Convert to DTO/Response object for proper response (object-less)
            CourseResponse response = new CourseResponse(updatedCourse);
            return ResponseEntity.ok(response);

        } catch (DataAccessException e) {
            throw new DataAccessException("Database error while updating course: " + e.getMessage());
        } catch (EntityNotFoundException e) {
            throw new ExamResultNotFoundException("Course not found with id: " + cid);
        }
    }

    /**
     * Delete a course from the course table
     * @param cid Course Id
     * @return ResponseEntity of operation
     */
    @DeleteMapping("/{courseID}")
    public ResponseEntity<?> deleteCourse(@PathVariable("courseID") Long cid) {
        try {
            // Use the service layer to handle the deletion
            courseService.deleteCourse(cid);

            return ResponseEntity.ok().build();

        } catch (CourseNotFoundException e) {
            // Handle case where course is not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Course not found with id: " + cid);

        } catch (Exception e) {
            // Handle other exceptions (constraint violations, etc.)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting course: " + e.getMessage());
        }
    }

    /**
     * Get the courses from the database
     * based on the instructor ID supplied in the URI
     * @param iId Instructor Id
     * @return ResponseEntity of Courses
     */
    @GetMapping("/instructor/{instructorID}")
    public ResponseEntity<List<Course>> getCourseByInstructorId(@PathVariable("instructorID") Long iId) {
        try {
            // Use the repository to find courses by instructor ID
            List<Course> courses = courseRepository.findByInstructor_Id(iId);

            // Check if any courses were found
            if (courses != null && !courses.isEmpty()) {
                return ResponseEntity.ok(courses);
            } else {
                // Return 404 if no courses found for this instructor
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get the student that joined a course from the database
     * based on the course ID supplied in the URI
     * @param cId Course Id
     * @return ResponseEntity of StudentCourses
     */
    @GetMapping("/enrollments/course/{courseID}")
    public ResponseEntity<List<StudentCourseResponse>> getStudentCoursesByCourseId(@PathVariable("courseID") Long cId) {
        try {
            // Use the repository to find courses by instructor ID
            List<StudentCourseResponse> studentCourses = studentCourseService.getEnrolledStudentsByCourse(cId);

            // Check if any student courses were found
            if (studentCourses != null && !studentCourses.isEmpty()) {
                return ResponseEntity.ok(studentCourses);
            } else {
                // Return 404 if no student courses found for this course
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}