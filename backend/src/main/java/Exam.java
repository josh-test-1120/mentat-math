/** This class represents an Exam entity that students will be able to schedule
 * @author Phillip Ho
 */

import java.util.Date;


public class Exam{


    private int examID;
    private String examName;
    private Date examDate;
    private boolean examStatus;
    private int passingScore;
    private boolean examRequired;
    private int examDifficulty;

    //Exam constructor
    public Exam(int examID, String examName, Date examDate, boolean examStatus, int passingScore, boolean examRequired, int examDifficulty){
        this.examID = examID;
        this.examName = examName;
        this.examDate = examDate;
        this.examStatus = examStatus;
        this.passingScore = passingScore;
        this.examRequired = false; //initial state of not required exams
        this.examDifficulty = 0; //initial difficulty of 0 out of 5
    }

    //Exam getter functions
    public String getExamName(){
        return examName;
    }
    public int getExamID(){
        return examID;
    }
    public Date getExamDate(){
        return examDate;
    }
    public boolean getExamStatus(){
        return examStatus;
    }
    public int getPassingScore(){
        return passingScore;
    }
    public boolean getExamRequired(){
        return examRequired;
    }
    public int getExamDifficulty(){
        return examDifficulty;
    }

    //Exam setter functions
    public void setExamName(String examName){
        this.examName = examName;
    }
    public void setExamID(int examID){
        this.examID = examID;
    }
    public void setExamDate(Date examDate){
        this.examDate = examDate;
    }
    public void setExamStatus(boolean examStatus){
        this.examStatus = examStatus;
    }
    public void setPassingScore(int passingScore){
        this.passingScore = passingScore;
    }
    public void setExamRequired(boolean examRequired){
        this.examRequired = examRequired;
    }
    public void setExamDifficulty(int examDifficulty){
        this.examDifficulty = examDifficulty;
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
