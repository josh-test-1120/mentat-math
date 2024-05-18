/** This is a class that contains and manages the individual report for a single student
 *  and a generalized report for an instructor.
 * @author Telmen Enkhtuvshin
 */
import java.util.ArrayList;
import java.util.List;
public abstract class Report {
    /**
     * An abstract method to create reports for student and instructor.
     * @return String
     */
    public abstract String generateReport();

    /**
     * An abstract method for displaying the report.
     * @return
     */
    public abstract List<Grade> viewReportGrades();
}

class StudentReport extends Report {

    private String reportID;
    public  String type;
    public  String generatedDate;
    private List<Grade> allGrades;

    /**
     * Constructor for the Student Report class.
     * @param reportID      String type Report ID.
     * @param type          String type of what kind of report it is.
     * @param generatedDate String type generated date of the report.
     */
    public StudentReport(String reportID, String type, String generatedDate){
        this.reportID      = reportID;
        this.type          = type;
        this.generatedDate = generatedDate;
        allGrades = new ArrayList<>();
    }

    /**
     * A method that adds a Grade object to the allGrades ArrayList.
     * @param grade Grade class type object.
     */
    public void addGradeToReport(Grade grade) {
        allGrades.add(grade);
    }

    /**
     * A method that removes a Grade object from the allGrades ArrayList.
     * @param grade Grade class type object.
     */
    public void removeGradeFromReport(Grade grade) {
        allGrades.remove(grade);
    }


    @Override
    public String generateReport() {

        // TODO: 5/10/24 Adapt to the necessities
        return "";
    }

    /**
     * A method that returns an ArrayList of Grade type objects of the student.
     * @return List<Grade> type ArrayList full of grades.
     */
    @Override
    public List<Grade> viewReportGrades() {
        // TODO: 5/10/24 Adapt to the necessities ✅
        return allGrades;
    }
}

class InstructorReport extends Report {

    private String reportID;
    public  String type;
    public String generatedDate;
    private List<Grade> allGrades;

    //The studentReport object constructor
    public InstructorReport(String reportID, String type, String generatedDate){
        this.reportID      = reportID;
        this.type          = type;
        this.generatedDate = generatedDate;
    }

    @Override
    public String generateReport() {
        // TODO: 5/10/24 Fix me for instructor report
        return null;
    }

    @Override
    public List<Grade> viewReportGrades() {
        // TODO: 5/10/24 Fix me for instructor report
        return allGrades;
    }
}
