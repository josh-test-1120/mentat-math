package org.mentats.mentat.exceptions;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for GlobalExceptionHandler
 * Tests exception handling and response formatting
 */
@DisplayName("GlobalExceptionHandler Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Should handle EntityNotFoundException with 404 status")
    void testHandleEntityNotFound() {
        // Given
        EntityNotFoundException exception = new EntityNotFoundException("User not found");

        // When
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleEntityNotFound(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Resource not found", response.getBody().get("error"));
        assertEquals("User not found", response.getBody().get("message"));
    }

    @Test
    @DisplayName("Should handle MethodArgumentNotValidException with field errors")
    void testHandleMethodArgumentNotValid_FieldErrors() {
        // Given
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        
        FieldError fieldError1 = new FieldError("ProfileUpdateRequest", "email", "Email must be valid");
        FieldError fieldError2 = new FieldError("ProfileUpdateRequest", "username", "Username is required");
        
        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(java.util.Arrays.asList(fieldError1, fieldError2));

        // When
        ResponseEntity<Map<String, Object>> response = 
                exceptionHandler.handleMethodArgumentNotValid(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Validation failed", response.getBody().get("error"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> validationErrors = (Map<String, String>) response.getBody().get("validationErrors");
        assertNotNull(validationErrors);
        assertEquals("Email must be valid", validationErrors.get("email"));
        assertEquals("Username is required", validationErrors.get("username"));
    }

    @Test
    @DisplayName("Should handle MethodArgumentNotValidException with ObjectError")
    void testHandleMethodArgumentNotValid_ObjectError() {
        // Given
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        
        ObjectError objectError = new ObjectError("ProfileUpdateRequest", "Global validation error");
        
        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(java.util.Arrays.asList(objectError));

        // When
        ResponseEntity<Map<String, Object>> response = 
                exceptionHandler.handleMethodArgumentNotValid(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        
        @SuppressWarnings("unchecked")
        Map<String, String> validationErrors = (Map<String, String>) response.getBody().get("validationErrors");
        assertNotNull(validationErrors);
        // Should use object name or "global" as key
        assertTrue(validationErrors.containsKey("ProfileUpdateRequest") || 
                  validationErrors.containsKey("global"));
    }

    @Test
    @DisplayName("Should handle ValidationException with 400 status")
    void testHandleValidation() {
        // Given
        ValidationException exception = new ValidationException("Invalid input data");

        // When
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleValidation(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid input data", response.getBody().get("error"));
    }

    @Test
    @DisplayName("Should handle CourseNotFoundException with 404 status")
    void testHandleCourseNotFound() {
        // Given
        CourseNotFoundException exception = new CourseNotFoundException("Course not found");

        // When
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleCourseNotFound(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Course not found", response.getBody().get("error"));
    }

    @Test
    @DisplayName("Should handle ExamNotFoundException with 404 status")
    void testHandleExamNotFound() {
        // Given
        ExamNotFoundException exception = new ExamNotFoundException("Exam not found");

        // When
        ResponseEntity<Void> response = exceptionHandler.handleExamNotFound(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Should handle DuplicateRecordException with 409 status")
    void testHandleDuplicateRecord() {
        // Given
        DuplicateRecordException exception = new DuplicateRecordException("Record already exists");

        // When
        ResponseEntity<?> response = exceptionHandler.handleDuplicateRecord(exception);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Record already exists", response.getBody());
    }
}

