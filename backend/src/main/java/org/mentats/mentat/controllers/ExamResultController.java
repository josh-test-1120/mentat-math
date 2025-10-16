package org.mentats.mentat.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.exceptions.DataAccessException;
import org.mentats.mentat.exceptions.ExamResultDeletionException;
import org.mentats.mentat.exceptions.ExamResultNotFoundException;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.models.ExamResult;
import org.mentats.mentat.payload.request.ExamResultRequest;
import org.mentats.mentat.payload.response.ExamResultResponse;
import org.mentats.mentat.projections.ExamResultDetailsProjection;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.mentats.mentat.services.Database;
import org.mentats.mentat.services.ExamResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * Rest API Controller
 * Methods that drive and control api mappings
 * base URI is /api/
 */
@RestController
@RequestMapping("/api/exam/result")
public class ExamResultController {
    // Repository services
    @Autowired
    private final ExamResultRepository examResultRepository;

    // Service component
    @Autowired
    private final ExamResultService examResultService;

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
     * @return ResponseEntities of ExamResult
     */
    @GetMapping("/exam/{examID}")
    public ResponseEntity<List<ExamResult>> getExamResultsByExamId(@PathVariable("examID") Long eid) {
        try {
            // Use the repository to find exam results by exam ID
            List<ExamResult> examResults = examResultRepository.findByExam_Id(eid);
//            // Use the service to find the exam results by exam ID
//            List<ExamResult> examResults = examResultService.getExamResultsByExamId(eid);

            // Check if any exam results were found
            if (examResults != null && !examResults.isEmpty()) {
                return ResponseEntity.ok(examResults);
            } else {
                // Return 404 if no exam results found for this exam id
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get the exam result from the database
     * based on the exam result ID supplied in the URI
     * @return Single object that have has the exam details
     */
//    @GetMapping("/{examResultID}")
//    public Map<String, Object> getExamResult(@PathVariable("examResultID") Long erid) {
//        // SQL query to select from the 'exam' table where the student ID is present
//        String sql = "SELECT * \n" +
//                "FROM exam_result \n" +
//                "WHERE exam_result_id = ?;\n";
//        // list to store retrieved exam details
//        Map<String, Object> exam = new HashMap<>();
//
//        try (Connection conn = Database.getConnection();
//             PreparedStatement stmt = conn.prepareStatement(sql)) {
//
//            // Update the Query with the variables
//            stmt.setLong(1, erid);  // Set the exam ID
//
//            // Execute the query
//            ResultSet rs = stmt.executeQuery();
//
//            // Iterate through result set
//            while (rs.next()) {
//                exam.put("exam_student_id", rs.getInt("exam_student_id"));
//                exam.put("exam_required", rs.getInt("exam_required"));
//                exam.put("exam_version", rs.getInt("exam_version"));
//                exam.put("exam_taken_date", rs.getDate("exam_taken_date"));
//                exam.put("exam_score", rs.getString("exam_score"));
//                exam.put("exam_scheduled_date", rs.getDate("exam_scheduled_date"));
//                exam.put("exam_id", rs.getInt("exam_id"));
//                exam.put("exam_result_id", rs.getInt("exam_result_id"));
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        // Return the exam
//        System.out.println(exam);
//        return exam;
//    }

    @GetMapping("/{examResultID}")
    public ExamResultResponse getExamResult(@PathVariable("examResultID") Long erid) {
        // Use the ExamResultService to get the exam result by ID
        ExamResult examResult = examResultService.getExamResultById(erid);
        // Convert to Response DTO
        return new ExamResultResponse(examResult);
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

//    /**
//     * Get results from exam results table
//     * based on student Id
//     * @param sid Student Id
//     * @return ResponseEntity of ExamResults
//     */
//    @GetMapping("/user/{studentId}")
//    public ResponseEntity<List<ExamResult>> getExamResultByUserId(@PathVariable("studentId") Long sid) {
//        try {
//            // Use the repository to find exam results by student ID
//            List<ExamResult> examResults = examResultRepository.findByStudent_Id(sid);
//
//            // Check if any exam results were found
//            if (examResults != null && !examResults.isEmpty()) {
//                return ResponseEntity.ok(examResults);
//            } else {
//                // Return 404 if no exam results found for this student
//                return ResponseEntity.notFound().build();
//            }
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }

     /**
      * Get results from exam results table
      * based on student Id
      * @param sid Student Id
      * @return ResponseEntity of ExamResultResponse DTOs
      */
     @GetMapping("/user/{studentId}")
     public ResponseEntity<List<ExamResultResponse>> getExamResultByUserId(@PathVariable("studentId") Long sid) {
         // Use the service to find exam results by student ID
         List<ExamResult> examResults = examResultService.getExamResultsByStudent(sid);
         // Check if any exam results were found
         if (!examResults.isEmpty()) {
             List<ExamResultResponse> response = new ArrayList<>();
             for (ExamResult examResult : examResults) {
                 response.add(new ExamResultResponse(examResult));
             }
             return ResponseEntity.ok(response);
         } else {
             // Return 404 if no exam results found for this student
             return ResponseEntity.notFound().build();
         }
     }

//    /**
//     * Consolidated Exam Result query (for client performance)
//     * @param courseId
//     * @return
//     */
//    @GetMapping("/course/{courseId}")
//    public List<ExamResultDetailsProjection> getStudentExamResultsByCourseId(@PathVariable Long courseId) {
//        return examResultRepository.findResultDetailsByCourseId(courseId);
//    }

    /**
     * Get student exam_result records, with exam and course table information JOINED
     * Consolidated Exam Result query (for client performance)
     * @param courseId
     * @return List of ExamResultDetailsProjection
     */
    @GetMapping("/course/{courseId}")
    public List<ExamResultDetailsProjection> getStudentExamResultsByCourseId(@PathVariable Long courseId) {
        return examResultService.getExamResultsByCourseId(courseId);
    }

    /**
     * Consolidated Exam Result query (for client performance)
     * @param studentId
     * @return
     */
    @GetMapping("/grades/{studentId}")
    public List<ExamResultDetailsProjection> getStudentExamResultsByStudentId(@PathVariable Long studentId) {
        return examResultService.getExamResultsAndExamCourseByStudent(studentId);

    }

}
