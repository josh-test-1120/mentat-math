package org.mentats.mentat.exceptions;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

    @ExceptionHandler(ExamNotFoundException.class)
    public ResponseEntity<Void> handleExamNotFound(ExamNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }
}