package org.mentats.mentat.services;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.components.CourseValidator;
import org.mentats.mentat.exceptions.CourseNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * @param courseProfessorId
     * @return List of Course objects
     */
    // Read courses by professor ID
    public List<Course> getCoursesByProfessorId(Long courseProfessorId) {
        validator.validateProfessorId(courseProfessorId);
        return courseRepository.findByCourseProfessorId(courseProfessorId);
    }

    /**
     * Fetch all Course objects by year and quarter
     * @param courseYear
     * @param courseQuarter
     * @return List of Course objects
     */
    // Read courses by year and quarter
    public List<Course> getCoursesByYearAndQuarter(Integer courseYear, String courseQuarter) {
        validator.validateYear(courseYear);
        validator.validateQuarter(courseQuarter);
        return courseRepository.findByCourseYearAndCourseQuarter(courseYear, courseQuarter);
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
     * @param courseSection
     * @param courseYear
     * @param courseQuarter
     * @return Course object
     */
    // Read course by section, year, and quarter
    public Course getCourseBySectionYearQuarter(String courseSection, Integer courseYear, String courseQuarter) {
        validator.validateSection(courseSection);
        validator.validateYear(courseYear);
        validator.validateQuarter(courseQuarter);
        return courseRepository.findByCourseSectionAndCourseYearAndCourseQuarter(courseSection, courseYear, courseQuarter)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with section: " + courseSection +
                        ", year: " + courseYear + ", quarter: " + courseQuarter));
    }

    /**
     * Update the Course object
     * @param id
     * @param courseUpdates
     * @return Course object
     */
    // Update course
    @Transactional
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