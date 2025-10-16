package org.mentats.mentat.components;

import org.mentats.mentat.models.Exam;
import org.mentats.mentat.exceptions.ValidationException;
import org.mentats.mentat.payload.request.ExamRequest;
import org.springframework.stereotype.Component;

/**
 * This is the validator functions for the Exam Repository services
 * @author Joshua Summers
 */
@Component
public class ExamValidator {
    // Constants
    private static final int ONLINE_TRUE = 1;
    private static final int ONLINE_FALSE = 0;
    private static final int MAX_ONLINE_DURATION = 180;

    public void validateForCreation(ExamRequest examRequest) {
        validateNotNull(examRequest, "Exam");
        validateRequiredFields(examRequest);
        validateFieldFormats(examRequest);
        validateBusinessRules(examRequest);
    }

    public void validateExamId(Long examId) {
        if (examId == null || examId <= 0) {
            throw new ValidationException("Exam ID must be a positive number");
        }
    }

    public void validateCourseId(Long courseId) {
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

    public void validateForUpdate(Exam existing, ExamRequest updates) {
        if (updates.getExamName() != null) {
            validateExamName(updates.getExamName());
        }
        if (updates.getExamDuration() != null) {
            validateDuration(updates.getExamDuration());
        }
        if (updates.getExamCourseId() != null) {
            validateCourseId(updates.getExamCourseId());
        }
    }

    public void validateDeleteOperation(Exam exam) {
        if (Boolean.TRUE.equals(exam.getState())) {
            throw new ValidationException("Cannot delete an active exam. Deactivate it first.");
        }
    }

    // PRIVATE VALIDATION METHODS
    private void validateRequiredFields(ExamRequest examRequest) {
        validateCourseId(examRequest.getExamCourseId());
        validateExamName(examRequest.getExamName());
        validateDuration(examRequest.getExamDuration());

        if (examRequest.getExamState() == null) {
            throw new ValidationException("Exam state is required");
        }
        if (examRequest.getExamRequired() == null) {
            throw new ValidationException("Exam required status is required");
        }
        if (examRequest.getExamOnline() == null) {
            throw new ValidationException("Exam online status is required");
        }
    }

    private void validateFieldFormats(ExamRequest examRequest) {
        // Additional format validations can be added here
        if (examRequest.getExamName() != null && examRequest.getExamName().contains("<script>")) {
            throw new ValidationException("Exam name contains invalid characters");
        }
    }

    private void validateBusinessRules(ExamRequest examRequest) {
        // Check if exam is online (assuming 1 = online, 0 = offline)
        if (examRequest.getExamOnline() == ONLINE_TRUE
                && examRequest.getExamDuration() > MAX_ONLINE_DURATION) {
            throw new ValidationException("Online exams cannot exceed 3 hours (180 minutes)");
        }
    }

    private void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new ValidationException(fieldName + " cannot be null");
        }
    }
}
