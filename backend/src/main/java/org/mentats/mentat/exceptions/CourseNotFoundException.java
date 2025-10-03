package org.mentats.mentat.exceptions;

public class CourseNotFoundException extends RuntimeException {
    public CourseNotFoundException(String message) {
        super("Course not found: " + message);
    }
}