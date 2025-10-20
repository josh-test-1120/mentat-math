package org.mentats.mentat.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * This is the Data Access Exception Handler class
 * for Rest Controllers. This will handle this exception
 * in Rest Controllers when called.
 * @author Joshua Summers
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class DataAccessException extends RuntimeException {
    public DataAccessException(String message) {
        super(message);
    }
}