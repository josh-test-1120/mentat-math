package org.mentats.mentat.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ExamResultDeletionException extends RuntimeException {
    public ExamResultDeletionException(String message) {
        super(message);
    }
}