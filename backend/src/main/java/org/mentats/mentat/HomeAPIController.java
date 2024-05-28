package org.mentats.mentat;

import org.springframework.web.bind.annotation.RequestParam;
import report.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api/")
public class HomeAPIController {
    /**
     * Test response API POJO
     */
    class TestResponse {
        private String data;

        public TestResponse(String data) {
            this.data = data;
        }

        ;

        // Quick data response
        public String getData() {
            return data;
        }
    }

    /**
     * Default mapping for API calls
     * Test feature for now with no POST data
     *
     * @return JSON response
     */
    @GetMapping("/")
    public TestResponse index() {
        TestResponse result = new TestResponse("Hello from the Mentat Team!");
        return result;
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
    public String getStudentReport1(@RequestParam int SID) { // TODO: 5/23/24 FIX MY INPUT ARGUMENT!✅
        ReportDatabase.connection();
//        TestStudentReport result = new TestStudentReport(ReportDatabase.printStudentReport(1));
        String result = ReportDatabase.printStudentReport(SID);
        return result;
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

    @GetMapping("/grades")
    /*
    Function that retrieves a list of exams from the database where the exam state is 1 (published exams only)*/
    public List<Map<String, Object>> getExams() {

        // SQL query to select from the 'exam' table where the exam state is 1
        String sql = "SELECT exam_name, exam_difficulty, exam_required \n" +
                "FROM Exam \n" +
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
}

