package org.mentats.mentat.exceptions;

/**
 * This is the Duplicate Record Exception Handler class
 * for Rest Controllers. This will handle this exception
 * in Rest Controllers when called.
 * @author Joshua Summers
 */
public class DuplicateRecordException extends RuntimeException {
    public DuplicateRecordException(String message) {
        super(message);
    }
}
