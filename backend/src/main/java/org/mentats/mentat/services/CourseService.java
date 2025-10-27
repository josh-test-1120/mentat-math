package org.mentats.mentat.services;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.exceptions.DuplicateRecordException;
import org.mentats.mentat.exceptions.ValidationException;
import org.mentats.mentat.models.*;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.payload.response.CourseResponse;
import org.mentats.mentat.repositories.StudentCourseRepository;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.components.CourseValidator;
import org.mentats.mentat.exceptions.CourseNotFoundException;
import org.mentats.mentat.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for handling course repository logic
 * @author Joshua Summers
 */
@Service
public class CourseService {
    // Repository services
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private StudentCourseRepository studentCourseRepository;
    @Autowired
    private UserRepository userRepository;
    // Validator Service
    @Autowired
    private CourseValidator validator;
    // Entity Foreign Keys
    private User instructor;

    /**
     * Utility to load Foreign Keys
     */
    private void GetForeignKeyObjects(CourseRequest courseRequest) {
        // Find related entities
        instructor = userRepository.findById(courseRequest.getCourseProfessorId())
                .orElseThrow(() ->
                        new EntityNotFoundException("Course not found with ID: " +
                                courseRequest.getCourseProfessorId()));
    }

    /**
     * Create new Course object
     * @param courseRequest The course request containing course details
     * @return CourseResponse object with the created course data
     * @throws EntityNotFoundException if the referenced Course is not found
     * @throws ValidationException if the course request validation fails
     */
    // Create exam result
    @Transactional
    public CourseResponse createCourse(CourseRequest courseRequest) {
        // Run Validations
        validator.validateForCreation(courseRequest);

        // Get referenced objects (FKs)
        GetForeignKeyObjects(courseRequest);

        // Check for existing course
        boolean exists = courseRepository.existsById(courseRequest.getCourseId());
        if (exists) {
            throw new DuplicateRecordException("Course already exists");
        }

        // Create entity
        Course course = new Course();
        course.setInstructor(instructor);
        course.setCourseName(courseRequest.getCourseName());
        course.setCourseSection(courseRequest.getCourseSection());
        course.setCourseQuarter(courseRequest.getCourseQuarter());
        course.setCourseYear(courseRequest.getCourseYear());
        course.setGradeStrategy(courseRequest.getGradeStrategy());

        // Save and return response DTO
        Course saved = courseRepository.save(course);
        return new CourseResponse(saved);
    }

    /**
     * Fetch Course object by Id from database
     * @param id
     * @return Course object
     */
    // Read course by ID
    public Course getCourseById(Long id) {
        validator.validateCourseId(id);
        return courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course Id not found: " + id.toString()));
    }

    /**
     * Fetch all Course objects from the database
     * @return List of Course objects
     */
    // Read all courses
    public List<CourseResponse> getAllCourses() {
        List<Course> courses = courseRepository.findAll();

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
     * Fetch all Course objects by Professor Id from the database
     * @param courseProfessorId
     * @return List of Course objects
     */
    // Read courses by professor ID
    public List<CourseResponse> getCoursesByProfessorId(Long courseProfessorId) {
        validator.validateProfessorId(courseProfessorId);

        List<Course> projections = courseRepository.findByInstructor_Id(courseProfessorId);

        return projections.stream()
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
     * Fetch all Course objects by year and quarter
     * @param courseYear
     * @param courseQuarter
     * @return List of Course objects
     */
    // Read courses by year and quarter
    public List<CourseResponse> getCoursesByYearAndQuarter(Integer courseYear, String courseQuarter) {
        validator.validateYear(courseYear);
        validator.validateQuarter(courseQuarter);

        List<Course> courses = courseRepository.findByCourseYearAndCourseQuarter(courseYear, courseQuarter);

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
     * Fetch all Course objects by course name
     * @param courseName
     * @return List of Course objects
     */
    // Read courses by name
    public List<CourseResponse> getCoursesByName(String courseName) {
        validator.validateCourseName(courseName);

        List<Course> courses = courseRepository.findByCourseNameContainingIgnoreCase(courseName);

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
     * Fetch Course object by section, year, and quarter
     * @param courseSection
     * @param courseYear
     * @param courseQuarter
     * @return Course object
     */
    // Read course by section, year, and quarter
    public CourseResponse getCourseBySectionYearQuarter(String courseSection, Integer courseYear, String courseQuarter) {
        validator.validateSection(courseSection);
        validator.validateYear(courseYear);
        validator.validateQuarter(courseQuarter);
        Course existing = courseRepository.findByCourseSectionAndCourseYearAndCourseQuarter(courseSection, courseYear, courseQuarter)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with section: " + courseSection +
                        ", year: " + courseYear + ", quarter: " + courseQuarter));

        return new CourseResponse(existing);
    }

    /**
     * Update the Course object
     * @param id
     * @param courseUpdates
     * @return Course object
     */
    // Update course
    @Transactional
    public Course updateCourse(Long id, CourseRequest courseUpdates) {
        validator.validateCourseId(id);
        Course existing = getCourseById(id);

        validator.validateForUpdate(existing, courseUpdates);

        // Get referenced objects (FKs)
        GetForeignKeyObjects(courseUpdates);

        // Handle FK updates and cascades (if appropriate) *** TBD ***
        // Object Reference updates
        if (instructor != null) {
            existing.setInstructor(instructor);
        }

        // Update only provided fields (partial update)
        if (courseUpdates.getCourseName() != null) {
            existing.setCourseName(courseUpdates.getCourseName());
        }
        if (courseUpdates.getCourseSection() != null) {
            existing.setCourseSection(courseUpdates.getCourseSection());
        }
        if (courseUpdates.getCourseYear() != null) {
            existing.setCourseYear(courseUpdates.getCourseYear());
        }
        if (courseUpdates.getCourseQuarter() != null) {
            existing.setCourseQuarter(courseUpdates.getCourseQuarter());
        }
        if (courseUpdates.getGradeStrategy() != null && !courseUpdates.getGradeStrategy().isEmpty()) {
            existing.setGradeStrategy(courseUpdates.getGradeStrategy());
        }

        return courseRepository.save(existing);
    }

    /**
     * Update only the grade strategy of a course
     * @param id
     * @param gradeStrategy
     * @return Course object
     */
    // Update course grade strategy
    public Course updateCourseGradeStrategy(Long id, String gradeStrategy) {
        validator.validateCourseId(id);
        validator.validateGradeStrategy(gradeStrategy);

        Course existing = getCourseById(id);
        existing.setGradeStrategy(gradeStrategy);

        return courseRepository.save(existing);
    }

    /**
     * Delete the Course object by Id
     * @param id
     */
    // Delete course by ID
    public void deleteCourse(Long id) {
        validator.validateCourseId(id);
        Course existing = getCourseById(id);
        validator.validateDeleteOperation(existing);
        courseRepository.delete(existing);
    }

    /**
     * Check if course exists by ID
     * @param id
     * @return boolean
     */
    // Check if course exists
    public boolean courseExists(Long id) {
        return courseRepository.existsById(id);
    }

    /**
     * Check if course with same section, year, and quarter already exists
     * @param courseSection
     * @param courseYear
     * @param courseQuarter
     * @param excludeId
     * @return boolean
     */
    // Check uniqueness
    public boolean isCourseUnique(String courseSection, Integer courseYear, String courseQuarter, Long excludeId) {
        return validator.isCourseUnique(courseSection, courseYear, courseQuarter, excludeId);
    }
}