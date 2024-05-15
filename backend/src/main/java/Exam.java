/**
 * @author Phillip Ho
 */
public class Exam{

    private String examName;
    private String examID;
    private String examDate;
    private boolean examStatus;
    private int passingScore;

    //Exam constructor
    public Exam(String examName, String examID, String examDate, boolean examStatus, int passingScore){
        this.examName = examName;
        this.examID = examID;
        this.examDate = examDate;
        this.examStatus = examStatus;
        this.passingScore = passingScore;
    }

    //Exam getter functions
    public String getExamName(){
        return examName;
    }
    public String getExamID(){
        return examID;
    }
    public String getExamDate(){
        return examDate;
    }
    public boolean getExamStatus(){
        return examStatus;
    }
    public int getPassingScore(){
        return passingScore;
    }

    //Exam setter functions
    public void setExamName(String examName){
        this.examName = examName;
    }
    public void setExamID(String examID){
        this.examID = examID;
    }
    public void setExamDate(String examDate){
        this.examDate = examDate;
    }
    public void setExamStatus(boolean examStatus){
        this.examStatus = examStatus;
    }
    public void setPassingScore(int passingScore){
        this.passingScore = passingScore;
    }

    //Exam methods
    public void scheduleExam(){
        //logic here
    }
    public void updateExam(){
        //logic here
    }
    public void markComplete(){
        //logic here
    }
}
