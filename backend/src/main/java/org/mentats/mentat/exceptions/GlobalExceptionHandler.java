package org.mentats.mentat.exceptions;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.persistence.EntityNotFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * This is the Global Exception Handler class
 * for all Rest Controllers. This will capture
 * any exceptions from the controller and handle
 * them here according to the Exception you want
 * to handle
 * @author Joshua Summers
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        String rootMsg = ex.getMostSpecificCause().getMessage();
        String userMessage;

        if (rootMsg.contains("foreign key constraint") || rootMsg.contains("REFERENCES")) {
            userMessage = "Cannot delete this record because it is referenced by other records. " +
                    "Please delete the dependent records first.";
        } else {
            userMessage = "Database constraint violation.";
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", userMessage));
    }

    // Add other common exceptions here too
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", ex.getMessage()));
    }

    /**
     * Handle validation errors from @Valid annotations on request DTOs
     * Returns a map of field names to error messages
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String errorMessage = error.getDefaultMessage();
            if (error instanceof FieldError) {
                // Field-specific validation error
                String fieldName = ((FieldError) error).getField();
                errors.put(fieldName, errorMessage);
            } else {
                // Global/class-level validation error (ObjectError)
                String objectName = error.getObjectName();
                errors.put(objectName != null ? objectName : "global", errorMessage);
            }
        });
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Validation failed");
        response.put("message", "Invalid input provided");
        response.put("validationErrors", errors);
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ExamNotFoundException.class)
    public ResponseEntity<Void> handleExamNotFound(ExamNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Resource not found", "message", ex.getMessage()));
    }

    @ExceptionHandler(CourseNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleCourseNotFound(CourseNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Course not found", "message", ex.getMessage()));
    }

    @ExceptionHandler(ExamDeletionException.class)
    public ResponseEntity<?> handleExamDeletion(ExamDeletionException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(DuplicateRecordException.class)
    public ResponseEntity<?> handleDuplicateRecord(DuplicateRecordException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDataAccess(DataAccessException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Database error: " + e.getMessage());
    }

    @ExceptionHandler(ExamResultDeletionException.class)
    public ResponseEntity<?> handleExamResultDeletion(ExamResultDeletionException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(ExamResultNotFoundException.class)
    public ResponseEntity<?> handleExamResultNotFound(ExamResultNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    // Fallback for any other unhandled exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + e.getMessage());
    }
}