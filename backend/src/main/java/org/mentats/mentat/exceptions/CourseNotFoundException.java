package org.mentats.mentat.exceptions;

/**
 * This is the Course Not Found Exception Handler class
 * for Rest Controllers. This will handle this exception
 * in Rest Controllers when called.
 * @author Joshua Summers
 */
public class CourseNotFoundException extends RuntimeException {
    public CourseNotFoundException(String message) {
        super("Course not found: " + message);
    }
}