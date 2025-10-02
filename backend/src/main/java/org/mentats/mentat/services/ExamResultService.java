package org.mentats.mentat.services;

import org.mentats.mentat.exceptions.ExamResultNotFoundException;
import org.mentats.mentat.models.ExamResult;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.mentats.mentat.components.ExamResultValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Service class for handling exam result repository logic
 * @author Joshua Summers
 */
@Service
public class ExamResultService {

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private ExamResultValidator validator;

    // Create exam result
    public ExamResult createExamResult(ExamResult examResult) {
        validator.validateForCreation(examResult);
        return examResultRepository.save(examResult);
    }

    // Read exam result
    public ExamResult getExamResultById(Integer id) {
        validator.validateExamResultId(id);
        return examResultRepository.findById(id)
                .orElseThrow(() -> new ExamResultNotFoundException(id.toString()));
    }

    // Read all exam results
    public List<ExamResult> getAllExamResults() {
        return examResultRepository.findAll();
    }

    // Read multiple exam results by Student ID
    public List<ExamResult> getExamResultsByStudent(Integer studentId) {
        validator.validateStudentId(studentId);
        return examResultRepository.findByStudentId(studentId);
    }

    // Read multiple exam results by Exam ID
    public List<ExamResult> getExamResultsByExamId(Integer examId) {
        validator.validateExamId(examId);
        return examResultRepository.findByExamId(examId);
    }

    // Read multiple exam results by Exam ID and Version
    public List<ExamResult> getExamResultsByExamIdAndVersion(Integer examId, Integer examVersion) {
        validator.validateExamId(examId);
        validator.validateExamVersion(examVersion);
        return examResultRepository.findByExamIdAndExamVersion(examId, examVersion);
    }

    // Update exam result
    public ExamResult updateExamResult(Integer id, ExamResult examResultUpdates) {
        validator.validateExamResultId(id);
        ExamResult existing = getExamResultById(id); // Reuse your read method

        // Validate the updates before applying
        validator.validateForUpdate(existing, examResultUpdates);

        // Update only not null fields (partial update)
        if (examResultUpdates.getExamScore() != null) {
            existing.setExamScore(examResultUpdates.getExamScore());
        }
        if (examResultUpdates.getExamTakenDate() != null) {
            existing.setExamTakenDate(examResultUpdates.getExamTakenDate());
        }

        return examResultRepository.save(existing);
    }

    // Delete exam result by id
    public void deleteExamResult(Integer id) {
        validator.validateExamResultId(id);
        ExamResult existing = getExamResultById(id); // Validate existence
        validator.validateDeleteOperation(existing);
        examResultRepository.delete(existing);
    }

    // Delete exam results by student id
    public void deleteExamResultsByStudent(Integer studentId) {
        validator.validateStudentId(studentId);
        examResultRepository.deleteByStudentId(studentId);
    }

    // Delete exam results by exam id
    public void deleteExamResultsByExam(Integer examId) {
        validator.validateExamId(examId);
        examResultRepository.deleteByExamId(examId);
    }
}