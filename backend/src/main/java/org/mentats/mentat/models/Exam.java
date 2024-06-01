package org.mentats.mentat.models;

import java.util.Date;

/** This class represents an Exam entity that students will be able to schedule
 * @author Phillip Ho
 */
public class Exam{

    private int examID;
    private String examName;
    private boolean examStatus;
    private boolean examRequired;
    private int examDifficulty;
    private int examCourseID;


    /**
     * Default constructor
     * @param examID int of examID
     * @param examName string of exam name
     * @param examStatus boolean of exam status
     * @param examRequired boolean of exam required
     * @param examDifficulty int of exam difficulty
     * @param examCourseID int of exam courseID
     */
    public Exam(int examID, String examName,  boolean examStatus, boolean examRequired, int examDifficulty, int examCourseID){
        this.examID = examID;
        this.examName = examName;
        this.examStatus = examStatus;
        this.examRequired = false; //initial state of not required exams
        this.examDifficulty = 0; //initial difficulty of 0 out of 5
        this.examCourseID = examCourseID;
    }

    /**
     * Getter for Exam name
     * @return string of exam name
     */
    public String getExamName(){
        return examName;
    }

    /**
     * Getter for ExamID
     * @return int of examID
     */
    public int getExamID(){
        return examID;
    }

    /**
     * Getter for Exam status
     * @return boolean of exam status
     */
    public boolean getExamStatus(){
        return examStatus;
    }

    /**
     * Getter for Exam required
     * @return boolean of exam required
     */
    public boolean getExamRequired(){
        return examRequired;
    }

    /**
     * Getter for Exam difficulty
     * @return int of exam difficulty
     */
    public int getExamDifficulty(){
        return examDifficulty;
    }

    /**
     * Getter for Exam course ID
     * @return int of exam courseID
     */
    public int getExamCourseID(){
        return examCourseID;
    }

    /**
     * Setter for Exam name
     * @param examName string of exam name
     */
    public void setExamName(String examName){
        this.examName = examName;
    }

    /**
     * Setter for Exam ID
     * @param examID int of exam ID
     */
    public void setExamID(int examID){
        this.examID = examID;
    }

    /**
     * Setter for Exam status
     * @param examStatus boolean of exam status
     */
    public void setExamStatus(boolean examStatus){
        this.examStatus = examStatus;
    }

    /**
     * Setter for Exam required
     * @param examRequired boolean of exam required
     */
    public void setExamRequired(boolean examRequired){
        this.examRequired = examRequired;
    }

    /**
     * Setter for Exam difficulty
     * @param examDifficulty int of exam difficulty
     */
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