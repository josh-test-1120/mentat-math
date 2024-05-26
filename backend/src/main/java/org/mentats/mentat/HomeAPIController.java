package org.mentats.mentat;
import org.mentats.mentat.models.*;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HomeAPIController {

//    @PostMapping("/createExam")
//    public String addExam(@RequestParam("exam_name") String name,
//                          @RequestParam("exam_difficulty") String difficulty,
//                          @RequestParam(value = "is_required", required = false) Boolean isRequired,
//                          @RequestParam(value = "is_published", required = false) Boolean isPublished) {
//
//        // Default values for checkboxes if they are not checked
//        if (isRequired == null) {
//            isRequired = false;
//        }
//        if (isPublished == null) {
//            isPublished = false;
//        }
//        int examID = 101;
//        String sql = "INSERT INTO exam (exam_id, exam_name, exam_difficulty, is_required, is_published) VALUES (?, ?, ?, ?)";
//
//        try (Connection conn = Database.getConnection();
//             PreparedStatement stmt = conn.prepareStatement(sql)) {
//
//            stmt.setString(1, name);
//            stmt.setString(2, difficulty);
//            stmt.setBoolean(3, isRequired);
//            stmt.setBoolean(4, isPublished);
//            int result = stmt.executeUpdate();
//
//            if (result > 0) {
//                examID++;
//                return "Exam added successfully!";
//            } else {
//                return "Error adding exam.";
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//            return "Error: " + e.getMessage();
//        }
//    }


    @GetMapping("/grades")
    /*
    * Function that retrieves a list of exams from the database where the exam state is 1 (published exams only)
     */
    public List<Map<String, Object>> getExams() {

        // SQL query to select from the 'exam' table where the exam state is 1
        String sql = "SELECT exam_name, exam_difficulty, exam_required \n" +
                     "FROM exam \n" +
                     "WHERE exam_state = 1;\n";
        //// list to store retrieved exam details
        List<Map<String, Object>> exams = new ArrayList<>();

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            //iterates through result set
            while (rs.next()) {
                Map<String, Object> exam = new HashMap<>();
                exam.put("exam_name", rs.getString("exam_name"));
                exam.put("exam_difficulty", rs.getString("exam_difficulty"));
                exam.put("is_required", rs.getBoolean("exam_required"));
                exams.add(exam);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        //returns list of exams
        return exams;
    }


//    /**
//     * Test response API POJO
//     */
//    class TestResponse {
//        private String data;
//        public TestResponse(String data) {
//            this.data = data;
//        };
//        // Quick data response
//        public String getData() {
//            return data;
//        }
//    }
//
//    /**
//     * Default mapping for API calls
//     * Test feature for now with no POST data
//     * @return JSON response
//     */
//    @GetMapping("/")
//    public TestResponse index() {
//        TestResponse result = new TestResponse("Hello from the Mentat Team!");
//        return result;
//    }

//    @GetMapping("/schedule")
//    public Schedule schedule(){
//
//
//    }


//    /**
//     * Exam mapping call to retrieve all necessary examresults needed for table to be populated on frontend
//     * @return
//     */
//    @GetMapping("/examresult")
//    public List<Map<String, Object>> getAllExamResults() { //returns list of maps; each map representing row of exam results from DB
//        List<Map<String, Object>> results = new ArrayList<>(); //result of an Array List; string names for columns, objects for column values
//        String query = "SELECT s.student_id, s.student_first_name, s.student_middle_init, s.student_last_name, " +
//                "er.exam_result_id, er.exam_version, er.exam_taken_date, er.exam_score, er.exam_scheduled_date, er.Exam_exam_id " +
//                "FROM ExamResult er " +
//                "JOIN Student s ON er.exam_student_id = s.student_id"; //query for DB; joining ExamResult and Student table
//
//        /**
//         * DB Connection based on Database.java file
//         */
//        try (Connection connection = Database.getConnection();
//             PreparedStatement statement = connection.prepareStatement(query);
//             ResultSet resultSet = statement.executeQuery()) {
//
//            //each row = HashMap created
//            while (resultSet.next()) {
//                Map<String, Object> row = new HashMap<>();
//                row.put("exam_taken_date", resultSet.getDate("exam_taken_date"));
//                row.put("exam_exam_id", resultSet.getInt("Exam_exam_id"));
//                row.put("exam_version", resultSet.getInt("exam_version"));
//                row.put("exam_score", resultSet.getString("exam_score"));
//                results.add(row);
//            }
//        } catch (SQLException e) {
//            e.printStackTrace(); // Handle exceptions appropriately in a real application
//        }
//
//        return results;
//    }


//      EXAMPLE FOR GET ALL STUDENTS
//    @GetMapping("/students")
//    public List<Profile> getAllStudents() {
//        List<Profile> students = new ArrayList<>();
//        String query = "SELECT student_id, student_first_name, student_middle_init, student_last_name FROM student";
//
//        try (Connection connection = Database.getConnection();
//             PreparedStatement statement = connection.prepareStatement(query);
//             ResultSet resultSet = statement.executeQuery()) {
//
//            while (resultSet.next()) {
//                Student student = new Student();
//                student.setProfileID(resultSet.getInt("student_id"));
//                student.setFirstName(resultSet.getString("student_first_name"));
//                student.setMiddleInit(resultSet.getString("student_middle_init"));
//                student.setLastName(resultSet.getString("student_last_name"));
//                students.add(student);
//            }
//        } catch (SQLException e) {
//            e.printStackTrace(); // Handle exceptions appropriately in a real application
//        }
//
//        return students;
//    }

}

