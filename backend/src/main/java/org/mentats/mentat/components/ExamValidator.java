package org.mentats.mentat.components;

import org.mentats.mentat.models.Exam;
import org.mentats.mentat.exceptions.ValidationException;
import org.springframework.stereotype.Component;

/**
 * This is the validator functions for the Exam Repository services
 * @author Joshua Summers
 */
@Component
public class ExamValidator {

    public void validateForCreation(Exam exam) {
        validateNotNull(exam, "Exam");
        validateRequiredFields(exam);
        validateFieldFormats(exam);
        validateBusinessRules(exam);
    }

    public void validateExamId(Integer examId) {
        if (examId == null || examId <= 0) {
            throw new ValidationException("Exam ID must be a positive number");
        }
    }

    public void validateCourseId(Integer courseId) {
        if (courseId == null || courseId <= 0) {
            throw new ValidationException("Course ID must be a positive number");
        }
    }

    public void validateExamName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Exam name is required");
        }
        if (name.length() > 255) {
            throw new ValidationException("Exam name cannot exceed 255 characters");
        }
    }

    public void validateDuration(Double duration) {
        if (duration == null || duration <= 0) {
            throw new ValidationException("Exam duration must be a positive number");
        }
        if (duration > 480) { // 8 hours max
            throw new ValidationException("Exam duration cannot exceed 480 minutes");
        }
    }

    public void validateForUpdate(Exam existing, Exam updates) {
        if (updates.getName() != null) {
            validateExamName(updates.getName());
        }
        if (updates.getDuration() != null) {
            validateDuration(updates.getDuration());
        }
        if (updates.getCourseId() != null) {
            validateCourseId(updates.getCourseId());
        }
    }

    public void validateDeleteOperation(Exam exam) {
        if (Boolean.TRUE.equals(exam.getState())) {
            throw new ValidationException("Cannot delete an active exam. Deactivate it first.");
        }
    }

    // PRIVATE VALIDATION METHODS
    private void validateRequiredFields(Exam exam) {
        validateCourseId(exam.getCourseId());
        validateExamName(exam.getName());
        validateDuration(exam.getDuration());

        if (exam.getState() == null) {
            throw new ValidationException("Exam state is required");
        }
        if (exam.getRequired() == null) {
            throw new ValidationException("Exam required status is required");
        }
        if (exam.getOnline() == null) {
            throw new ValidationException("Exam online status is required");
        }
    }

    private void validateFieldFormats(Exam exam) {
        // Additional format validations can be added here
        if (exam.getName() != null && exam.getName().contains("<script>")) {
            throw new ValidationException("Exam name contains invalid characters");
        }
    }

    private void validateBusinessRules(Exam exam) {
        // Business logic validation
        if (Boolean.TRUE.equals(exam.getOnline()) && exam.getDuration() > 180) {
            throw new ValidationException("Online exams cannot exceed 3 hours (180 minutes)");
        }
    }

    private void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new ValidationException(fieldName + " cannot be null");
        }
    }
}
