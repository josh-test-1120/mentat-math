package org.mentats.mentat.services;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.components.StudentCourseValidator;
import org.mentats.mentat.exceptions.ValidationException;
import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.StudentCourse;
import org.mentats.mentat.models.StudentCourseId;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.StudentCourseRequest;
import org.mentats.mentat.payload.response.CourseResponse;
import org.mentats.mentat.payload.response.StudentCourseResponse;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.repositories.StudentCourseRepository;
import org.mentats.mentat.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for handling student course repository logic
 * @author Joshua Summers
 */
@Service
public class StudentCourseService {
    // Repository services
    @Autowired
    private StudentCourseRepository studentCourseRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UserRepository userRepository;
    // Validator Service
    @Autowired
    private StudentCourseValidator validator;
    // Entity Foreign Keys
    private User student;
    private Course course;


    /**
     * Utility to load Foreign Keys
     */
    private void GetForeignKeyObjects(StudentCourseRequest studentCourseRequest) {
        // Find related entities
        course = courseRepository.findById(studentCourseRequest.getCourseId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with ID: " +
                                studentCourseRequest.getCourseId()));
        student = userRepository.findById(studentCourseRequest.getStudentId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with ID: " +
                                studentCourseRequest.getStudentId()));
    }
    // User only
    private void GetForeignKeyObjectsForStudent(Long studentID) {
        // Find related student entity
        student = userRepository.findById(studentID)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with ID: " + studentID));
    }
    // Course only
    private void GetForeignKeyObjectsForCourse(Long courseId) {
        // Find related student entity
        course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with ID: " + courseId));
    }

    /**
     * Enrolls a student in a course with proper transaction management
     * @param studentCourseRequest StudentCourseRequest
     * @throws ValidationException if validation fails
     * @throws IllegalArgumentException if course doesn't exist or student already enrolled
     */
    @Transactional
    public StudentCourseResponse joinCourse(StudentCourseRequest studentCourseRequest) {
        System.out.println("=== TRANSACTION STARTED ===");

        // Validate request data using validator
        validator.validateForCreation(studentCourseRequest);

        // Get referenced objects (FKs)
        GetForeignKeyObjects(studentCourseRequest);

        // Create the composite ID
        StudentCourseId id = new StudentCourseId(course.getCourseId(), student.getId());

        // Create entity
        StudentCourse studentCourse = new StudentCourse();
        studentCourse.setId(id);
        studentCourse.setCourse(course);
        studentCourse.setStudent(student);
        studentCourse.setStudentCourseGrade(studentCourseRequest.getStudentCourseGrade());
        studentCourse.setStudentDateRegistered(studentCourseRequest.getStudentDateRegistered());

        // Save and return response DTO
        StudentCourse saved = studentCourseRepository.save(studentCourse);
        return new StudentCourseResponse(saved);
    }

    /**
     * Checks if a student is enrolled in a course
     * @param studentCourseRequest StudentCourseRequest
     * @return true if enrolled, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(StudentCourseRequest studentCourseRequest) {
        // Get referenced objects (FKs)
        GetForeignKeyObjects(studentCourseRequest);
        // Validator that course exists
        validator.validateCourse(course);
        validator.validateStudent(student);

        return studentCourseRepository.existsById_CourseIdAndId_StudentId(course.getCourseId(),
                student.getId());
    }

    /**
     * Gets all enrollments for a specific course
     * @param studentCourseRequest StudentCourseRequest
     * @return List of StudentCourseResponse
     */
    public List<StudentCourseResponse> getCourseEnrollments(StudentCourseRequest studentCourseRequest) {
        // Get referenced objects (FKs)
        GetForeignKeyObjects(studentCourseRequest);
        // Validator that course exists
        validator.validateCourse(course);

        List<StudentCourse> existing =  studentCourseRepository.findById_CourseId(course.getCourseId());

        return existing.stream()
                .map(proj -> new StudentCourseResponse(
                        proj.getCourseId(),
                        proj.getStudentId(),
                        proj.getStudentCourseGrade(),
                        proj.getStudentDateRegistered()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Debug method to check all enrollments in database
     * @return List of all student enrollments
     */
    @Transactional(readOnly = true)
    public List<StudentCourseResponse> getAllEnrollments() {
        System.out.println("=== CHECKING ALL ENROLLMENTS IN DATABASE ===");
        List<StudentCourse> allEnrollments = studentCourseRepository.findAll();
        System.out.println("Total enrollments found: " + allEnrollments.size());
        for (StudentCourse enrollment : allEnrollments) {
            System.out.println("Enrollment: Course ID=" + enrollment.getCourseId() +
                    ", Student ID=" + enrollment.getStudentId() +
                    ", Date=" + enrollment.getStudentDateRegistered());
        }
        return allEnrollments.stream()
                .map(proj -> new StudentCourseResponse(
                        proj.getCourseId(),
                        proj.getStudentId(),
                        proj.getStudentCourseGrade(),
                        proj.getStudentDateRegistered()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Gets all courses a student is enrolled in
     * @param studentId student ID
     * @return List of CourseResponses
     */
    @Transactional(readOnly = true)
    public List<CourseResponse> getEnrolledCourses(Long studentId) {
        // Get referenced objects (FKs)
        GetForeignKeyObjectsForStudent(studentId);
        // Validator that student exists
        validator.validateStudent(student);

        // Get all enrollments for the student
        List<StudentCourse> enrollments = studentCourseRepository.findByIdStudentId(student.getId());

        // If no enrollments, return empty list
        if (enrollments.isEmpty()) return List.of();

        // Get all course IDs for the student
        List<Long> courseIds = enrollments.stream()
                .map(StudentCourse::getCourseId)
                .distinct()
                .toList();

        // Get all courses for the student
        List<Course> courses = courseRepository.findAllById(courseIds);

        return courses.stream()
                .map(proj -> new CourseResponse(
                        proj.getCourseId(),
                        proj.getCourseName(),
                        proj.getCourseProfessorId(),
                        proj.getCourseSection(),
                        proj.getCourseQuarter(),
                        proj.getCourseYear(),
                        proj.getGradeStrategy()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Gets all students that are enrolled in a course
     * based on the course ID
     * @param courseId course ID
     * @return List of CourseResponses
     */
    @Transactional(readOnly = true)
    public List<StudentCourseResponse> getEnrolledStudentsByCourse(Long courseId) {
        // Get referenced objects (FKs)
        GetForeignKeyObjectsForCourse(courseId);
        // Validator that student exists
        validator.validateCourse(course);

        // Get all enrollments for the student
        List<StudentCourse> enrollments = studentCourseRepository.findById_CourseId(course.getCourseId());

        System.out.println("Total enrollments found: " + enrollments.size());
        System.out.println("Total enrollments: " + enrollments.toString());

        // If no enrollments, return empty list
        if (enrollments.isEmpty()) return List.of();

        return enrollments.stream()
                .map(proj -> new StudentCourseResponse(
                        proj.getCourseId(),
                        proj.getStudentId(),
                        proj.getStudentCourseGrade(),
                        proj.getStudentDateRegistered()
                ))
                .collect(Collectors.toList());
    }
}
