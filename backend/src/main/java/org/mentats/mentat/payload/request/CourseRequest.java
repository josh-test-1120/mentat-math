package org.mentats.mentat.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("courseName")
    private String courseName;

    @JsonProperty("courseYear")
   @Min(2000)
    private int courseYear;

    @NotBlank
    @JsonProperty("courseQuarter")
    private String courseQuarter;

    @JsonProperty("courseSection")
    private String courseSection;

    @NotBlank
    @JsonProperty("userId")
    private String userId;

    public String getCourseName() {return courseName;}

    public void setCourseName(String courseName) {this.courseName = courseName;}

    public int getCourseYear() {return courseYear;}

    public void setYear(int courseYear) {this.courseYear = courseYear;}

    public String getCourseQuarter() {return courseQuarter;}

    public void setQuarter(String courseQuarter) {this.courseQuarter = courseQuarter;}

    public String getCourseSection() {return courseSection;}

    public void setSectionNumber(String courseSection) {this.courseSection = courseSection;}

    public String getUserId() {return userId;}

    public void setUserID(String userId) {this.userId = userId;}
}