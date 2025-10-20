package org.mentats.mentat.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.exceptions.*;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.payload.request.ExamRequest;
import org.mentats.mentat.payload.response.ExamResponse;
import org.mentats.mentat.repositories.ExamRepository;
import org.mentats.mentat.services.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Exam Rest API Controller
 * Methods that drive and control api mappings
 * base URI is /api/exam
 * @author Joshua Summers
 */
@RestController
@RequestMapping("/api/exam")
public class ExamController {
    // Repository services
    @Autowired
    private final ExamRepository examRepository;

    // Service component
    @Autowired
    private final ExamService examService;

    /**
     * Dependency Injection Constructor
     * @param examRepository
     */
    public ExamController(ExamRepository examRepository, ExamService examService) {
        this.examRepository = examRepository;
        this.examService = examService;
    }

    /**
     * Get all exams from the exam table
     * @return List of Exam Entities (Models)
     */
    @GetMapping("/")
    public ResponseEntity<List<ExamResponse>> getExams() {
        // Use the ExamService to get the exam based on the Course Id
        List<ExamResponse> response = examService.getAllExams();
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * Get exam from exam table
     * based on the exam Id
     * @return Exam Entity (Model) or null
     */
    @GetMapping("/{examId}")
    public ResponseEntity<ExamResponse> getExamsById(@PathVariable("examId") Long eid) {
        // Use the ExamService to get the exam based on the Course Id
        Exam exam = examService.getExamById(eid);
        ExamResponse response = new ExamResponse(exam);
        // Convert to Response DTO
        return ResponseEntity.ok(response);
    }

    /**
     * This will create a new entry in exam table
     * @param examRequest The new exam to create (request format)
     * @return ResponseEntity
     */
    @PostMapping("/create")
    public ResponseEntity<?> insertExam(@RequestBody ExamRequest examRequest) {
        try {
            // Save the new exam to database
            ExamResponse savedExam = examService.createExam(examRequest);

            // Return 201 Created status with the new resource
            return ResponseEntity.status(HttpStatus.CREATED).body(savedExam);
        }
        catch (DataAccessException e) {
            throw new DataAccessException("Database error while creating exam: " + e.getMessage());
        }
    }

    /**
     * Patch the exam in the database
     * based on the exam ID supplied in the URI
     * @param examUpdates JSON object of data
     * @param eid exam Id
     * @return ResponseEntity
     */
    @PatchMapping("/{examID}")
    public ResponseEntity<?> updateExam(@RequestBody ExamRequest examUpdates,
                                        @PathVariable("examID") Long eid) {
        try {
            // Use the service layer to handle the update
            Exam updatedExam = examService.updateExam(eid, examUpdates);

            // Convert to DTO/Response object for proper response (object-less)
            ExamResponse response = new ExamResponse(updatedExam);
            return ResponseEntity.ok(response);

        } catch (DataAccessException e) {
            throw new DataAccessException("Database error while updating exam: " + e.getMessage());
        } catch (EntityNotFoundException e) {
            throw new ExamResultNotFoundException("Exam not found with id: " + eid);
        }
    }

    /**
     * Get the exams from the database
     * based on the course ID supplied in the URI
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/course/{courseID}")
    public ResponseEntity<List<ExamResponse>> getExamsByCourseId(@PathVariable("courseID") Long cid) {
        // Use the ExamService to get the exam based on the Course Id
        List<ExamResponse> response = examService.getExamsByCourseId(cid);
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * Delete an exam from the exam table
     * @param eid Exam Id
     * @return ResponseEntity of operation
     */
    @DeleteMapping("/{examID}")
    public ResponseEntity<?> deleteExam(@PathVariable("examID") Long eid) {
        try {
            // Use the service layer to handle the deletion
            examService.deleteExam(eid);

            return ResponseEntity.ok().build();

        } catch (ExamResultNotFoundException e) {
            // Handle case where exam result is not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Exam not found with id: " + eid);

        } catch (Exception e) {
            // Handle other exceptions (constraint violations, etc.)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting exam: " + e.getMessage());
        }
    }
}