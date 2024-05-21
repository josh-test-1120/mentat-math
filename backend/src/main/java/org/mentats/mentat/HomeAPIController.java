package org.mentats.mentat;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



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
    /**
     * Test response API POJO
     */
    class TestResponse {
        private String data;
        public TestResponse(String data) {
            this.data = data;
        };
        // Quick data response
        public String getData() {
            return data;
        }
    }

    /**
     * Default mapping for API calls
     * Test feature for now with no POST data
     * @return JSON response
     */
    @GetMapping("/")
    public TestResponse index() {
        TestResponse result = new TestResponse("Hello from the Mentat Team!");
        return result;
    }

    @GetMapping("/examresult")
    public List<Map<String, Object>> getAllExamResults() {
        List<Map<String, Object>> results = new ArrayList<>();
        String query = "SELECT s.student_id, s.student_first_name, s.student_middle_init, s.student_last_name, " +
                "er.exam_result_id, er.exam_version, er.exam_taken_date, er.exam_score, er.exam_scheduled_date, er.Exam_exam_id " +
                "FROM ExamResult er " +
                "JOIN Student s ON er.exam_student_id = s.student_id";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("student_id", resultSet.getInt("student_id"));
                row.put("student_first_name", resultSet.getString("student_first_name"));
                row.put("student_middle_init", resultSet.getString("student_middle_init"));
                row.put("student_last_name", resultSet.getString("student_last_name"));
                row.put("exam_result_id", resultSet.getInt("exam_result_id"));
                row.put("exam_version", resultSet.getInt("exam_version"));
                row.put("exam_taken_date", resultSet.getDate("exam_taken_date"));
                row.put("exam_score", resultSet.getString("exam_score"));
                row.put("exam_scheduled_date", resultSet.getDate("exam_scheduled_date"));
                row.put("exam_exam_id", resultSet.getInt("Exam_exam_id"));
                results.add(row);
            }
        } catch (SQLException e) {
            e.printStackTrace(); // Handle exceptions appropriately in a real application
        }

        return results;
    }


//      EXAMPLE FOR GET ALL STUDENTS
    @GetMapping("/students")
    public List<Profile> getAllStudents() {
        List<Profile> students = new ArrayList<>();
        String query = "SELECT student_id, student_first_name, student_middle_init, student_last_name FROM student";

        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);
             ResultSet resultSet = statement.executeQuery()) {

            while (resultSet.next()) {
                Profile.Student student = new Profile.Student();
                student.setProfileID(resultSet.getInt("student_id"));
                student.setFirstName(resultSet.getString("student_first_name"));
                student.setMiddleInit(resultSet.getString("student_middle_init"));
                student.setLastName(resultSet.getString("student_last_name"));
                students.add(student);
            }
        } catch (SQLException e) {
            e.printStackTrace(); // Handle exceptions appropriately in a real application
        }

        return students;
    }

}

