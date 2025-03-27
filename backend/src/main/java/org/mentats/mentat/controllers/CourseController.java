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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/course")
public class CourseController {
    /**
     * CourseController Fields
     */
    private final CourseRepository courseRepository;
    private final AuthenticationManager authenticationManager;
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);


    /**
     * Course Controller Constructor
     * @param courseRepository
     */
    public CourseController(CourseRepository courseRepository, AuthenticationManager authenticationManager) {
        this.courseRepository = courseRepository;
        this.authenticationManager = authenticationManager;
    }

    /**
     * A method to creates a course and writes into the database.
     */
    @PostMapping("/createCourse")
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest courseRequest) {

        Course course = new Course(
                courseRequest.getCourseName(),
                courseRequest.getUserID(),
                courseRequest.getQuarter(),
                courseRequest.getSectionNumber(),
                courseRequest.getYear()
        );
        System.out.println("!!!!!Course successfully created");
        // Saving course into the database;
        courseRepository.save(course);
        return ResponseEntity.ok(new MessageResponse("Course created successfully"));
    }

    @GetMapping("/listCourses")
    public ResponseEntity<?> listCourses(@RequestParam String id) {
        System.out.println("Telmen Was here" + id);
        // Create Course List
        List<Course> courses = courseRepository.findByCourseProfessorId(id);

        // Empty check
        if (courses.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Return list of course by the Professor ID
        return ResponseEntity.ok(courses);
    }
}