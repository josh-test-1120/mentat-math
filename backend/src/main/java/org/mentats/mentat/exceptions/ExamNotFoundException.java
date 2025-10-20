package org.mentats.mentat.exceptions;

/**
 * This is the Exam Not Found Exception Handler class
 * for Rest Controllers. This will handle this exception
 * in Rest Controllers when called.
 * @author Joshua Summers
 */
public class ExamNotFoundException extends RuntimeException {
    public ExamNotFoundException(String id) {
        super("Exam not found with id: " + id);
    }
}
