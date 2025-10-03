package org.mentats.mentat.services;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.components.CourseValidator;
import org.mentats.mentat.exceptions.CourseNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service class for handling course repository logic
 * @author Joshua Summers
 */
@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseValidator validator;

    /**
     * Create new Course object
     * @param course
     * @return Course object
     */
    // Create course
    public Course createCourse(Course course) {
        validator.validateForCreation(course);
        return courseRepository.save(course);
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
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
    }

    /**
     * Fetch all Course objects from the database
     * @return List of Course objects
     */
    // Read all courses
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /**
     * Fetch all Course objects by Professor Id from the database
     * @param professorId
     * @return List of Course objects
     */
    // Read courses by professor ID
    public List<Course> getCoursesByProfessorId(Long professorId) {
        validator.validateProfessorId(professorId);
        return courseRepository.findByCourseProfessorId(professorId);
    }

    /**
     * Fetch all Course objects by year and quarter
     * @param year
     * @param quarter
     * @return List of Course objects
     */
    // Read courses by year and quarter
    public List<Course> getCoursesByYearAndQuarter(Integer year, String quarter) {
        validator.validateYear(year);
        validator.validateQuarter(quarter);
        return courseRepository.findByCourseYearAndCourseQuarter(year, quarter);
    }

    /**
     * Fetch all Course objects by course name
     * @param courseName
     * @return List of Course objects
     */
    // Read courses by name
    public List<Course> getCoursesByName(String courseName) {
        validator.validateCourseName(courseName);
        return courseRepository.findByCourseNameContainingIgnoreCase(courseName);
    }

    /**
     * Fetch Course object by section, year, and quarter
     * @param section
     * @param year
     * @param quarter
     * @return Course object
     */
    // Read course by section, year, and quarter
    public Course getCourseBySectionYearQuarter(String section, Integer year, String quarter) {
        validator.validateSection(section);
        validator.validateYear(year);
        validator.validateQuarter(quarter);
        return courseRepository.findByCourseSectionAndCourseYearAndCourseQuarter(section, year, quarter)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with section: " + section +
                        ", year: " + year + ", quarter: " + quarter));
    }

    /**
     * Update the Course object
     * @param id
     * @param courseUpdates
     * @return Course object
     */
    // Update course
    public Course updateCourse(Long id, Course courseUpdates) {
        validator.validateCourseId(id);
        Course existing = getCourseById(id);

        validator.validateForUpdate(existing, courseUpdates);

        // Update only provided fields (partial update)
        if (courseUpdates.getCourseName() != null) {
            existing.setCourseName(courseUpdates.getCourseName());
        }
        if (courseUpdates.getCourseProfessorId() != null) {
            existing.setCourseProfessorId(courseUpdates.getCourseProfessorId());
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
        if (courseUpdates.getGradeStrategy() != null) {
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
     * @param section
     * @param year
     * @param quarter
     * @param excludeId
     * @return boolean
     */
    // Check uniqueness
    public boolean isCourseUnique(String section, Integer year, String quarter, Long excludeId) {
        return validator.isCourseUnique(section, year, quarter, excludeId);
    }
}