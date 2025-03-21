package org.mentats.mentat.controllers;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.security.jwt.AuthEntryPointJwt;
import org.mentats.mentat.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/course")
public class CourseController {
    /**
     * CourseController Fields
     */
    private final CourseRepository courseRepository;
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);


    /**
     * Course Controller Constructor
     * @param courseRepository
     */
    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    /**
     * A method to creates a course and writes into the database.
     */
    @PostMapping("/createCourse")
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest courseRequest,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            logger.error("User Details is NULL!!!!!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        Course course = new Course(
                courseRequest.getCourseName(),
                userDetails.getId().toString(),
                courseRequest.getQuarter(),
                courseRequest.getYear()
                );
        logger.error("Course successfully created");
        System.out.println("Course successfully created");
        // Saving course into the database;
        courseRepository.save(course);
        return ResponseEntity.ok(new MessageResponse("Course created successfully"));
    }
}
