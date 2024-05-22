package org.mentats.mentat;

import Report.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    /**
     * This method returns the ArrayList grades of the student's grades.
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
     * @param report Report class type student's report.
     * @return String type student report to display.
     */
    @GetMapping("/studentReportString")
    public String getStudentReport(Report report){
        String result = report.generateReport();
        return result;
    }
    class TestStudentReport {
        private String gradeData;

        public TestStudentReport(String gradeData){
            this.gradeData = gradeData;
        }
        public String getGradeData() {
            return gradeData;
        }
    }
    @GetMapping("/studentReportString1")
    public TestStudentReport getStudentReport1(){
        ReportDatabase.connection();
        TestStudentReport result = new TestStudentReport(ReportDatabase.printStudentReport(1));
        //ReportDatabase.printStudentReport(1)
        return result;
    }

    @GetMapping("/instructorReportGradeList")
    public List<Grade> getInstructorReportGradeList(Report report){
        List<Grade> result = report.getReportGrades();
        return result;
    }

    @GetMapping("/instructorReportString")
    public String getInstructorReport(Report report) {
        String result = report.generateReport();
        return result;
    }
}

