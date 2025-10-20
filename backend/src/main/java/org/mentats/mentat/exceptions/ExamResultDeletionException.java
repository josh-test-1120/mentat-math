package org.mentats.mentat.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * This is the Exam Result Deletion Exception Handler class
 * for Rest Controllers. This will handle this exception
 * in Rest Controllers when called.
 * @author Joshua Summers
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class ExamResultDeletionException extends RuntimeException {
    public ExamResultDeletionException(String message) {
        super(message);
    }
}