package org.mentats.mentat.controllers;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.StudentCourse;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.payload.request.JoinCourseRequest;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.repositories.CourseEnrollmentRepository;
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
import java.time.LocalDateTime;

@RestController
@RequestMapping("/course")
public class CourseController {
    /**
     * CourseController Fields
     */
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final AuthenticationManager authenticationManager;
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);


    /**
     * Course Controller Constructor
     * @param courseRepository
     */
    public CourseController(CourseRepository courseRepository, AuthenticationManager authenticationManager, CourseEnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.authenticationManager = authenticationManager;
    }

    /**
     * A method to creates a course and writes into the database.
     * @param courseRequest CourseRequest type object that masks request info
     * @return Returns message response.
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

    /**
     * API Method for retrieving list of course with User ID
     * @param id String type user ID
     * @return Returns successful response with list of course information
     */
    @GetMapping("/listCourses")
    public ResponseEntity<?> listCourses(@RequestParam String id) {
        // Create Course List
        List<Course> courses = courseRepository.findByCourseProfessorId(id);

        // Empty check
        if (courses.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Return list of course by the Professor ID
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/joinCourse")
    public ResponseEntity<?> joinCourse(@RequestBody JoinCourseRequest req) {
        // Get course ID
        int cid = Integer.parseInt(req.getCourseId());
        int sid = Integer.parseInt(req.getUserId());
        System.out.println("Course ID: " + cid);
        System.out.println("\nStudent ID: " + sid);

        // Check if course exists
        if (!courseRepository.existsById(cid)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Course not found"));
        }
        // Check if student already joined course
        if (enrollmentRepository.existsByCourseIdAndStudentId(cid, sid)) {
            System.out.println("\nYO, the student already joined the course with " + cid + " " + sid + "\n\n");
            return ResponseEntity.ok(new MessageResponse("Already joined"));
        }
        // Local date time now
        LocalDateTime now = LocalDateTime.now();
        System.out.println("Now BABY: " + now);
        System.out.println("Course ID: " + cid);
        System.out.println("Student ID: " + sid);

        
        // Save student course
        StudentCourse studentCourse = enrollmentRepository.save(new StudentCourse(cid, sid, now));
        boolean lolzmaa = enrollmentRepository.existsByCourseIdAndStudentId(cid, sid);
        System.out.println("Did you enroll just now?: " + lolzmaa);
        return ResponseEntity.ok(new MessageResponse("Course joined successful!"));
    }

}