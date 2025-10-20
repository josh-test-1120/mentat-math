package org.mentats.mentat.services;

import org.mentats.mentat.components.ExamResultValidator;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.mentats.mentat.repositories.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentReport {
    @Autowired
    private ExamResultRepository examResultRepository;
    private ExamRepository examRepository;

    @Autowired
    private ExamResultValidator validator;


}
