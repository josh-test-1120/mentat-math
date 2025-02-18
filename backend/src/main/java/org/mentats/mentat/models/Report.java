package org.mentats.mentat.models;
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
    public abstract List<Grade> getReportGrades();
}