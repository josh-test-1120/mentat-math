package org.mentats.mentat.controllers;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.StudentCourse;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.payload.request.JoinCourseRequest;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.services.CourseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/course")
public class CourseController {
    /**
     * CourseController Fields
     */
    @Autowired
    private CourseService courseService;
    
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    /**
     * A method to creates a course and writes into the database.
     * @param courseRequest CourseRequest type object that masks request info
     * @return Returns message response.
     */
    @PostMapping("/createCourse")
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest courseRequest) {
        try {
            Course course = courseService.createCourse(courseRequest);
            System.out.println("Course successfully created: " + course.getCourseName());
            return ResponseEntity.ok(new MessageResponse("Course created successfully"));
        } catch (Exception e) {
            logger.error("Error creating course: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating course: " + e.getMessage()));
        }
    }

    /**
     * API Method for retrieving list of course with User ID
     * @param id String type user ID
     * @return Returns successful response with list of course information
     */
    @GetMapping("/listCourses")
    public ResponseEntity<?> listCourses(@RequestParam String id) {
        try {
            List<Course> courses = courseService.getCoursesByProfessorId(id);

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
     * @param req Join course request containing course ID and user ID
     * @return Response indicating success or failure
     */
    @PostMapping("/joinCourse")
    public ResponseEntity<?> joinCourse(@RequestBody JoinCourseRequest req) {
        try {
            courseService.joinCourse(req);
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
            List<StudentCourse> enrollments = courseService.getAllEnrollments();
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            logger.error("Error retrieving enrollments: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving enrollments: " + e.getMessage()));
        }
    }

}