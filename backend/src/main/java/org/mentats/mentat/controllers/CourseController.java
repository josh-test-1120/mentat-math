package org.mentats.mentat.controllers;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.CourseJoin;
import org.mentats.mentat.models.StudentCourse;
import org.mentats.mentat.payload.request.CourseJoinRequest;
import org.mentats.mentat.payload.request.JoinCourseRequest;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.services.CourseJoinService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/course")
public class CourseController {
    /**
     * CourseController Fields
     */
    @Autowired
    private CourseJoinService courseJoinService;

    // Repository services
    private final CourseRepository courseRepository;
    
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
     * @param courseJoinRequest CourseRequest type object that masks request info
     * @return Returns message response.
     */
    @PostMapping("/createCourse")
    public ResponseEntity<?> createCourse(@RequestBody CourseJoinRequest courseJoinRequest) {
        try {
            System.out.println("Creating course: " + courseJoinRequest.getCourseName());
            System.out.println("Course section: " + courseJoinRequest.getCourseSection());
            System.out.println("Course quarter: " + courseJoinRequest.getCourseQuarter());
            System.out.println("Course year: " + courseJoinRequest.getCourseYear());
            System.out.println("User ID: " + courseJoinRequest.getUserId());
            
            CourseJoin courseJoin = courseJoinService.createCourse(courseJoinRequest);
            System.out.println("Course successfully created: " + courseJoin.getCourseName());
            return ResponseEntity.ok(new MessageResponse("Course created successfully"));
        } catch (Exception e) {
            logger.error("Error creating course: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating course: " + e.getMessage()));
        }
    }

    /**
     * API method for students to join a course
     * @param req Join course request containing course ID and user ID
     * @return Response indicating success or failure
     */
    @PostMapping("/joinCourse")
    public ResponseEntity<?> joinCourse(@RequestBody JoinCourseRequest req) {
        try {
            courseJoinService.joinCourse(req);
            return ResponseEntity.ok(new MessageResponse("Course joined successfully!"));
            
        } catch (NumberFormatException e) {
            logger.error("Number format error: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid course ID or user ID format"));
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
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
        try {
            List<StudentCourse> enrollments = courseJoinService.getAllEnrollments();
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            logger.error("Error retrieving enrollments: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving enrollments: " + e.getMessage()));
        }
    }

    /**
     * API method for getting all courses a student is enrolled in
     * @param studentId Student ID
     * @return Response with list of courses
     */
    @GetMapping("/enrollments")
    public ResponseEntity<?> getEnrolledCourses(@RequestParam String studentId) {
        try {
            // Get all courses a student is enrolled in
            List<CourseJoin> courses = courseJoinService.getEnrolledCourses(studentId);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            // Error fetching enrolled courses
            logger.error("Error fetching enrolled courses: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching enrolled courses"));
        }
    }

    /**
     * API Method for retrieving list of course with User Instructor ID
     * @param id String type user ID
     * @return Returns successful response with list of course information
     */
    @GetMapping("/listCourses")
    public ResponseEntity<?> listCourses(@RequestParam(required = false) String id) {
        try {
            logger.info("🔍 Received request for listCourses with id: '{}' (type: {})", id, id != null ? id.getClass().getSimpleName() : "null");
            
            // Check if id is provided
            if (id == null || id.trim().isEmpty()) {
                logger.error("❌ Missing or empty id parameter");
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Missing required parameter: id"));
            }
            
            logger.info("🔍 ID length: {}, isEmpty: {}", id.length(), id.isEmpty());
            
            // Get courses by their creator Professor ID
            List<CourseJoin> courses = courseJoinService.getCoursesByProfessorId(id);
            
            logger.info("🔍 Found {} courses for professor ID: '{}'", courses.size(), id);

            // Empty check
            if (courses.isEmpty()) {
                logger.info("🔍 No courses found for professor ID: '{}'", id);
                return ResponseEntity.notFound().build();
            }

            // Return list of course by the Professor ID
            logger.info("🔍 Returning {} courses for professor ID: '{}'", courses.size(), id);
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.error("❌ Error retrieving courses for professor '{}': {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving courses: " + e.getMessage()));
        }
    }

    /**
     * Get course details by course ID
     * @param id Course ID
     * @return Course object
     */
    @GetMapping("/getCourse/{courseID}")
    public ResponseEntity<Course> getCourse(@PathVariable("courseID") Long id) {
        try {
            // Use the repository to find the course by ID
            Optional<Course> courseOptional = courseRepository.findById(id);
            // Check to make sure record exists
            if (courseOptional.isPresent()) {
                Course course = courseOptional.get();
                return ResponseEntity.ok(course);
            } else {
                // Return 404 if course not found
                return ResponseEntity.notFound().build();
            }
            // Exception Handler
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
            List<Course> courses = courseRepository.findByCourseProfessorId(iId);

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

}