package org.mentats.mentat.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class DataAccessException extends RuntimeException {
    public DataAccessException(String message) {
        super(message);
    }
}