package org.mentats.mentat.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ExamResultNotFoundException extends RuntimeException {
    public ExamResultNotFoundException(String message) {
        super(message);
    }
}