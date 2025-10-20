package org.mentats.mentat.exceptions;

/**
 * This is the Exam Deletion Exception Handler class
 * for Rest Controllers. This will handle this exception
 * in Rest Controllers when called.
 * @author Joshua Summers
 */
public class ExamDeletionException extends RuntimeException {
    public ExamDeletionException(String message) {
        super(message);
    }
}