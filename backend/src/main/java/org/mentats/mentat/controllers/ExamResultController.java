package org.mentats.mentat.controllers;

import org.mentats.mentat.exceptions.DataAccessException;
import org.mentats.mentat.exceptions.ExamResultDeletionException;
import org.mentats.mentat.exceptions.ExamResultNotFoundException;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.models.ExamResult;
import org.mentats.mentat.projections.ExamResultDetailsProjection;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.mentats.mentat.services.Database;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
    private final ExamResultRepository examResultRepository;

    /**
     * Dependency Injection Constructor
     * @param examResultRepository
     */
    public ExamResultController(ExamResultRepository examResultRepository) {
        this.examResultRepository = examResultRepository;
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
    @GetMapping("/{examResultID}")
    public Map<String, Object> getExamResult(@PathVariable("examResultID") Long erid) {
        // SQL query to select from the 'exam' table where the student ID is present
        String sql = "SELECT * \n" +
                "FROM exam_result \n" +
                "WHERE exam_result_id = ?;\n";
        // list to store retrieved exam details
        Map<String, Object> exam = new HashMap<>();

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            // Update the Query with the variables
            stmt.setLong(1, erid);  // Set the exam ID

            // Execute the query
            ResultSet rs = stmt.executeQuery();

            // Iterate through result set
            while (rs.next()) {
                exam.put("exam_student_id", rs.getInt("exam_student_id"));
                exam.put("exam_required", rs.getInt("exam_required"));
                exam.put("exam_version", rs.getInt("exam_version"));
                exam.put("exam_taken_date", rs.getDate("exam_taken_date"));
                exam.put("exam_score", rs.getString("exam_score"));
                exam.put("exam_scheduled_date", rs.getDate("exam_scheduled_date"));
                exam.put("exam_id", rs.getInt("exam_id"));
                exam.put("exam_result_id", rs.getInt("exam_result_id"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Return the exam
        System.out.println(exam);
        return exam;
    }

    /**
     * Patch the exam result in the database
     * based on the exam result ID supplied in the URI
     * @param examUpdates JSON object of data
     * @param eid exam result Id
     * @return ResponseEntity
     */
    @PatchMapping("/{examResultID}")
    public ResponseEntity<?> updateExamResult(@RequestBody ExamResult examUpdates, @PathVariable("examResultID") Long eid) {
        try {
            // Find the existing exam
            ExamResult existingExamResult = examResultRepository.findById(eid)
                    .orElseThrow(() -> new ExamResultNotFoundException("Exam not found with id: " + eid));

            // Update fields directly
            updateExamFields(existingExamResult, examUpdates);

            // Save the updated exam to database
            ExamResult savedExam = examResultRepository.save(existingExamResult);

            // The @Transactional annotation will automatically save changes when method completes
            return ResponseEntity.ok(savedExam);

        } catch (DataAccessException e) {
            throw new DataAccessException("Database error while updating exam: " + e.getMessage());
        }
    }

    // Helper method to update fields
    private void updateExamFields(ExamResult existing, ExamResult updates) {
        if (updates.getExamScheduledDate() != null)
            existing.setExamScheduledDate(updates.getExamScheduledDate());
        if (updates.getExamTakenDate() != null)
            existing.setExamTakenDate(updates.getExamTakenDate());
        if (updates.getExamScore() != null) existing.setExamScore(updates.getExamScore());
        if (updates.getExamVersion() != null) existing.setExamVersion(updates.getExamVersion());
//        if (updates.getExam() != null) existing.setExam(updates.getExam());
//        if (updates.getStudent() != null) existing.setStudent(updates.getStudent());
    }

    /**
     * Delete the exam result from the database
     * based on the exam result ID supplied in the URI
     * @return JSON encoded ok
     */
    @DeleteMapping("/{examResultID}")
    public void deleteExamResult(@PathVariable("examResultID") Long erid) {
        // SQL query to select from the 'exam' table where the student ID is present
        String sql = "DELETE FROM exam_result \n" +
                "WHERE exam_result_id = ?;\n";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            // Update the Query with the variables
            stmt.setLong(1, erid);  // Set the exam ID

            // Update the database
            int affectedRows = stmt.executeUpdate();

            if (affectedRows == 0) {
                throw new ExamResultNotFoundException("Exam result not found with id: " + erid);
            }

        } catch (SQLException e) {
            // Handle database errors
            if (e.getSQLState().startsWith("23")) { // Foreign key constraint violation
                throw new ExamResultDeletionException(
                        "Cannot delete exam result: It is referenced by other records"
                );
            } else {
                throw new DataAccessException("Database error while deleting exam result: " + e.getMessage());
            }
        }
    }

    /**
     * Get results from exam results table
     * based on student Id
     * @param sid Student Id
     * @return ResponseEntity of ExamResults
     */
    @GetMapping("/user/{studentId}")
    public ResponseEntity<List<ExamResult>> getExamResultByUserId(@PathVariable("studentId") Long sid) {
        try {
            // Use the repository to find exam results by student ID
            List<ExamResult> examResults = examResultRepository.findByStudent_Id(sid);

            // Check if any exam results were found
            if (examResults != null && !examResults.isEmpty()) {
                return ResponseEntity.ok(examResults);
            } else {
                // Return 404 if no exam results found for this student
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Consolidated Exam Result query (for client performance)
     * @param courseId
     * @return
     */
    @GetMapping("/course/{courseId}")
    public List<ExamResultDetailsProjection> getStudentExamResultsByCourseId(@PathVariable Long courseId) {
        return examResultRepository.findResultDetailsByCourseId(courseId);
    }

    /**
     * Consolidated Exam Result query (for client performance)
     * @param studentId
     * @return
     */
    @GetMapping("/grades/{studentId}")
    public List<ExamResultDetailsProjection> getStudentExamResultsByStudentId(@PathVariable Long studentId) {
        return examResultRepository.findResultDetailsByStudentId(studentId);
    }

}

