/** This is a class that contains and manages the individual report for a single student
 *  and a generalized report for an instructor.
 * @author Telmen Enkhtuvshin
 */
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
    public abstract String viewReport();
}

class StudentReport extends Report {

    private String reportID;
    public String type;
    public String generatedDate;

    //The studentReport object constructor
    public StudentReport(String reportID, String type, String generatedDate){
        this.reportID      = reportID;
        this.type          = type;
        this.generatedDate = generatedDate;
    }
    @Override
    public String generateReport() {

        // TODO: 5/10/24 Adapt to the necessities
        return "";
    }

    @Override
    public String viewReport() {

        // TODO: 5/10/24 Adapt to the necessities
        return "";
    }
}

class InstructorReport extends Report {

    private String reportID;
    public String type;
    public String generatedDate;

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
    public String viewReport() {
        // TODO: 5/10/24 Fix me for instructor report
        return null;
    }
}
