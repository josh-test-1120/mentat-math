package org.mentats.mentat.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Course Request class to convert frontend data info into a Course object,
 * and it into the Database.
 */
public class CourseRequest {

    /**
     * CourseRequest Field values.
     */
    @NotBlank
//    @Size(max = 50)
    private String courseName;

    @NotBlank
//    @Min(2000)
    private int year;

    @NotBlank
//    @Size(max = 20)
    private String quarter;

//    @Size(max = 20)
    private String sectionNumber;

    @NotBlank
//    @Size(max = 50)
    private String userID;

    public String getCourseName() {return courseName;}

    public void setCourseName(String courseName) {this.courseName = courseName;}

    public int getYear() {return year;}

    public void setYear(int year) {this.year = year;}

    public String getQuarter() {return quarter;}

    public void setQuarter(String quarter) {this.quarter = quarter;}

    public String getSectionNumber() {return sectionNumber;}

    public void setSectionNumber(String sectionNumber) {this.sectionNumber = sectionNumber;}

    public String getUserID() {return userID;}

    public void setUserID(String userName) {this.userID = userName;}
}