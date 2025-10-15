package org.mentats.mentat.controllers;

import org.mentats.mentat.exceptions.*;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.repositories.ExamRepository;
import org.mentats.mentat.services.Database;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/**
 * Rest API Controller
 * Methods that drive and control api mappings
 * base URI is /api/
 */
@RestController
@RequestMapping("/api/exam")
public class ExamController {
    private final ExamRepository examRepository;

    /**
     * Dependency Injection Constructor
     * @param examRepository
     */
    public ExamController(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    /**
     * Get all exams from the exam table
     * @return List of Exam Entities (Models)
     */
    @GetMapping("/")
    public List<Exam> getExams() {
        return examRepository.findAll();
    }

    /**
     * Get exam from exam table
     * based on the exam Id
     * @return Exam Entity (Model) or null
     */
    @GetMapping("/{examId}")
    public Optional<Exam> getExamsById(@PathVariable("examId") Long eid) {
        return examRepository.findById(eid);
    }

    /**
     * Patch the exam in the database
     * based on the exam ID supplied in the URI
     * @param examUpdates JSON object of data
     * @param eid exam Id
     * @return ResponseEntity
     */
    @PatchMapping("/{examID}")
    public ResponseEntity<?> updateExam(@RequestBody Exam examUpdates, @PathVariable("examID") Long eid) {
        try {
            // Find the existing exam
            Exam existingExam = examRepository.findById(eid)
                    .orElseThrow(() -> new ExamResultNotFoundException("Exam not found with id: " + eid));

            // Update fields directly
            updateExamFields(existingExam, examUpdates);

            // Save the updated exam to database
            Exam savedExam = examRepository.save(existingExam);

            // The @Transactional annotation will automatically save changes when method completes
            return ResponseEntity.ok(savedExam);

        } catch (DataAccessException e) {
            throw new DataAccessException("Database error while updating exam: " + e.getMessage());
        }
    }

    // Helper method to update fields
    private void updateExamFields(Exam existing, Exam updates) {
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getState() != null) existing.setState(updates.getState());
        if (updates.getRequired() != null) existing.setRequired(updates.getRequired());
        if (updates.getDifficulty() != null) existing.setDifficulty(updates.getDifficulty());
        if (updates.getDuration() != null) existing.setDuration(updates.getDuration());
        if (updates.getOnline() != null) existing.setOnline(updates.getOnline());
    }

    /**
     * Get the exams from the database
     * based on the course ID supplied in the URI
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/course/{courseID}")
    public List<Exam> getExamsByCourseId(@PathVariable("courseID") Long cid) {
        return examRepository.findByCourse_CourseId(cid);
    }

    /**
     * Delete an exam from the exam table
     * @param eid Exam Id
     * @return ResponseEntity of operation
     */
    @DeleteMapping("/{examID}")
    public ResponseEntity<Void> deleteExam(@PathVariable("examID") Long eid) {
        examRepository.deleteById(eid);
        return ResponseEntity.ok().build();
    }

//    /**
//     * Delete the exam from the database
//     * based on the exam ID supplied in the URI
//     * @return JSON encoded ok
//     */
//    @DeleteMapping("/exam/{examID}")
//    public void deleteExam(@PathVariable("examID") Long eid) {
//        // SQL query to delete from the 'exam' table where the exam ID is present
//        String sql = "DELETE FROM exam \n" +
//                "WHERE exam_id = ?;\n";
//
//        try (Connection conn = Database.getConnection();
//             PreparedStatement stmt = conn.prepareStatement(sql)) {
//
//            // Update the Query with the variables
//            stmt.setLong(1, eid);  // Set the exam ID
//
//            // Update the database
//            int affectedRows = stmt.executeUpdate();
//
//            if (affectedRows == 0) {
//                throw new ExamResultNotFoundException("Exam not found with id: " + eid);
//            }
//
//        } catch (SQLException e) {
//            // Handle database errors
//            if (e.getSQLState().startsWith("23")) { // Foreign key constraint violation
//                throw new ExamResultDeletionException(
//                        "Cannot delete exam: It is referenced by other records"
//                );
//            } else {
//                throw new DataAccessException("Database error while deleting exam: " + e.getMessage());
//            }
//        }
//    }

    /**
     * Get the exams from the database
     * based on the student ID supplied in the URI
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/student/{studentID}")
    public List<Map<String, Object>> getStudentExams(@PathVariable("studentID") Long sid) {

        // SQL query to select from the 'exam' table where the student ID is present
        String sql = "SELECT * \n" +
                "FROM exam_result \n" +
                "WHERE exam_student_id = ?;\n";
        //// list to store retrieved exam details
        List<Map<String, Object>> exams = new ArrayList<>();

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            // Update the Query with the variables
            stmt.setLong(1, sid);  // Set the exam ID

            // Execute the query
            ResultSet rs = stmt.executeQuery();

            //iterates through result set
            while (rs.next()) {
                Map<String, Object> exam = new HashMap<>();
                exam.put("exam_version", rs.getInt("exam_version"));
                exam.put("exam_taken_date", rs.getDate("exam_taken_date"));
                exam.put("exam_score", rs.getString("exam_score"));
                exam.put("exam_scheduled_date", rs.getDate("exam_scheduled_date"));
                exam.put("exam_id", rs.getInt("exam_id"));
                exam.put("exam_result_id", rs.getInt("exam_result_id"));
                exams.add(exam);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Get the exam information for each result
        for (Map<String, Object> exam : exams) {
            // Get the exam ID
            Integer examID = Integer.parseInt(exam.get("exam_id").toString());
            // SQL query to select from the 'exam' table where the student ID is present
            String examsql = "SELECT * \n" +
                    "FROM exam \n" +
                    "WHERE exam_id = ?;\n";
            // Get the exam details
            try (Connection conn = Database.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(examsql)) {

                // Update the Query with the variables
                stmt.setInt(1, examID);  // Set the exam ID

                // Execute the query
                ResultSet rs = stmt.executeQuery();

                // Gets the record details if the exam exists
                if (rs.next()) {
                    exam.put("exam_state", rs.getInt("exam_state"));
                    exam.put("exam_required", rs.getInt("exam_required"));
                    exam.put("exam_difficulty", rs.getInt("exam_difficulty"));
                    exam.put("exam_name", rs.getString("exam_name"));
                    exam.put("exam_course_id", rs.getInt("exam_course_id"));
                    exam.put("exam_duration", rs.getString("exam_duration"));
                    exam.put("exam_online", rs.getInt("exam_online"));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            // Get the course ID
            Integer courseID = Integer.parseInt(exam.get("exam_course_id").toString());
            // SQL query to select from the 'exam' table where the student ID is present
            String coursesql = "SELECT * \n" +
                    "FROM course \n" +
                    "WHERE course_id = ?;\n";

            // Get the course details
            try (Connection conn = Database.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(coursesql)) {

                // Update the Query with the variables
                stmt.setInt(1, courseID);  // Set the exam ID

                // Execute the query
                ResultSet rs = stmt.executeQuery();

                // Gets the record details if the exam exists
                if (rs.next()) {
                    exam.put("exam_course_name", rs.getString("course_name"));
                    exam.put("course_professor_id", rs.getString("course_professor_id"));
                    exam.put("course_year", rs.getInt("course_year"));
                    exam.put("course_quarter", rs.getString("course_quarter"));
                    exam.put("course_section", rs.getString("course_section"));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        System.out.println(exams);
        // Return list of exams
        return exams;
    }

    /**
     * Get the instructor exams from the database
     * based on the instructor ID supplied in the URI
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/instructor/{instructorID}")
    public List<Map<String, Object>> getInstructorExams(@PathVariable("instructorID") Long id) {

        // SQL query to select from the 'course' table where the instructor ID is present
        String sql = "SELECT * \n" +
                "FROM course \n" +
                "WHERE course_professor_id = ?;\n";
        // list to store retrieved courses details
        List<Map<String, Object>> courses = new ArrayList<>();

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            // Update the Query with the variables
            stmt.setLong(1, id);  // Set the exam ID

            // Execute the query
            ResultSet rs = stmt.executeQuery();

            //iterates through result set
            while (rs.next()) {
                Map<String, Object> course = new HashMap<>();

                course.put("course_id", rs.getInt("course_id"));
                course.put("exam_course_name", rs.getString("course_name"));
                course.put("course_professor_id", rs.getInt("course_professor_id"));
                course.put("course_year", rs.getInt("course_year"));
                course.put("course_quarter", rs.getString("course_quarter"));
                course.put("course_section", rs.getString("course_section"));
                courses.add(course);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // list to store retrieved exam details
        List<Map<String, Object>> exams = new ArrayList<>();

        // Get the exam information for each result
        for (Map<String, Object> course : courses) {
            // Get the exam ID
            Integer courseID = Integer.parseInt(course.get("course_id").toString());
            // SQL query to select from the 'exam' table where the student ID is present
            String examsql = "SELECT * \n" +
                    "FROM exam \n" +
                    "WHERE exam_course_id = ?;\n";
            // Get the exam details
            try (Connection conn = Database.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(examsql)) {

                // Update the Query with the variables
                stmt.setInt(1, courseID);  // Set the exam ID

                // Execute the query
                ResultSet rs = stmt.executeQuery();

                //iterates through result set
                while (rs.next()) {
                    Map<String, Object> exam = new HashMap<>();

                    exam.put("exam_id", rs.getInt("exam_id"));
                    exam.put("exam_state", rs.getInt("exam_state"));
                    exam.put("exam_required", rs.getInt("exam_required"));
                    exam.put("exam_difficulty", rs.getInt("exam_difficulty"));
                    exam.put("exam_name", rs.getString("exam_name"));
                    exam.put("exam_course_id", rs.getInt("exam_course_id"));
                    exam.put("exam_duration", rs.getString("exam_duration"));
                    exam.put("exam_online", rs.getInt("exam_online"));
                    exam.put("exam_course_name", course.get("exam_course_name"));
                    exams.add(exam);
                }
                // Handle exception errors
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        // Return list of exams
        return exams;
    }



}
