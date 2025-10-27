package org.mentats.mentat.components;

import org.mentats.mentat.models.StudentCourse;
import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.StudentCourseRequest;
import org.mentats.mentat.repositories.StudentCourseRepository;
import org.mentats.mentat.exceptions.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * This is the validator functions for the StudentCourse Repository services
 * @author Joshua Summers
 */
@Component
public class StudentCourseValidator {

    @Autowired
    private StudentCourseRepository studentCourseRepository;

    public void validateForCreation(StudentCourseRequest studentCourse) {
        validateNotNull(studentCourse, "StudentCourse");
        validateRequiredFields(studentCourse);
        validateFieldFormats(studentCourse);
        validateBusinessRules(studentCourse);
        validateUniqueness(studentCourse, null);
    }

    public void validateCourse(Course course) {
        if (course == null) {
            throw new ValidationException("Course is required");
        }
        // You might want to add additional course validation here
        // For example, check if course is active, etc.
    }

    public void validateStudent(User student) {
        if (student == null) {
            throw new ValidationException("Student is required");
        }
        // Validate that the user is actually a student
        // You might want to check user role or type here
    }

    public void validateStudentCourseGrade(String grade) {
        if (grade != null && !grade.trim().isEmpty()) {
            // Validate grade format using the same regex pattern from the entity
            if (!grade.matches("^(A\\+|A|A-|B\\+|B|B-|C\\+|C|C-|D\\+|D|D-|F|INC|P|NP)$")) {
                throw new ValidationException(
                        "Invalid grade format. Must be one of: A+, A, A-, B+, B, B-, C+, C, C-, " +
                                "D+, D, D-, F, INC, P, NP");
            }
            if (grade.length() > 5) {
                throw new ValidationException("Grade cannot exceed 5 characters");
            }
        }
    }

    public void validateStudentDateRegistered(LocalDate dateRegistered) {
        if (dateRegistered == null) {
            throw new ValidationException("Registration date is required");
        }

        // Validate that registration date is not in the future
        if (dateRegistered.isAfter(LocalDate.now())) {
            throw new ValidationException("Registration date cannot be in the future");
        }

        // Validate that registration date is not too far in the past
        // (e.g., not before 2000)
        if (dateRegistered.getYear() < 2000) {
            throw new ValidationException("Registration date must be 2000 or later");
        }
    }

    public void validateForUpdate(StudentCourse existing, StudentCourseRequest updates) {
        if (updates.getCourseId() != null) {
            // For updates, course validation might be different
            // You might want to validate that the course exists
        }

        if (updates.getStudentId() != null) {
            // For updates, student validation might be different
            // You might want to validate that the student exists
        }

        if (updates.getStudentCourseGrade() != null) {
            validateStudentCourseGrade(updates.getStudentCourseGrade());
        }

        if (updates.getStudentDateRegistered() != null) {
            validateStudentDateRegistered(updates.getStudentDateRegistered());
        }

        // Validate uniqueness for updates (excluding current record)
        validateUniqueness(updates, existing.getCourseId(), existing.getStudentId());
    }

    public void validateDeleteOperation(StudentCourse studentCourse) {
        // Add any business rules for deletion
        // For example, check if the course has grades that shouldn't be deleted
        // or if there are related records that need to be handled
        if (studentCourse.getStudentCourseGrade() != null &&
                !studentCourse.getStudentCourseGrade().equals("INC")) {
            // Maybe prevent deletion of completed courses?
            // This is a business rule decision
        }
    }

    public boolean isStudentCourseUnique(Long courseId, Long studentId, Long excludeCourseId, Long excludeStudentId) {
        boolean exists = studentCourseRepository.existsById_CourseIdAndId_StudentId(courseId, studentId);

        if (exists) {
            if (excludeCourseId != null && excludeStudentId != null) {
                // For updates, check if the existing record is the one we're updating
                StudentCourse existing = studentCourseRepository.findById_CourseIdAndId_StudentId(courseId, studentId)
                        .orElse(null);
                return existing != null &&
                        existing.getCourseId().equals(excludeCourseId) &&
                        existing.getStudentId().equals(excludeStudentId);
            }
            return false;
        }
        return true;
    }

    // PRIVATE VALIDATION METHODS
    private void validateRequiredFields(StudentCourseRequest studentCourse) {
        // Validate that course and student IDs are provided
        if (studentCourse.getCourseId() == null) {
            throw new ValidationException("Course ID is required");
        }
        if (studentCourse.getStudentId() == null) {
            throw new ValidationException("Student ID is required");
        }
        if (studentCourse.getStudentDateRegistered() == null) {
            throw new ValidationException("Registration date is required");
        }

        // Validate IDs are positive
        if (studentCourse.getCourseId() <= 0) {
            throw new ValidationException("Course ID must be a positive number");
        }
        if (studentCourse.getStudentId() <= 0) {
            throw new ValidationException("Student ID must be a positive number");
        }
    }

    private void validateFieldFormats(StudentCourseRequest studentCourse) {
        // Additional format validations
        if (studentCourse.getStudentCourseGrade() != null) {
            // Remove any potential script tags or malicious content
            String grade = studentCourse.getStudentCourseGrade();
            if (grade.contains("<script>") || grade.contains("</script>")) {
                throw new ValidationException("Grade contains invalid characters");
            }
        }
    }

    private void validateBusinessRules(StudentCourseRequest studentCourse) {
        // Business logic validation
        // Example: Validate that student isn't already enrolled in too many courses
        // Validate that the course isn't full, etc.

        // You might want to check if the course is still open for registration
        // based on current date vs course start date
    }

    private void validateUniqueness(StudentCourseRequest studentCourse, Long excludeCourseId, Long excludeStudentId) {
        if (!isStudentCourseUnique(studentCourse.getCourseId(), studentCourse.getStudentId(), excludeCourseId, excludeStudentId)) {
            throw new ValidationException("This student is already enrolled in this course");
        }
    }

    // Overloaded method for creation (no exclusions)
    private void validateUniqueness(StudentCourseRequest studentCourse, Void unused) {
        validateUniqueness(studentCourse, null, null);
    }

    private void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new ValidationException(fieldName + " cannot be null");
        }
    }

    // Additional validation methods for specific use cases
    public void validateGradeUpdate(String newGrade, String currentGrade) {
        validateStudentCourseGrade(newGrade);

        // Business rules for grade updates
        // Example: Can't change a final grade once it's set to P/NP
        if (currentGrade != null && (currentGrade.equals("P") || currentGrade.equals("NP"))) {
            throw new ValidationException("Cannot modify P/NP grades once set");
        }

        // Example: Can't change from a letter grade to INC without approval
        if (currentGrade != null && currentGrade.matches("^[A-D][+-]?|F$") && newGrade.equals("INC")) {
            // This might require additional business logic or permissions
        }
    }
}