package org.mentats.mentat.components;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.exceptions.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * This is the validator functions for the Course Repository services
 * @author Joshua Summers
 */
@Component
public class CourseValidator {

    @Autowired
    private CourseRepository courseRepository;

    public void validateForCreation(CourseRequest course) {
        validateNotNull(course, "Course");
        validateRequiredFields(course);
        validateFieldFormats(course);
        validateBusinessRules(course);
        validateUniqueness(course, null);
    }

    public void validateCourseId(Long courseId) {
        if (courseId == null || courseId <= 0) {
            throw new ValidationException("Course ID must be a positive number");
        }
    }

    public void validateProfessorId(Long professorId) {
        if (professorId == null || professorId <= 0) {
            throw new ValidationException("Professor ID must be a positive number");
        }
    }

    public void validateCourseName(String courseName) {
        if (courseName == null || courseName.trim().isEmpty()) {
            throw new ValidationException("Course name is required");
        }
        if (courseName.length() > 50) {
            throw new ValidationException("Course name cannot exceed 50 characters");
        }
    }

    public void validateSection(String section) {
        if (section == null || section.trim().isEmpty()) {
            throw new ValidationException("Course section is required");
        }
        if (section.length() > 20) {
            throw new ValidationException("Course section cannot exceed 20 characters");
        }
    }

    public void validateYear(Integer year) {
        if (year == null) {
            throw new ValidationException("Course year is required");
        }
        if (year < 2000) {
            throw new ValidationException("Course year must be 2000 or later");
        }
        if (year > 2100) {
            throw new ValidationException("Course year cannot exceed 2100");
        }
    }

    public void validateQuarter(String quarter) {
        if (quarter == null || quarter.trim().isEmpty()) {
            throw new ValidationException("Course quarter is required");
        }
        if (quarter.length() > 20) {
            throw new ValidationException("Course quarter cannot exceed 20 characters");
        }
        // Validate quarter format (e.g., "Fall", "Winter", "Spring", "Summer")
        if (!isValidQuarter(quarter)) {
            throw new ValidationException("Course quarter must be a valid term (Fall, Winter, Spring, Summer)");
        }
    }

    public void validateGradeStrategy(String gradeStrategy) {
        // Grade Strategy can be null
//        if (gradeStrategy == null || gradeStrategy.trim().isEmpty()) {
//            throw new ValidationException("Grade strategy is required");
//        }
        if (gradeStrategy.length() > 10000) {
            throw new ValidationException("Grade strategy cannot exceed 10000 characters");
        }
    }

    public void validateForUpdate(Course existing, CourseRequest updates) {
        if (updates.getCourseName() != null) {
            validateCourseName(updates.getCourseName());
        }
        if (updates.getCourseProfessorId() != null) {
            validateProfessorId(updates.getCourseProfessorId());
        }
        if (updates.getCourseSection() != null) {
            validateSection(updates.getCourseSection());
        }
        if (updates.getCourseYear() != null) {
            validateYear(updates.getCourseYear());
        }
        if (updates.getCourseQuarter() != null) {
            validateQuarter(updates.getCourseQuarter());
        }
        if (updates.getGradeStrategy() != null) {
            validateGradeStrategy(updates.getGradeStrategy());
        }

        // Validate uniqueness for updates
        validateUniqueness(updates, existing.getCourseId());
    }

    public void validateDeleteOperation(Course course) {
        // Add any business rules for deletion
        // For example, check if there are enrolled students
        // or if the course has active exams
    }

    public boolean isCourseUnique(String section, Integer year, String quarter, Long excludeId) {
        boolean exists = courseRepository.existsByCourseSectionAndCourseYearAndCourseQuarter(section, year, quarter);

        if (exists) {
            if (excludeId != null) {
                // For updates, check if the existing record is the one we're updating
                Course existing = courseRepository.findByCourseSectionAndCourseYearAndCourseQuarter(section, year, quarter)
                        .orElse(null);
                return existing != null && existing.getCourseId().equals(excludeId);
            }
            return false;
        }
        return true;
    }

    // PRIVATE VALIDATION METHODS
    private void validateRequiredFields(CourseRequest course) {
        validateCourseName(course.getCourseName());
        validateProfessorId(course.getCourseProfessorId());
        validateSection(course.getCourseSection());
        validateYear(course.getCourseYear());
        validateQuarter(course.getCourseQuarter());
        validateGradeStrategy(course.getGradeStrategy());
    }

    private void validateFieldFormats(CourseRequest course) {
        // Additional format validations
        if (course.getCourseName() != null && course.getCourseName().contains("<script>")) {
            throw new ValidationException("Course name contains invalid characters");
        }
        if (course.getCourseSection() != null && !course.getCourseSection().matches("^[A-Za-z0-9\\-\\s]+$")) {
            throw new ValidationException("Course section contains invalid characters");
        }
    }

    private void validateBusinessRules(CourseRequest course) {
        // Business logic validation
        // Example: Validate that the quarter and year combination is not in the future
        // You can add more business rules here
    }

    private void validateUniqueness(CourseRequest course, Long excludeId) {
        if (!isCourseUnique(course.getCourseSection(), course.getCourseYear(), course.getCourseQuarter(), excludeId)) {
            throw new ValidationException("A course with the same section, year, and quarter already exists");
        }
    }

    private boolean isValidQuarter(String quarter) {
        String[] validQuarters = {"Fall", "Winter", "Spring", "Summer", "Autumn"};
        for (String validQuarter : validQuarters) {
            if (validQuarter.equalsIgnoreCase(quarter)) {
                return true;
            }
        }
        return false;
    }

    private void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new ValidationException(fieldName + " cannot be null");
        }
    }
}