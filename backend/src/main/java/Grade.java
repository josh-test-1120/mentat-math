/** This class stores all information regarding what x student got on x test and has data such as when
 *  the test was taken (an attribute from the Exam class)
 * @author Telmen Enkhtuvshin
 */
public class Grade {
    //The unique grade ID
    private String gradeID;
    //The student ID of the grade object
    private String studentID;
    //The unique exam ID of the grade
    private String examID;
    //The score of the grade
    public int score;
    //The recorded date of the exam grade
    public String dateRecorded;

    //Constructor for the Grade object
    public Grade(String gradeID, String studentID, String examID, String dateRecorded){
        this.gradeID      = gradeID;
        this.studentID    = studentID;
        this.examID       = examID;
        this.dateRecorded = dateRecorded;
    }

    /**
     * A getter method for gradeID
     * @return String grade ID
     */
    public String getGradeID() {return gradeID;}

    /**
     * A getter method for exam ID of the Grade object
     * @return String exam ID
     */
    public String getExamID() {return examID;}

    /**
     * A getter method for the studentID of the Grade object
     * @return String grade ID
     */
    public String getStudentID() {return studentID;}

    /**
     * A getter method for the score of the Grade object
     * @return int score of the Grade object
     */
    public int getGrade() {return score;}

    /**
     * A setter method that records the score of the exam
     * @param examScore int score of the taken exam
     */
    public void recordUpdateGrade(int examScore){
        this.score = examScore;

        // TODO: 5/10/24 Continue update the system and the database
    }






}
