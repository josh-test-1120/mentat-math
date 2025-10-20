package org.mentats.mentat.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


/**
 * This is the Exam Result Not Found Exception Handler class
 * for Rest Controllers. This will handle this exception
 * in Rest Controllers when called.
 * @author Joshua Summers
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ExamResultNotFoundException extends RuntimeException {
    public ExamResultNotFoundException(String message) {
        super(message);
    }
}