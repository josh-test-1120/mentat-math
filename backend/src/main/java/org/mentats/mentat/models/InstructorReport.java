package org.mentats.mentat.models;

import java.util.List;

public class InstructorReport extends Report {

    private String reportID;
    public String type;
    private String examID;
    public String generatedDate;
    private List<Grade> allGradesOfExam;

    //The studentReport object constructor
    public InstructorReport(String reportID, String type, String examID, String generatedDate) {
        this.reportID = reportID;
        this.type = type;
        this.examID = examID;
        this.generatedDate = generatedDate;
    }

    /**
     * A method that adds a student Report.Report.Grade object into the allGradesOfExam ArrayList.
     *
     * @param grade Report.Report.Grade class type object.
     */
    public void addGrade(Grade grade) {
        allGradesOfExam.add(grade);
    }

    /**
     * A method that removes a student Report.Report.Grade object into the allGradesOfExam ArrayList.
     *
     * @param grade Report.Report.Grade class type object.
     */
    public void removeGrade(Grade grade) {
        allGradesOfExam.remove(grade);
    }

    /**
     * Method that generates report in a String type.
     *
     * @return String type information about exam name, score, and recorded date in order.
     */
    @Override
    public String generateReport() {
        // TODO: 5/10/24 Fix me for instructor report
        String result = "";
        for (int i = 0; i < allGradesOfExam.size(); i++) {
            Grade currentGrade = allGradesOfExam.get(i);
            result += currentGrade.getExamName() + " " + String.valueOf(currentGrade.getScore()) + " "
                    + currentGrade.getDateRecorded() + "\n";
        }
        return result;
    }

    /**
     * a method that returns the Report.Report.Grade objects as an Arraylist.
     *
     * @return List<Report.Report.Grade> ArrayList of student grades of an exam.
     */
    @Override
    public List<Grade> getReportGrades() {
        // TODO: 5/10/24 Fix me for instructor report
        return allGradesOfExam;
    }
}