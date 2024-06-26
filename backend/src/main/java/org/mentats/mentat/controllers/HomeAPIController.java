package org.mentats.mentat.controllers;
import org.mentats.mentat.models.*;


import org.mentats.mentat.payload.request.ExamRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.mentats.mentat.services.Database;
import org.mentats.mentat.services.ReportDatabase;

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
    /**
     * Get the last exam id from the database to increment
     * @return integer of last exam id
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
     * Get the grades from the database
     * where the exam state is 1 (published exams only)
     * @return List of Map objects that have {string, object} types
     */
    @GetMapping("/grades")
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
     * @param SID student id
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
     * Get instructor report of student grades by course
     * @param corID course id
     * @return String of the tuples from the database
     */
    @GetMapping("/instructorReportString1")
    public String getInstructorReport1(@RequestParam int corID) { // TODO: 5/23/24 FIX MY INPUT ARGUMENT!✅
        ReportDatabase.connection();
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

