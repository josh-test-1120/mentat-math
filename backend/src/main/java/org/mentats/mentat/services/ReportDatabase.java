package org.mentats.mentat.services;
/**
 * This is the class that interacts with the database on reports.
 * @author Telmen Enkhtuvshin
 */

import java.sql.*;

public class ReportDatabase {
    public static Connection con = null;

    /**
     * This is a method used for making connection with the MySQL database.
     */
    public static void connection() {

        //Connection variables
        String url = "jdbc:mysql://localhost:3306/ezmath";
        String username = "AuthTestuser";
        String pass = "password";

        try {
            con = DriverManager.getConnection(url, username, pass);
        } catch(Exception e) {
            System.out.println("Exception" + e.getMessage());
        }
    }

    /**
     * Static fields of the class.
     */
    public static final String exam_student_id     = "exam_student_id";
    public static final String exam_result_id      = "exam_result_id";
    public static final String exam_version        = "exam_version";
    public static final String exam_taken_date     = "exam_taken_date";
    public static final String exam_score          = "exam_score";
    public static final String exam_scheduled_date = "exam_scheduled_date";
    public static final String exam_exam_id        = "Exam_exam_id";
    public static final String table               = "ExamResult";

    /**
     * This method selects everything from the database ExamResult table.
     * @return String type values inside the ExamResult table in the database.
     */
    public static String print() {
        String printST = "";

        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM ExamResult;"); //ADDED ";" BEWARE OF BUG

            //Printing ResultSet
            while (rs.next()) {

                printST += rs.getString(exam_student_id) + " " + rs.getString(exam_result_id) + " "
                        + rs.getString(exam_version) + " " + rs.getString(exam_taken_date) + " "
                        + rs.getString(exam_score) + rs.getString(exam_scheduled_date) + rs.getString(exam_exam_id);

                printST += "\n";
            }
            st.close();
            rs.close();

        } catch (Exception e) {
            System.out.println("Exception" + e.getMessage());
        }
        return printST;
    }

    /**
     * This method prints the Student Report in String,
     * @return String type one student report information.
     */
    public static String printStudentReport(int SID) {
        String printST = "";

        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery("SELECT exam_name, exam_version, exam_taken_date, exam_score "
                    + "FROM ExamResult exr JOIN Exam ON Exam_exam_id = exam_id WHERE exam_student_id = " + SID);

            //Printing ResultSet
            while (rs.next()) {

                printST += rs.getString("exam_taken_date") + " " + rs.getString("exam_name")
                        + " " + rs.getString("exam_version") + " "
                        + rs.getString("exam_score");

                printST += "\n";
            }
            st.close();
            rs.close();

        } catch (Exception e) {
            System.out.println("Exception" + e.getMessage());
        }
        return printST;
    }

    /**
     * This method prints the Instructor Report in String,
     * @return String type one student report information.
     */
    public static String printInstructorReport(int corID) {
        String printST = "";

        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery("SELECT student_first_name, student_last_name, exam_name, exam_version, "
                    + "exam_taken_date, exam_score FROM ExamResult JOIN Exam ON Exam_exam_id = exam_id JOIN Student " +
                    "ON exam_student_id = student_id WHERE exam_course_id = " + corID);

            //Printing ResultSet
            while (rs.next()) {

                printST += rs.getString("student_first_name") + " "
                        + rs.getString("student_last_name") + " " + rs.getString("exam_name")
                        + " " + rs.getString("exam_version")
                        + " " + rs.getString("exam_taken_date")
                        + " " + rs.getString("exam_score");

                printST += "\n";
            }
            st.close();
            rs.close();

        } catch (Exception e) {
            System.out.println("Exception" + e.getMessage());
        }
        return printST;
    }

    /**
     * A method that inserts values into the database table ExamResult.
     * @param eStuID     String exam student ID.
     * @param eReID      String exam result ID.
     * @param eVer       String exam version.
     * @param eTakenDate String exam taken date.
     * @param eScore     String exam score.
     * @param eScheDate  String exam scheduled date.
     * @param eID        String exam ID.
     */
    public static void add(String eStuID, String eReID, String eVer, String eTakenDate, String eScore,
                           String eScheDate, String eID) {
        try {
            Statement st = con.createStatement();
            st.executeUpdate("INSERT INTO ExamResult(exam_student_id, exam_id, exam_version, exam_taken_date, " +
                    "exam_score, exam_scheduled_date, Exam_exam_id) "
                    + "VALUES (" + eStuID + ", " + eReID + ", " + eVer + ", '" + eTakenDate + "', '" + eScore + "', '"
                    + eScheDate + "', " + eID
                    + ");");

            st.close();

        } catch (Exception e) {
            System.out.println("Exception" + e.getMessage());
        }
    }

    /**
     * A method that deletes a row in the ExamResult table.
     * @param eStuID     String exam student ID.
     * @param eReID      String exam result ID.
     * @param eVer       String exam version.
     * @param eTakenDate String exam taken date.
     * @param eScore     String exam score.
     * @param eScheDate  String exam scheduled date.
     * @param eID        String exam ID.
     */
    public static void delete(String eStuID, String eReID, String eVer, String eTakenDate, String eScore,
                              String eScheDate, String eID) {
        //Deleting the tuples from the database tables
        try {
            Statement st = con.createStatement();
            if (eStuID != "") {
                st.executeUpdate("DELETE FROM " + table + " WHERE " + exam_student_id   + "=" + eStuID + ";");
            }
            if (eReID != "") {
                st.executeUpdate("DELETE FROM " + table + " WHERE " + exam_result_id    + "=" + eReID + ";");
            }
            if (eVer != "") {
                st.executeUpdate("DELETE FROM " + table + " WHERE " + exam_version      + "=" + eVer + ";");
            }
            if (eTakenDate != "") {
                st.executeUpdate("DELETE FROM " + table + " WHERE " + exam_taken_date   + "='" + eTakenDate + "';");
            }
            if (eScore != "") {
                st.executeUpdate("DELETE FROM " + table + " WHERE " + exam_score        + "='" + eScore + "';");
            }
            if (eScheDate != "") {
                st.executeUpdate("DELETE FROM " + table + " WHERE " + exam_scheduled_date + "='" + eScheDate + "';");
            }
            if (eID != "") {
                st.executeUpdate("DELETE FROM " + table + " WHERE " + exam_exam_id      + "=" + eID + ";");
            }

            st.close();

        } catch (Exception e) {
            System.out.println("Exception" + e.getMessage());
        }
    }

    /**
     * A method that updates values inside the ExamResult table in the database.
     * @param eStuID     String exam student ID.
     * @param eReID      String exam result ID.
     * @param eVer       String exam version.
     * @param eTakenDate String exam taken date.
     * @param eScore     String exam score.
     * @param eScheDate  String exam scheduled date.
     * @param eID        String exam ID.
     */
    public static void update(String eStuID, String eReID, String eVer, String eTakenDate, String eScore,
                              String eScheDate, String eID) {
        try {
            Statement st = con.createStatement();
            st.executeUpdate("UPDATE " + table + " SET " + exam_student_id + "=" + eStuID + ", "
                    + exam_taken_date     + "=" + eTakenDate+ ", " + exam_score     + "=" + eScore + ", "
                    + exam_scheduled_date + "=" + eScheDate+ ", "  + exam_exam_id   + "=" + eID
                    + " WHERE " + exam_result_id + "=" + eReID  + " AND " + exam_version + "=" + eVer + ";");
            st.close();

        } catch (Exception e) {
            System.out.println("Exception" + e.getMessage());
        }
    }

}