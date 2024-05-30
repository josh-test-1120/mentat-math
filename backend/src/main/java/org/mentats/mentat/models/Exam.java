package org.mentats.mentat.models; /** This class represents an Exam entity that students will be able to schedule
 * @author Phillip Ho
 */

import java.util.Date;


public class Exam{


    private int examID;
    private String examName;
    private boolean examStatus;
    private boolean examRequired;
    private int examDifficulty;
    private int examCourseID;


    //Exam constructor
    public Exam(int examID, String examName,  boolean examStatus, boolean examRequired, int examDifficulty, int examCourseID){
        this.examID = examID;
        this.examName = examName;
        this.examStatus = examStatus;
        this.examRequired = false; //initial state of not required exams
        this.examDifficulty = 0; //initial difficulty of 0 out of 5
        this.examCourseID = examCourseID;
    }

//    public Exam() {
//
//    }


    //Exam getter functions
    public String getExamName(){
        return examName;
    }
    public int getExamID(){
        return examID;
    }

    public boolean getExamStatus(){
        return examStatus;
    }

    public boolean getExamRequired(){
        return examRequired;
    }
    public int getExamDifficulty(){
        return examDifficulty;
    }

    public int getExamCourseID(){
        return examCourseID;
    }

    //Exam setter functions
    public void setExamName(String examName){
        this.examName = examName;
    }
    public void setExamID(int examID){
        this.examID = examID;
    }

    public void setExamStatus(boolean examStatus){
        this.examStatus = examStatus;
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