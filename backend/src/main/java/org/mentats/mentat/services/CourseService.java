package org.mentats.mentat.services;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.StudentCourse;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.payload.request.JoinCourseRequest;
import org.mentats.mentat.repositories.CourseEnrollmentRepository;
import org.mentats.mentat.repositories.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service class for handling course-related business logic
 * All database operations are properly managed with @Transactional
 */
@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    /**
     * Creates a new course with transaction management
     * @param courseRequest Course creation request
     * @return Created course
     */
    @Transactional
    public Course createCourse(CourseRequest courseRequest) {
        System.out.println("CourseName in createCourse: " + courseRequest.getCourseName());
        System.out.println("Quarter in createCourse: " + courseRequest.getCourseQuarter());
        System.out.println("SectionNumber in createCourse: " + courseRequest.getCourseSection());
        System.out.println("Year in createCourse: " + courseRequest.getCourseYear());
        System.out.println("UserID in createCourse: " + courseRequest.getUserId());
        
        Course course = new Course(
                courseRequest.getCourseName(),
                courseRequest.getUserId(),
                courseRequest.getCourseQuarter(),
                courseRequest.getCourseSection(),
                courseRequest.getCourseYear()
        );
        
        System.out.println("Creating course: " + course.getCourseName());
        return courseRepository.save(course);
    }

    /**
     * Retrieves courses by professor ID
     * @param professorId Professor's user ID
     * @return List of courses
     */
    @Transactional(readOnly = true)
    public List<Course> getCoursesByProfessorId(String professorId) {
        return courseRepository.findByCourseProfessorId(professorId);
    }

    /**
     * Enrolls a student in a course with proper transaction management
     * @param req Join course request
     * @throws IllegalArgumentException if course doesn't exist or student already enrolled
     */
    @Transactional
    public void joinCourse(JoinCourseRequest req) {
        System.out.println("=== TRANSACTION STARTED ===");
        
        // Validate request data
        if (req.getCourseId() == null || req.getCourseId().trim().isEmpty()) {
            throw new IllegalArgumentException("Course ID cannot be null or empty");
        }
        if (req.getStudentId() == null || req.getStudentId().trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        
        System.out.println("Raw Course ID: '" + req.getCourseId() + "'");
        System.out.println("Raw User ID: '" + req.getStudentId() + "'");
        
        // Parse IDs
        int courseId = Integer.parseInt(req.getCourseId());
        int studentId = Integer.parseInt(req.getStudentId());
        
        System.out.println("Processing course join - Course ID: " + courseId + ", Student ID: " + studentId);

        // Check if course exists
        if (!courseRepository.existsById(courseId)) {
            System.out.println("ERROR: Course not found with ID: " + courseId);
            throw new IllegalArgumentException("Course not found with ID: " + courseId);
        }
        
        // Check if student already joined course
        if (enrollmentRepository.existsByCourseIdAndStudentId(courseId, studentId)) {
            System.out.println("Student already joined course");
            throw new IllegalArgumentException("Student already enrolled in this course");
        }
        
        // Create and save student course enrollment
        LocalDate now = LocalDate.now();
        StudentCourse studentCourse = new StudentCourse(courseId, studentId, now);
        
        System.out.println("Saving StudentCourse: " + studentCourse);
        System.out.println("Before save - Course ID: " + studentCourse.getCourseId());
        System.out.println("Before save - Student ID: " + studentCourse.getStudentId());
        System.out.println("Before save - Date: " + studentCourse.getStudentDateRegistered());
        
        StudentCourse saved = enrollmentRepository.save(studentCourse);
        
        System.out.println("After save - Course ID: " + saved.getCourseId());
        System.out.println("After save - Student ID: " + saved.getStudentId());
        System.out.println("After save - Date: " + saved.getStudentDateRegistered());
        System.out.println("After save - Grade: " + saved.getStudentCourseGrade());
        
        // Force flush to ensure data is written to database
        enrollmentRepository.flush();
        System.out.println("Data flushed to database");
        
        // Verify enrollment was successful
        boolean exists = enrollmentRepository.existsByCourseIdAndStudentId(courseId, studentId);
        System.out.println("Verification query result: " + exists);
        
        if (!exists) {
            System.out.println("ERROR: Failed to verify course enrollment after save");
            throw new RuntimeException("Failed to verify course enrollment after save");
        }
        
        System.out.println("=== TRANSACTION COMPLETED SUCCESSFULLY ===");
    }

    /**
     * Checks if a student is enrolled in a course
     * @param courseId Course ID
     * @param studentId Student ID
     * @return true if enrolled, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(int courseId, int studentId) {
        return enrollmentRepository.existsByCourseIdAndStudentId(courseId, studentId);
    }

    /**
     * Gets all enrollments for a specific course
     * @param courseId Course ID
     * @return List of student enrollments
     */
    @Transactional(readOnly = true)
    public List<StudentCourse> getCourseEnrollments(int courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    /**
     * Debug method to check all enrollments in database
     * @return List of all student enrollments
     */
    @Transactional(readOnly = true)
    public List<StudentCourse> getAllEnrollments() {
        System.out.println("=== CHECKING ALL ENROLLMENTS IN DATABASE ===");
        List<StudentCourse> allEnrollments = enrollmentRepository.findAll();
        System.out.println("Total enrollments found: " + allEnrollments.size());
        for (StudentCourse enrollment : allEnrollments) {
            System.out.println("Enrollment: Course ID=" + enrollment.getCourseId() + 
                             ", Student ID=" + enrollment.getStudentId() + 
                             ", Date=" + enrollment.getStudentDateRegistered());
        }
        return allEnrollments;
    }

    /**
     * Gets all courses a student is enrolled in
     * @param studentIdStr Student ID
     * @return List of courses
     */
    @Transactional(readOnly = true)
    public List<Course> getEnrolledCourses(String studentIdStr) {
        // Parse student ID
        int studentId = Integer.parseInt(studentIdStr);

        // Get all enrollments for the student
        List<StudentCourse> enrollments = enrollmentRepository.findByStudentId(studentId);

        // If no enrollments, return empty list
        if (enrollments.isEmpty()) return List.of();

        // Get all course IDs for the student
        List<Integer> courseIds = enrollments.stream()
                .map(StudentCourse::getCourseId)
                .distinct()
                .toList();

        // Get all courses for the student
        return courseRepository.findAllById(courseIds);
    }
}
