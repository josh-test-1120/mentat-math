package org.mentats.mentat.controllers;
import org.mentats.mentat.models.*;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.mentats.mentat.services.Database;
import org.mentats.mentat.services.ReportDatabase;

import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class HomeAPIController {

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

    @GetMapping("/grades")
    /*
    * Function that retrieves a list of exams from the database where the exam state is 1 (published exams only)
     */
    public List<Map<String, Object>> getExams() {
        System.out.println("Inside Exam API Handler");
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
    /**
     * This method returns the ArrayList grades of the student's grades.
     *
     * @param report Report class type single student's report object.
     * @return An ArrayList of single student's Grades object.
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

    class TestStudentReport {
        private String gradeData;

        public TestStudentReport(String gradeData) {
            this.gradeData = gradeData;
        }

        public String getGradeData() {
            return gradeData;
        }
    }

    @GetMapping("/studentReportString1")
    public ReportResponse getStudentReport1(@RequestParam int SID) { // TODO: 5/23/24 FIX MY INPUT ARGUMENT!✅
        ReportDatabase.connection();
        System.out.println("Inside Student Record String API");
//        TestStudentReport result = new TestStudentReport(ReportDatabase.printStudentReport(1));
        String result = ReportDatabase.printStudentReport(SID);
        System.out.println(result);
        String[] results = result.split(" ");
        ReportResponse resultJSON = new ReportResponse(results[0],results[1],results[2],results[3]);
        return resultJSON;
        //Report report = new StudentReport(RepID, "StudentReport", );
//        return result;
    }

    @GetMapping("/instructorReportString1")
    public String getInstructorReport1(@RequestParam int corID) { // TODO: 5/23/24 FIX MY INPUT ARGUMENT!✅
        ReportDatabase.connection();
        String result = ReportDatabase.printInstructorReport(corID);
        //ReportDatabase.printStudentReport(1)
        return result;
    }

    @GetMapping("/instructorReportGradeList")
    public List<Grade> getInstructorReportGradeList(Report report) {
        List<Grade> result = report.getReportGrades();
        return result;
    }

    @GetMapping("/instructorReportString")
    public String getInstructorReport(Report report) {
        String result = report.generateReport();
        return result;
    }
}

