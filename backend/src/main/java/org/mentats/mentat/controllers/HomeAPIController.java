package org.mentats.mentat;
import org.mentats.mentat.models.*;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class HomeAPIController {

    private static int examID = 400;

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
//        int examID = 105;
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

    @GetMapping("/lastExamID")
    public int findExam() {
        String sql = "SELECT MAX(exam_id) FROM exam;";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    int maxExamId = resultSet.getInt(1);
                    System.out.println("Max exam ID: " + maxExamId);
                    return maxExamId;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1; // return a sentinel value if no result is found or an error occurs
    }



    @PostMapping("/createExam")
    public String createExam(
            @RequestParam("exam_name") String examName,
            @RequestParam("is_published") boolean isPublished,
            @RequestParam("is_required") boolean isRequired,
            @RequestParam("exam_difficulty") int examDifficulty,
            @RequestParam("exam_course_id") int examCourseId) {

        int examID = findExam() +1;
        String sql = "INSERT INTO exam (exam_id, exam_name, exam_state, exam_required, exam_difficulty, exam_course_id) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        // Assuming exam_id is auto-incremented by the database
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {


            statement.setInt(1, examID);  // Set to 0 if auto-incremented
            statement.setString(2, examName);
            statement.setBoolean(3, isPublished);
            statement.setBoolean(4, isRequired);
            statement.setInt(5, examDifficulty);
            statement.setInt(6, examCourseId);

            int rows = statement.executeUpdate();


            if (rows > 0) {
                try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        int generatedId = generatedKeys.getInt(1);
                        System.out.println("Inserted exam ID: " + generatedId);
                    }
                }
                examID +=1;
                return "Exam created successfully";
            } else {
                examID +=1;
                return "Exam could not be created";
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return "Database error: " + e.getMessage();
        }
    }



//    @GetMapping("/createExam1")
//        public String createExam1(
////                @RequestParam("exam_name") String exam_name,
////                @RequestParam("is_published") boolean is_published,
////                @RequestParam("is_required") boolean is_required,
////                @RequestParam("exam_difficulty") int exam_difficulty,
////                @RequestParam("exam_course_id") int exam_course_ID
//
//
//    ){
//
//
//
//    }


//    @GetMapping("/createExam")
//    public String createExam(
//            @RequestParam (name = "exam_name")String exam_name,
//            @RequestParam (name="exam_difficulty") int exam_difficulty,
//            @RequestParam(name="is_required",defaultValue = "false") boolean is_required,
//            @RequestParam(name="is_published",defaultValue = "false") boolean is_published,
//            @RequestParam (name="exam_course_id")int exam_course_ID )
//            {
//        System.out.println("hello world");
//        int examID = 200;
//        String sql = "INSERT INTO exams (exam_id,exam_name, exam_state, exam_required, exam_difficulty,exam_course_id) VALUES (?,?,?, ?, ?, ?)";
//
//        try (Connection connection = Database.getConnection();
//             PreparedStatement statement = connection.prepareStatement(sql)) {
//
////            statement.setInt(1, examID);
//            statement.setString(2, exam_name);
//            statement.setBoolean(3, is_published);
//            statement.setBoolean(4, is_required);
//            statement.setInt(5, exam_difficulty);
//            statement.setInt(6, exam_course_ID);
//
//
//            int rows = statement.executeUpdate();
//
//            if (rows > 0) {
//                return "Exam created successfully";
//            } else {
//                return "Failed to create exam";
//            }
//
//        } catch (SQLException e) {
//            e.printStackTrace();
//            return "Database error: " + e.getMessage();
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


    @GetMapping("/grades1")
    /*
     * Function that retrieves a list of exams from the database where the exam state is 1 (published exams only)
     */
    public List<Exam> getPublishedExams() {
        System.out.println("hi");
        // SQL query to select from the 'exam' table where the exam state is 1
        String sql = "SELECT exam_name, exam_difficulty, exam_required" +
                     "FROM exam" +
                     "WHERE exam_state = 1;";

        // List to store retrieved Exam objects
        List<Exam> exams = new ArrayList<>();

        try (Connection conn = Database.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            // Iterate through result set
            while (rs.next()) {
                // Create a new Exam object and set its properties
                Exam exam = new Exam();

                exam.setExamName(rs.getString("exam_name"));
                exam.setExamDifficulty(rs.getInt("exam_difficulty"));
                exam.setExamRequired(rs.getBoolean("exam_required"));


                // Add the Exam object to the list
                exams.add(exam);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Return the list of Exam objects
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

