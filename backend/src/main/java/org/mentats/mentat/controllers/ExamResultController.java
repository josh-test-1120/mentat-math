package org.mentats.mentat.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.exceptions.DataAccessException;
import org.mentats.mentat.exceptions.ExamResultNotFoundException;
import org.mentats.mentat.models.ExamResult;
import org.mentats.mentat.payload.request.ExamResultRequest;
import org.mentats.mentat.payload.request.ScheduleSummaryRequest;
import org.mentats.mentat.payload.response.ExamResultResponse;
import org.mentats.mentat.payload.response.ScheduleSummaryResponse;
import org.mentats.mentat.projections.ExamResultDetailsProjection;
import org.mentats.mentat.projections.ExamResultsDetailsWithUserProjection;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.mentats.mentat.services.ExamResultService;
import org.mentats.mentat.services.ReportsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Exam Result Rest API Controller
 * Methods that drive and control api mappings
 * base URI is /api/exam/result
 * @author Joshua Summers
 */
@RestController
@RequestMapping("/api/exam/result")
public class ExamResultController {
    private static final Logger logger = LoggerFactory.getLogger(ExamResultController.class);
    
    // Repository services
    @Autowired
    private final ExamResultRepository examResultRepository;

    // Service component
    @Autowired
    private final ExamResultService examResultService;
    
    @Autowired
    private ReportsService reportsService;

    /**
     * Dependency Injection Constructor
     * @param examResultRepository
     * @param examResultService
     */
    public ExamResultController(ExamResultRepository examResultRepository,
                                ExamResultService examResultService) {
        this.examResultRepository = examResultRepository;
        this.examResultService = examResultService;
    }

    /**
     * Get results from the exam results table
     * based on exam Id
     * @param eid Exam Id
     * @return ResponseEntity of ExamResultResponse DTOs
     */
    @GetMapping("/exam/{examID}")
    public ResponseEntity<List<ExamResultResponse>> getExamResultsByExamId(@PathVariable("examID") Long eid) {
        // Use the ExamResultService to get the exam result based on the Exam Id
        List<ExamResultResponse> response = examResultService.getExamResultsByExamId(eid);
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * Get the exam result from the database
     * based on the exam result ID supplied in the URI
     * @return Single object that have has the exam details
     */
    @GetMapping("/{examResultID}")
    public ResponseEntity<ExamResultResponse> getExamResult(@PathVariable("examResultID") Long erid) {
        // Use the ExamResultService to get the exam result by ID
        ExamResult examResult = examResultService.getExamResultById(erid);
        // Return the Exam Result with DTO transformation
        ExamResultResponse response = new ExamResultResponse(examResult);
        // Convert to Response DTO
        return ResponseEntity.ok(response);
    }

    /**
     * This will create a new entry in exam result table
     * @param examResultRequest The new examResult to create (request format)
     * @return ResponseEntity
     */
    @PostMapping("/create")
    public ResponseEntity<?> insertExamResult(@RequestBody ExamResultRequest examResultRequest) {
        try {
            // Save the new exam result to database
            ExamResultResponse savedExam = examResultService.createExamResult(examResultRequest);

            // Return 201 Created status with the new resource
            return ResponseEntity.status(HttpStatus.CREATED).body(savedExam);
        }
        catch (DataAccessException e) {
            throw new DataAccessException("Database error while creating exam: " + e.getMessage());
        }
    }

    /**
     * Patch the exam result in the database
     * based on the exam result ID supplied in the URI
     * @param examUpdates JSON object of data
     * @param eid exam result Id
     * @return ResponseEntity
     */
    @PatchMapping("/{examResultID}")
    public ResponseEntity<?> updateExamResult(@RequestBody ExamResultRequest examUpdates,
                                              @PathVariable("examResultID") Long eid) {
        System.out.println(examUpdates.toString());
        try {
            // Use the service layer to handle the update
            ExamResult updatedExamResult = examResultService.updateExamResult(eid, examUpdates);

            // Convert to DTO/Response object for proper response (object-less)
            ExamResultResponse response = new ExamResultResponse(updatedExamResult);
            return ResponseEntity.ok(response);

        } catch (DataAccessException e) {
            throw new DataAccessException("Database error while updating exam: " + e.getMessage());
        } catch (EntityNotFoundException e) {
            throw new ExamResultNotFoundException("Exam not found with id: " + eid);
        }
    }

    /**
     * Delete the exam result from the database
     * based on the exam result ID supplied in the URI
     * @return ResponseEntity with appropriate status
     */
    @DeleteMapping("/{examResultID}")
    public ResponseEntity<?> deleteExamResult(@PathVariable("examResultID") Long erid) {
        try {
            // Use the service layer to handle the deletion
            examResultService.deleteExamResult(erid);

            return ResponseEntity.ok().build();

        } catch (ExamResultNotFoundException e) {
            // Handle case where exam result is not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Exam result not found with id: " + erid);

        } catch (Exception e) {
            // Handle other exceptions (constraint violations, etc.)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting exam result: " + e.getMessage());
        }
    }

    /**
     * Get results from exam results table
     * based on student Id
     * @param sid Student Id
     * @return ResponseEntity of ExamResultResponse DTOs
     */
    @GetMapping("/user/{studentId}")
    public ResponseEntity<List<ExamResultResponse>> getExamResultByUserId(@PathVariable("studentId") Long sid) {
        // Use the ExamResultService to get the exam result based on the Exam Id
        List<ExamResultResponse> response = examResultService.getExamResultsByStudent(sid);
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * Get results from exam results table
     * based on student Id and exam Id
     * @param sid Student Id
     * @param eid Exam Id
     * @return ResponseEntity of ExamResultResponse DTOs
     */
    @GetMapping("/user/{studentId}/exam/{examId}")
    public ResponseEntity<List<ExamResultResponse>>
        getExamResultByUserIdAndExamId(@PathVariable("studentId") Long sid,
                                       @PathVariable("examId") Long eid) {
        // Use the ExamResultService to get the exam result based on the Exam Id
        List<ExamResultResponse> response = examResultService.getExamResultsByStudentIdAndExamId(sid, eid);
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * Get student exam_result records, with exam and course table information JOINED
     * Consolidated Exam Result query (for client performance)
     * @param courseId
     * @return List of ExamResultDetailsProjection
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ExamResultDetailsProjection>>
        getStudentExamResultsByCourseId(@PathVariable Long courseId) {
        // Use the ExamResultService to get the exam result based on the Exam Id
        List<ExamResultDetailsProjection> response =
                examResultService.getExamResultsByCourseId(courseId);
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * Consolidated Exam Result query (for client performance)
     * @param studentId
     * @return
     */
    @GetMapping("/grades/{studentId}")
    public ResponseEntity<List<ExamResultDetailsProjection>>
        getStudentExamResultsByStudentId(@PathVariable Long studentId) {
        // Use the ExamResultService to get the exam result and course by student Id
        List<ExamResultDetailsProjection> response =
                examResultService.getExamResultsAndExamCourseByStudent(studentId);
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * Consolidated Exam Result query (for client performance)
     * @param studentId
     * @return
     */
    @GetMapping("/instructor/{studentId}")
    public ResponseEntity<List<ExamResultsDetailsWithUserProjection>>
        getStudentExamResultsByStudentIdWithStudentDetails(@PathVariable Long studentId) {
        // Use the ExamResultService to get the exam result and course by student Id
        List<ExamResultsDetailsWithUserProjection> response =
                examResultService.getExamResultsAndExamCourseByStudentWithStudentDetails(studentId);
        // Convert to Response DTO
        return response.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(response);
    }

    /**
     * Get schedule summary
     * Returns statistics showing which students scheduled which exams on which dates
     * Only returns schedules for courses owned by the instructor if instructorId is provided
     * 
     * @param request ScheduleSummaryRequest containing optional filter parameters
     * @param instructorId Optional instructor ID from query parameter (takes precedence over request.instructorId)
     * @return ResponseEntity with list of ScheduleSummaryResponse
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getScheduleSummary(
            @ModelAttribute ScheduleSummaryRequest request,
            @RequestParam(required = false) Long instructorId) {
        try {
            // Set instructorId from query parameter if provided
            if (request == null) {
                request = new ScheduleSummaryRequest();
            }
            if (instructorId != null) {
                request.setInstructorId(instructorId);
            }
            
            logger.info("Fetching schedule summary with request: {}", request);
            
            List<ScheduleSummaryResponse> summary = reportsService.getScheduleSummary(request);
            
            if (summary == null || summary.isEmpty()) {
                logger.info("No scheduled exams found");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            logger.info("Successfully fetched {} summary entries", summary.size());
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            logger.error("Error fetching schedule summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching summary: " + e.getMessage());
        }
    }
}