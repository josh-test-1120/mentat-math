package org.mentats.mentat.components;

import org.mentats.mentat.payload.request.ExamResultRequest;
import org.springframework.stereotype.Component;
import org.mentats.mentat.exceptions.ValidationException;
import org.mentats.mentat.models.ExamResult;

import java.util.Date;

/**
 * This is the validator functions for the Exam Result Repository services
 * @author Joshua Summers
 */
@Component
public class ExamResultValidator {
    // Exam Result Validator functions
    public void validateForCreation(ExamResultRequest examResult) {
        validateNotNull(examResult, "Exam result");
        validateRequiredFields(examResult);
        validateFieldFormats(examResult);
        validateBusinessRules(examResult);
    }

    // NEW METHOD: Validate exam result ID
    public void validateExamResultId(Long id) {
        if (id == null || id <= 0) {
            throw new ValidationException("Exam result ID must be a positive number");
        }
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

    public void validateStudentId(Long studentId) {
        if (studentId == null || studentId <= 0) {
            throw new ValidationException("Student ID must be a positive number");
        }
    }

    public void validateExamVersion(Integer examVersion) {
        if (examVersion == null || examVersion <= 0) {
            throw new ValidationException("Exam version must be a positive number");
        }
    }

    // NEW METHOD: Validate update operation
    public void validateForUpdate(ExamResult existing, ExamResultRequest updates) {
        if (updates.getExamTakenDate() != null &&
                updates.getExamTakenDate().before(existing.getExamScheduledDate())) {
            throw new ValidationException("Exam cannot be taken before scheduled date");
        }
        if (updates.getExamScore() != null) {
            validateScoreFormat(updates.getExamScore());
        }
    }

    // NEW METHOD: Validate delete operation
    public void validateDeleteOperation(ExamResult examResult) {
        System.out.println(examResult.toString());
        if (examResult.getExamTakenDate() != null) {
            throw new ValidationException("Cannot delete exam result after exam has been taken");
        }
    }

    // PRIVATE VALIDATION METHODS (keep existing ones)
    private void validateRequiredFields(ExamResultRequest examResult) {
        validateStudentId(examResult.getExamStudentId());
        validateExamId(examResult.getExamId());
        validateExamVersion(examResult.getExamVersion());
        validateScheduledDate(examResult.getExamScheduledDate());
    }

    private void validateFieldFormats(ExamResultRequest examResult) {
        validateScoreFormat(examResult.getExamScore());
    }

    private void validateBusinessRules(ExamResultRequest examResult) {
        if (examResult.getExamTakenDate() != null &&
                examResult.getExamTakenDate().before(examResult.getExamScheduledDate())) {
            throw new ValidationException("Exam cannot be taken before scheduled date");
        }
    }

    private void validateScheduledDate(Date scheduledDate) {
        if (scheduledDate == null) {
            throw new ValidationException("Exam scheduled date is required");
        }
        if (scheduledDate.before(new Date())) {
            throw new ValidationException("Exam scheduled date cannot be in the past");
        }
    }

    private void validateScoreFormat(String score) {
        if (score != null && score.length() > 1) {
            throw new ValidationException("Exam score must be a single character");
        }
    }

    private void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new ValidationException(fieldName + " cannot be null");
        }
    }
}