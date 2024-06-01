package org.mentats.mentat.models.JunitTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mentats.mentat.models.Grade;
import org.mentats.mentat.models.StudentReport;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StudentReportTest {
    private StudentReport studentReport;

    @BeforeEach
    public void setUp() {
        studentReport = new StudentReport("1", "Student", "2024-05-06");
    }

    /**
     * This tests the addGradeToReport() method that adds a Grade object into an ArrayList.
     */
    @Test
    public void addGradeToReportTest1() {
        List<Grade> expected = new ArrayList<>();
        Grade grade = new Grade("1", "1", "1", "C1", "A","2024-05-04");
        expected.add(grade);
        studentReport.addGradeToReport(grade);
        List<Grade> results = studentReport.getReportGrades();
        assertEquals(expected, results);
    }

    /**
     * This tests the addGradeToReport() method that adds a Grade object into an ArrayList.
     */
    @Test
    public void addGradeToReportTest2() {
        List<Grade> expected = new ArrayList<>();
        Grade grade = new Grade("2", "2", "2", "C2", "A","2024-04-06");
        expected.add(grade);
        studentReport.addGradeToReport(grade);
        List<Grade> results = studentReport.getReportGrades();
        assertEquals(expected, results);
    }

    /**
     * This tests the addGradeToReport() method that adds a Grade object into an ArrayList.
     */
    @Test
    public void addGradeToReportTest3() {
        List<Grade> expected = new ArrayList<>();
        Grade grade = new Grade("5", "1", "6", "R1", "A", "2024-03-30");
        expected.add(grade);
        studentReport.addGradeToReport(grade);
        List<Grade> results = studentReport.getReportGrades();
        assertEquals(expected, results);
    }

    //#############################################
    /**
     * This tests the removeGradeFromReport() method.
     */
    @Test
    public void removeGradeFromReportTest1() {
        Grade grade = new Grade("3", "3", "3", "C3", "A", "2024-10-07");
        studentReport.addGradeToReport(grade);

        List<Grade> expected = new ArrayList<>();
        studentReport.removeGradeFromReport(grade);
        List<Grade> results = studentReport.getReportGrades();
        assertEquals(expected, results);
    }

    /**
     * This tests the removeGradeFromReport() method.
     */
    @Test
    public void removeGradeFromReportTest2() {
        Grade grade = new Grade("10", "24", "66", "I1", "B","2024-11-07");
        studentReport.addGradeToReport(grade);

        List<Grade> expected = new ArrayList<>();
        studentReport.removeGradeFromReport(grade);
        List<Grade> results = studentReport.getReportGrades();
        assertEquals(expected, results);
    }

    /**
     * This tests the removeGradeFromReport() method.
     */
    @Test
    public void removeGradeFromReportTest3() {
        Grade grade = new Grade("30", "30", "35", "R4", "F", "2024-09-07");
        studentReport.addGradeToReport(grade);

        List<Grade> expected = new ArrayList<>();
        studentReport.removeGradeFromReport(grade);
        List<Grade> results = studentReport.getReportGrades();
        assertEquals(expected, results);
    }

    //######################################
    /**
     * This tests the generateReport() method that returns a String of grade information.
     */
    @Test
    public void generateReportTest1() {
        Grade grade = new Grade("30", "30", "35", "R4", "A", "2024-09-07");
        studentReport.addGradeToReport(grade);
        String expected = "R4 A 2024-09-07\n";
        String actual = studentReport.generateReport();
        assertEquals(expected, actual);
    }

    /**
     * This tests the generateReport() method that returns a String of grade information.
     */
    @Test
    public void generateReportTest2() {
        Grade grade = new Grade("50", "352", "351", "R5", "C", "2024-04-01");
        studentReport.addGradeToReport(grade);
        String expected = "R5 C 2024-04-01\n";
        String actual = studentReport.generateReport();
        assertEquals(expected, actual);
    }

    /**
     * This tests the generateReport() method that returns a String of grade information.
     */
    @Test
    public void generateReportTest3() {
        Grade grade = new Grade("100", "765", "335", "GTM", "A", "2024-02-28");
        studentReport.addGradeToReport(grade);
        String expected = "GTM A 2024-02-28\n";
        String actual = studentReport.generateReport();
        assertEquals(expected, actual);
    }

    //############################################################

    /**
     * This tests getReportGrades() that returns the ArrayList with Grade objects.
     */
    @Test
    public void getReportGradesTest1() {
        Grade grade = new Grade("100", "765", "335", "GTM", "A", "2024-02-28");
        studentReport.addGradeToReport(grade);

        List<Grade> expected = new ArrayList<>();
        expected.add(grade);
        List<Grade> actual = studentReport.getReportGrades();
        assertEquals(expected, actual);
    }

    /**
     * This tests getReportGrades() that returns the ArrayList with Grade objects.
     */
    @Test
    public void getReportGradesTest2() {
        Grade grade = new Grade("1234", "282", "981", "GTC", "B", "2022-12-21");
        studentReport.addGradeToReport(grade);

        List<Grade> expected = new ArrayList<>();
        expected.add(grade);
        List<Grade> actual = studentReport.getReportGrades();
        assertEquals(expected, actual);
    }

    /**
     * This tests getReportGrades() that returns the ArrayList with Grade objects.
     */
    @Test
    public void getReportGradesTest3() {
        Grade grade = new Grade("1758", "76234", "33242", "NET1", "A", "2020-04-12");
        studentReport.addGradeToReport(grade);

        List<Grade> expected = new ArrayList<>();
        expected.add(grade);
        List<Grade> actual = studentReport.getReportGrades();
        assertEquals(expected, actual);
    }
}