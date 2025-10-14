package org.mentats.mentat.controllers;
import org.mentats.mentat.models.*;

import org.mentats.mentat.payload.request.ExamRequest;
import org.mentats.mentat.projections.ExamResultDetailsProjection;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.repositories.ExamRepository;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.mentats.mentat.services.Database;
import org.mentats.mentat.services.ReportDatabase;
import org.mentats.mentat.exceptions.DataAccessException;
import org.mentats.mentat.exceptions.ExamResultDeletionException;
import org.mentats.mentat.exceptions.ExamResultNotFoundException;


import java.sql.*;
import java.util.*;

/**
 * Rest API Controller
 * Methods that drive and control api mappings
 * base URI is /api/
 */
@RestController
@RequestMapping("/api")
public class HomeAPIController {
    // Repository services
    private final CourseRepository courseRepository;
    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;

    // Constructor for DI (Dependency Injection)
    public HomeAPIController(CourseRepository courseRepository,
                             ExamRepository examRepository,
                             ExamResultRepository examResultRepository) {
        this.courseRepository = courseRepository;
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
    }

    /**
     * Get the last exam ID from the database to increment
     * @return integer of last exam ID
     */
    @GetMapping("/lastExamID")
    public int findExam() {
        String sql = "SELECT MAX(exam_id) FROM exam;";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    int maxExamId = resultSet.getInt(1);
                    //System.out.println("Max exam ID: " + maxExamId);
                    return maxExamId;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1; // return a sentinel value if no result is found or an error occurs
    }
    /**
     * Create a new exam
     * @param exam an exam object that reflects the exam attributes
     * @return String of the exam results
     */
    @PostMapping("/createExam")
    public String createExam(
            @RequestBody ExamRequest exam) {

        int examID = findExam() +1;
        String sql = "INSERT INTO exam (exam_id, exam_name, exam_state, exam_required, exam_difficulty, exam_course_id) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        // Assuming exam_id is auto-incremented by the database
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            statement.setInt(1, examID);  // Set to 0 if auto-incremented
            statement.setString(2, exam.getExam_name());
            statement.setBoolean(3, exam.getIs_published());
            statement.setBoolean(4, exam.getIs_required());
            statement.setInt(5, exam.getExam_difficulty());
            statement.setInt(6, exam.getExam_course_id());

            int rows = statement.executeUpdate();

            if (rows > 0) { return "Exam created successfully"; }
            else { return "Exam could not be created"; }

        } catch (SQLException e) {
            e.printStackTrace();
            return "Database error: " + e.getMessage();
        }
    }

    /**
     * Get the courses from the database
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/courses")
    public List<Map<String, Object>> getCourses() {

        // SQL query to select from the 'course' table
        String sql = "SELECT * \n" +
                "FROM course; \n";
        //// list to store retrieved course details
        List<Map<String, Object>> courses = new ArrayList<>();

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            //iterates through result set
            while (rs.next()) {
                Map<String, Object> course = new HashMap<>();
                course.put("course_id", rs.getInt("course_id"));
                course.put("course_name", rs.getString("course_name"));
                course.put("course_professor_id", rs.getInt("course_professor_id"));
                course.put("course_year", rs.getInt("course_year"));
                course.put("course_quarter", rs.getString("course_quarter"));
                course.put("course_section", rs.getString("course_section"));
                courses.add(course);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Returns list of courses
        return courses;
    }


    /**
     * Exam calls
     */

    /**
     * Get all exams from the exam table
     * @return List of Exam Entities (Models)
     */
    @GetMapping("/exam")
    public List<Exam> getExams() {
        return examRepository.findAll();
    }

    /**
     * Get exam from exam table
     * based on the exam Id
     * @return Exam Entity (Model) or null
     */
    @GetMapping("/exam/{examId}")
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
    @PatchMapping("/exam/{examID}")
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
     * Get exams from the exam table
     * by course Id
     * @param cid Course Id
     * @return ResponseEntity of Exams
     */
//    @GetMapping("/exam/course/{courseID}")
//    public ResponseEntity<List<Exam>> getExamsByInstructorId(@PathVariable("courseID") Long cid) {
//        try {
//            // Use the repository to find courses by instructor ID
//            List<Exam> exams = examRepository.findByCourse_CourseId(cid);
//
//            // Check if any courses were found
//            if (exams != null && !exams.isEmpty()) {
//                return ResponseEntity.ok(exams);
//            } else {
//                // Return 404 if no courses found for this instructor
//                return ResponseEntity.notFound().build();
//            }
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }


    /**
     * These are the exam_result table calls
     */


    /**
     * Get results from the exam results table
     * based on exam Id
     * @param eid Exam Id
     * @return ResponseEntities of ExamResult
     */
    @GetMapping("/exam/result/exam/{examID}")
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




//    /**
//     * Get the exam from the database
//     * based on the exam ID supplied in the URI
//     * @return Single object that have has the exam details
//     */
//    @GetMapping("/exam/{examID}")
//    public Map<String, Object> getExamDetails(@PathVariable("examID") Long eid) {
//        // SQL query to select from the 'exam' table where the student ID is present
//        String sql = "SELECT * \n" +
//                "FROM exam \n" +
//                "WHERE exam_id = ?;\n";
//        // list to store retrieved exam details
//        Map<String, Object> exam = new HashMap<>();
//
//        try (Connection conn = Database.getConnection();
//             PreparedStatement stmt = conn.prepareStatement(sql)) {
//
//            // Update the Query with the variables
//            stmt.setLong(1, eid);  // Set the exam ID
//
//            // Execute the query
//            ResultSet rs = stmt.executeQuery();
//
//            // Iterate through result set
//            while (rs.next()) {
//                exam.put("exam_state", rs.getBoolean("exam_state"));
//                exam.put("exam_required", rs.getBoolean("exam_required"));
//                exam.put("exam_difficulty", rs.getInt("exam_difficulty"));
//                exam.put("exam_course_id", rs.getInt("exam_course_id"));
//                exam.put("exam_name", rs.getString("exam_name"));
//                exam.put("exam_duration", rs.getDouble("exam_duration"));
//                exam.put("exam_online", rs.getBoolean("exam_online"));
//                exam.put("exam_id", rs.getInt("exam_id"));
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//
//        // Return the exam
//        System.out.println(exam);
//        return exam;
//    }

//    /**
//     * Patch the exam in the database
//     * based on the exam ID supplied in the URI
//     * @return JSON encoded ok
//     */
//    @PatchMapping("/exam/{examID}")
//    public void updateExam(@RequestBody Exam exam, @PathVariable("examID") Long eid) {
//        String sql = "UPDATE exam \n" +
//                "SET exam_name=?, exam_state=?, exam_required=?, " +
//                "exam_difficulty=?, exam_duration=?, exam_online=? \n" +
//                "WHERE exam_id = ?;\n";
//
//        System.out.println(exam.toString());
//        // Assuming exam_id is auto-incremented by the database
//        try (Connection connection = Database.getConnection();
//             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
//
//            statement.setString(1, exam.getName());
//            statement.setInt(2, exam.getState());
//            statement.setInt(3, exam.getRequired());
//            statement.setInt(4, exam.getDifficulty());
//            statement.setDouble(5, exam.getDuration());
//            statement.setInt(6, exam.getOnline());
//            statement.setLong(7, eid);
//
//            int affectedRows = statement.executeUpdate();
//
//            if (affectedRows == 0) {
//                throw new ExamResultNotFoundException("Exam result not found with id: " + eid);
//            }
//
////            if (rows > 0) { return "Exam updated successfully"; }
////            else { return "Exam could not be updated"; }
//
//        } catch (SQLException e) {
//            e.printStackTrace();
////            return "Database error: " + e.getMessage();
//            // Handle database errors
//            if (e.getSQLState().startsWith("23")) { // Foreign key constraint violation
//                throw new ExamResultDeletionException(
//                        "Cannot delete exam result: It is referenced by other records"
//                );
//            } else {
//                throw new DataAccessException("Database error while deleting exam result: " + e.getMessage());
//            }
//        }
//    }

    /**
     * Delete the exam from the database
     * based on the exam ID supplied in the URI
     * @return JSON encoded ok
     */
    @DeleteMapping("/exam/{examID}")
    public void deleteExam(@PathVariable("examID") Long eid) {
        // SQL query to delete from the 'exam' table where the exam ID is present
        String sql = "DELETE FROM exam \n" +
                "WHERE exam_id = ?;\n";

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            // Update the Query with the variables
            stmt.setLong(1, eid);  // Set the exam ID

            // Update the database
            int affectedRows = stmt.executeUpdate();

            if (affectedRows == 0) {
                throw new ExamResultNotFoundException("Exam not found with id: " + eid);
            }

        } catch (SQLException e) {
            // Handle database errors
            if (e.getSQLState().startsWith("23")) { // Foreign key constraint violation
                throw new ExamResultDeletionException(
                        "Cannot delete exam: It is referenced by other records"
                );
            } else {
                throw new DataAccessException("Database error while deleting exam: " + e.getMessage());
            }
        }
    }

    /**
     * Get the exam result from the database
     * based on the exam result ID supplied in the URI
     * @return Single object that have has the exam details
     */
    @GetMapping("/exam/result/{examResultID}")
    public Map<String, Object> getExamResultDetails(@PathVariable("examResultID") Long erid) {
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
     * Delete the exam result from the database
     * based on the exam result ID supplied in the URI
     * @return JSON encoded ok
     */
    @DeleteMapping("/exam/result/{examResultID}")
    public void deleteExamResultDetails(@PathVariable("examResultID") Long erid) {
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
    @GetMapping("/exam/result/user/{studentId}")
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
     * Get the exams from the database
     * based on the student ID supplied in the URI
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/exams/{studentID}")
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
     * Get the exams from the database
     * based on the course ID supplied in the URI
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/exams/course/{courseID}")
    public List<Exam> getExamsByCourse(@PathVariable("courseID") Long cid) {
        return examRepository.findByCourse_CourseId(cid);
    }





    /**
     * Get the instructor exams from the database
     * based on the instructor ID supplied in the URI
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/exams/instructor/{instructorID}")
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

    /**
     * Get the instructor exams from the database
     * based on the instructor ID supplied in the URI
     * @return Map object that have {string, object} types
     */
    @GetMapping("/course/{courseID}")
    public ResponseEntity<Course> getCourse(@PathVariable("courseID") Long id) {
        try {
            // Use the repository to find the course by ID
            Optional<Course> courseOptional = courseRepository.findById(id);
            // Check to make sure record exists
            if (courseOptional.isPresent()) {
                Course course = courseOptional.get();
                return ResponseEntity.ok(course);
            } else {
                // Return 404 if course not found
                return ResponseEntity.notFound().build();
            }
        // Exception Handler
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get the courses from the database
     * based on the instructor ID supplied in the URI
     * @param iId Instructor Id
     * @return ResponseEntity of Courses
     */
    @GetMapping("/course/instructor/{instructorID}")
    public ResponseEntity<List<Course>> getCourseByInstructorId(@PathVariable("instructorID") Long iId) {
        try {
            // Use the repository to find courses by instructor ID
            List<Course> courses = courseRepository.findByCourseProfessorId(iId);

            // Check if any courses were found
            if (courses != null && !courses.isEmpty()) {
                return ResponseEntity.ok(courses);
            } else {
                // Return 404 if no courses found for this instructor
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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

    /**
     * Consolidated Exam Result query (for client performance)
     * @param courseId
     * @return
     */
    @GetMapping("/exam/result/course/{courseId}")
    public List<ExamResultDetailsProjection> getStudentExamResultsByCourseId(@PathVariable Long courseId) {
        return examResultRepository.findResultDetailsByCourseId(courseId);
    }

    /**
     * Return Exams from exam table
     * based on Course Id
     * @param courseId
     * @return
     */
    @GetMapping("/exam/course/{courseId}")
    public List<Exam> getExamResultsByCourseId(@PathVariable Long courseId) {
        return examRepository.findByCourse_CourseId(courseId);
    }



    /**
     * These parts of code need to be reviewed and potentially
     * removed
     */

//    /**
//     * Get the grades from the database
//     * where the exam state is 1 (published exams only)
//     * @return List of Map objects that have {string, object} types
//     */
//    @GetMapping("/grades/{studentID}")
//    public List<Map<String, Object>> getStudentGrades(@PathVariable("studentID") Long sid) {
//
//        // SQL query to select from the 'exam_result' table records assigned to student
//        String sql = "SELECT * \n" +
//                "FROM exam_result \n" +
//                "WHERE exam_student_id = ?;\n";
//
//        // List to store retrieved grade details
//        List<Map<String, Object>> grades = new ArrayList<>();
//
//        try (Connection conn = Database.getConnection();
//             PreparedStatement stmt = conn.prepareStatement(sql)) {
//
//            // Update the Query with the variables
//            stmt.setLong(1, sid);  // Set the exam ID
//
//            // Execute the query
//            ResultSet rs = stmt.executeQuery();
//
//            //iterates through result set
//            while (rs.next()) {
//                Map<String, Object> grade = new HashMap<>();
//                grade.put("exam_result_id", rs.getInt("exam_result_id"));
//                grade.put("exam_version", rs.getInt("exam_version"));
//                grade.put("exam_taken_date", rs.getDate("exam_taken_date"));
//                grade.put("exam_score", rs.getString("exam_score"));
//                grade.put("exam_scheduled_date", rs.getDate("exam_scheduled_date"));
//                grade.put("exam_id", rs.getInt("exam_id"));
//                grades.add(grade);
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//        // Get the exam information for each result
//        for (Map<String, Object> grade : grades) {
//            // Get the exam ID
//            Integer examID = Integer.parseInt(grade.get("exam_id").toString());
//            // SQL query to select from the 'exam' table where the student ID is present
//            String examsql = "SELECT * \n" +
//                    "FROM exam \n" +
//                    "WHERE exam_id = ?;\n";
//            // Get the exam details
//            try (Connection conn = Database.getConnection();
//                 PreparedStatement stmt = conn.prepareStatement(examsql)) {
//
//                // Update the Query with the variables
//                stmt.setInt(1, examID);  // Set the exam ID
//
//                // Execute the query
//                ResultSet rs = stmt.executeQuery();
//
//                // Gets the record details if the exam exists
//                if (rs.next()) {
//                    grade.put("exam_required", rs.getInt("exam_required"));
//                    grade.put("exam_name", rs.getString("exam_name"));
//                    grade.put("exam_course_id", rs.getInt("exam_course_id"));
//                    grade.put("exam_difficulty", rs.getInt("exam_difficulty"));
//                    grade.put("exam_duration", rs.getDouble("exam_duration"));
//                    grade.put("exam_online", rs.getInt("exam_online"));
//                }
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
//        }
//        // Get the course name for each exam
//        for (Map<String, Object> grade : grades) {
//            // Get the exam ID
//            Integer courseID = Integer.parseInt(grade.get("exam_course_id").toString());
//            // SQL query to select from the 'exam' table where the student ID is present
//            String examsql = "SELECT * \n" +
//                    "FROM course \n" +
//                    "WHERE course_id = ?;\n";
//            // Get the exam details
//            try (Connection conn = Database.getConnection();
//                 PreparedStatement stmt = conn.prepareStatement(examsql)) {
//
//                // Update the Query with the variables
//                stmt.setInt(1, courseID);  // Set the exam ID
//
//                // Execute the query
//                ResultSet rs = stmt.executeQuery();
//
//                // Gets the record details if the exam exists
//                if (rs.next()) {
//                    grade.put("course_name", rs.getString("course_name"));
//                }
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
//        }
//        // Return list of grades
//        return grades;
//    }


    /**
     * This method returns the ArrayList grades of the student's grades.
     *
     * @param report Report class type single student's report object.
     * @return An ArrayList of a single student's Grades object.
     */
    @GetMapping("/studentReportGradeList")
    public List<Grade> getStudentReportGradeList(Report report) {
        List<Grade> result = report.getReportGrades();
        return result;
    }

    public class ReportResponse {
        private String date;
        private String exam;
        private String version;
        private String grade;

        public ReportResponse(String date,String exam,String version,String grade) {
            this.date = date;
            this.exam = exam;
            this.version = version;
            this.grade = grade;
        };
        // Quick data response
        public String getDate() {
            return date;
        }

        public String getExam() {
            return exam;
        }

        public String getVersion() {
            return version;
        }

        public String getGrade() {
            return grade;
        }
    }

    /**
     * This method returns the student grades as a string.
     *
     * @param report Report class type student's report.
     * @return String type student report to display.
     */
    @GetMapping("/studentReportString")
    public String getStudentReport(Report report) {
        String result = report.generateReport();

        return result;
    }

    /**
     * Grades JSON serializer class for Grades
     */
    class TestStudentReport {
        private String gradeData;

        public TestStudentReport(String gradeData) {
            this.gradeData = gradeData;
        }

        public String getGradeData() {
            return gradeData;
        }
    }

    /**
     * Get student grade report
     * @param SID student ID
     * @return String of the tuple from the database
     */
    @GetMapping("/studentReportString1")
    public String getStudentReport1(@RequestParam int SID) { // TODO: 5/23/24 FIX MY INPUT ARGUMENT!✅
        ReportDatabase.connection();
//        TestStudentReport result = new TestStudentReport(ReportDatabase.printStudentReport(1));
        String result = ReportDatabase.printStudentReport(SID);
        return result;
        //Report report = new StudentReport(RepID, "StudentReport", );
//        return result;
    }

    /**
     * Get instructor's report of student grades by course
     * @param corID course id
     * @return String of the tuples from the database
     */
    @GetMapping("/instructorReportString1")
    public String getInstructorReport1(@RequestParam int corID) { // TODO: 5/23/24 FIX MY INPUT ARGUMENT!✅
        ReportDatabase.connection();
        System.out.println("This is the corID: " + corID);
        String result = ReportDatabase.printInstructorReport(corID);
        //ReportDatabase.printStudentReport(1)
        return result;
    }

    /**
     * Get the instructor report for all grades
     * @param report if the report object
     * @return List of Grade objects
     */
    @GetMapping("/instructorReportGradeList")
    public List<Grade> getInstructorReportGradeList(Report report) {
        List<Grade> result = report.getReportGrades();
        return result;
    }

    /**
     * Get instructor report
     * @param report Report object
     * @return String of the tuples from the database
     */
    @GetMapping("/instructorReportString")
    public String getInstructorReport(Report report) {
        String result = report.generateReport();
        return result;
    }
}

