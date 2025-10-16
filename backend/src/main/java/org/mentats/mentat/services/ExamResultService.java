package org.mentats.mentat.services;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.exceptions.ExamResultNotFoundException;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.models.ExamResult;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.ExamResultRequest;
import org.mentats.mentat.payload.response.ExamResultResponse;
import org.mentats.mentat.repositories.ExamRepository;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.mentats.mentat.components.ExamResultValidator;
import org.mentats.mentat.repositories.UserRepository;
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
    // Repository services
    @Autowired
    private ExamResultRepository examResultRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ExamRepository examRepository;
    // Validator Service
    @Autowired
    private ExamResultValidator validator;

    private User student;
    private Exam exam;

    /**
     * Utility to load Foreign Keys
     */
    private void GetForeignKeyObjects(ExamResultRequest examResultRequest) {
        // Find related entities
        student = userRepository.findById(examResultRequest.getExamStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        exam = examRepository.findById(examResultRequest.getExamId())
                .orElseThrow(() -> new EntityNotFoundException("Exam not found"));
    }

    /**
     * Create new ExamResult object
     * @param examResultRequest
     * @return ExamResult object
     */
    // Create exam result
    public ExamResultResponse createExamResult(ExamResultRequest examResultRequest) {
        // Run Validations
        validator.validateForCreation(examResultRequest);

        // Get referenced objects (FKs)
        GetForeignKeyObjects(examResultRequest);

        // Create entity
        ExamResult examResult = new ExamResult();
        examResult.setStudent(student);
        examResult.setExam(exam);
        examResult.setExamVersion(examResultRequest.getExamVersion());
        examResult.setExamScore(examResultRequest.getExamScore());
        examResult.setExamScheduledDate(examResultRequest.getExamScheduledDate());
        examResult.setExamTakenDate(examResultRequest.getExamTakenDate());

        // Save and return response DTO
        ExamResult saved = examResultRepository.save(examResult);
        return new ExamResultResponse(saved);
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
     * Update ExamResult object in the database with all fields
     * @param id
     * @param examResultRequest
     * @return ExamResult object
     */
    public ExamResult updateExamResult(Long id, ExamResultRequest examResultRequest) {
        // Validate the ID
        validator.validateExamResultId(id);
        // Get the existing record
        ExamResult existing = getExamResultById(id);

        // Validate the updates before applying
        validator.validateForUpdate(existing, examResultRequest);

        // Get referenced objects (FKs)
        GetForeignKeyObjects(examResultRequest);

        // Update all fields that are provided (partial update)
        if (examResultRequest.getExamScore() != null) {
            existing.setExamScore(examResultRequest.getExamScore());
        }
        if (examResultRequest.getExamTakenDate() != null) {
            existing.setExamTakenDate(examResultRequest.getExamTakenDate());
        }
        if (examResultRequest.getExamScheduledDate() != null) {
            existing.setExamScheduledDate(examResultRequest.getExamScheduledDate());
        }
        if (examResultRequest.getExamVersion() != null) {
            existing.setExamVersion(examResultRequest.getExamVersion());
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