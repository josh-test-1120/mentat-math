package org.mentats.mentat.exceptions;

/**
 * This is the Validation Exception Handler class
 * for Rest Controllers. This will handle this exception
 * in Rest Controllers when called.
 * @author Joshua Summers
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
