package org.mentats.mentat.models;

import java.util.ArrayList;
import java.util.List;

public class StudentReport extends Report {

    private String reportID;
    public String type;
    public String generatedDate;
    private List<Grade> allGrades;

    /**
     * Constructor for the Student Report.Report class.
     *
     * @param reportID      String type Report.Report ID.
     * @param type          String type of what kind of report it is.
     * @param generatedDate String type generated date of the report.
     */
    public StudentReport(String reportID, String type, String generatedDate) {
        this.reportID = reportID;
        this.type = type;
        this.generatedDate = generatedDate;
        allGrades = new ArrayList<>();
    }

    /**
     * A method that adds a Report.Report.Grade object to the allGrades ArrayList.
     *
     * @param grade Report.Report.Grade class type object.
     */
    public void addGradeToReport(Grade grade) {
        allGrades.add(grade);
    }

    /**
     * A method that removes a Report.Report.Grade object from the allGrades ArrayList.
     *
     * @param grade Report.Report.Grade class type object.
     */
    public void removeGradeFromReport(Grade grade) {
        allGrades.remove(grade);
    }


    /**
     * A method that generates the report in a String.
     *
     * @return String type information about exam name, score, and recorded date in order.
     */
    @Override
    public String generateReport() {
        String result = "";
        for (int i = 0; i < allGrades.size(); i++) {
            Grade currentGrade = allGrades.get(i);
            result += currentGrade.getExamName() + " " + currentGrade.getScore() + " "
                    + currentGrade.getDateRecorded() + "\n";
        }
        // TODO: 5/10/24 Adapt to the necessities ✅
        return result;
    }

    /**
     * A method that returns an ArrayList of Report.Report.Grade type objects of the student.
     *
     * @return List<Report.Report.Grade> type ArrayList full of grades.
     */
    @Override
    public List<Grade> getReportGrades() {
        // TODO: 5/10/24 Adapt to the necessities ✅
        return allGrades;
    }
}