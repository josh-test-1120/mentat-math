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

    /**
     * Create new ExamResult object
     * @param examResult
     * @return ExamResult object
     */
    // Create exam result
    public ExamResult createExamResult(ExamResult examResult) {
        validator.validateForCreation(examResult);
        return examResultRepository.save(examResult);
    }

    /**
     * Fetch the ExamResult object by Id
     * @param id
     * @return ExamResult object
     */
    // Read exam result
    public ExamResult getExamResultById(Long id) {
        validator.validateExamResultId(id);
        return examResultRepository.findById(id)
                .orElseThrow(() -> new ExamResultNotFoundException(id.toString()));
    }

    /**
     * Fetch all ExamResult objects from the database
     * @return List of ExamResult objects
     */
    // Read all exam results
    public List<ExamResult> getAllExamResults() {
        return examResultRepository.findAll();
    }

    /**
     * Fetch all ExamResult objects based on Student Id
     * @param studentId
     * @return List of ExamResult objects
     */
    // Read multiple exam results by Student ID
    public List<ExamResult> getExamResultsByStudent(Long studentId) {
        validator.validateStudentId(studentId);
        return examResultRepository.findByStudent_Id(studentId);
    }

    /**
     * Fetch all ExamResult objects based on Exam Id
     * @param examId
     * @return List of ExamResult objects
     */
    // Read multiple exam results by Exam ID
    public List<ExamResult> getExamResultsByExamId(Long examId) {
        validator.validateExamId(examId);
        return examResultRepository.findByExam_Id(examId);
    }

    /**
     * Fetch all ExamResult objects based on Exam Id and Exam Version
     * @param examId
     * @param examVersion
     * @return List of ExamResult objects
     */
    // Read multiple exam results by Exam ID and Version
    public List<ExamResult> getExamResultsByExamIdAndVersion(Long examId, Integer examVersion) {
        validator.validateExamId(examId);
        validator.validateExamVersion(examVersion);
        return examResultRepository.findByExam_IdAndExamVersion(examId, examVersion);
    }

    /**
     * Update ExamResult object in the database
     * @param id
     * @param examResultUpdates
     * @return ExamResult object
     */
    // Update exam result
    public ExamResult updateExamResult(Long id, ExamResult examResultUpdates) {
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

    /**
     * Delete the ExamResult from the database
     * @param id
     */
    // Delete exam result by id
    public void deleteExamResult(Long id) {
        validator.validateExamResultId(id);
        ExamResult existing = getExamResultById(id); // Validate existence
        validator.validateDeleteOperation(existing);
        examResultRepository.delete(existing);
    }

    /**
     * Delete the ExamResult objects based on the Student Id
     * @param studentId
     */
    // Delete exam results by student id
    public void deleteExamResultsByStudent(Long studentId) {
        validator.validateStudentId(studentId);
        examResultRepository.deleteByStudent_Id(studentId);
    }

    /**
     * Delete the ExamResult objects based on the Exam Id
     * @param examId
     */
    // Delete exam results by exam id
    public void deleteExamResultsByExam(Long examId) {
        validator.validateExamId(examId);
        examResultRepository.deleteByExam_Id(examId);
    }
}