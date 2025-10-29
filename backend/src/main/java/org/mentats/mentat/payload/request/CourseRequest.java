package org.mentats.mentat.payload.request;
import jakarta.validation.constraints.*;

/**
 * Form request validation serializer
 * Course request objects
 * serialize Course posts
 * @author Joshua Summers
 */
public class CourseRequest {
    private Long courseId;

    @NotBlank
    @Size(min = 3, max = 20)
    private String courseName;

    @NotNull
    private Long courseProfessorId;

    @NotBlank
    @Size(max = 20)
    private String courseSection;

    @NotBlank
    @Size(max = 20)
    private String courseQuarter;

    @NotNull
    @Min(2000)
    private Integer courseYear;

    private String gradeStrategy;

    /**
     * Default constructor
     */
    public CourseRequest() {
    }

    /**
     * Getter for Course Id
     * @return Long of courseId
     */
    public Long getCourseId() {
        return courseId;
    }

    /**
     * Setter for Course Id
     * @param courseId Long of courseId
     */
    public void setCourseId (Long courseId) {
        this.courseId = courseId;
    }

    /**
     * Getter for Course name
     * @return string of courseName
     */
    public String getCourseName() {
        return courseName;
    }

    /**
     * Setter for Course name
     * @param courseName string of courseName
     */
    public void setCourseName (String courseName) {
        this.courseName = courseName;
    }

    /**
     * Getter for Course Professor ID
     * @return Integer of courseProfessorId
     */
    public Long getCourseProfessorId() { return courseProfessorId; }

    /**
     * Setter for Course Professor ID
     * @param courseProfessorId Long of courseProfessorId
     */
    public void setCourseProfessorId(Long courseProfessorId) {
        this.courseProfessorId = courseProfessorId;
    }

    /**
     * Getter for Course Section
     * @return String of courseSection
     */
    public String getCourseSection() { return courseSection; }

    /**
     * Setter for Course Section
     * @param courseSection String of courseSection
     */
    public void setCourseSection(String courseSection) {
        this.courseSection = courseSection;
    }

    /**
     * Getter for Course Quarter
     * @return String of courseQuarter
     */
    public String getCourseQuarter() {
        return courseQuarter;
    }

    /**
     * Setter for Course Quarter
     * @param courseQuarter String of courseQuarter
     */
    public void setCourseQuarter(String courseQuarter) {
        this.courseQuarter = courseQuarter;
    }

    /**
     * Getter for Course Year
     * @return Integer of courseYear
     */
    public Integer getCourseYear() {
        return courseYear;
    }

    /**
     * Setter for Course Year
     * @param courseYear Integer of courseYear
     */
    public void setCourseYear(Integer courseYear) {
        this.courseYear = courseYear;
    }

    /**
     * Getter for Course Grade Strategy
     * @return String of gradeStrategy
     */
    public String getGradeStrategy() {
        return gradeStrategy;
    }

    /**
     * Setter for Course Grade Strategy
     * @param gradeStrategy String of gradeStrategy
     */
    public void setGradeStrategy(String gradeStrategy) {
        this.gradeStrategy = gradeStrategy;
    }

    /**
     * String override for output response
     * @return
     */
    @Override
    public String toString() {
        return "CourseRequest{" +
                "courseId=" + courseId +
                ", courseName='" + courseName + '\'' +
                ", courseProfessorId=" + courseProfessorId +
                ", courseSection='" + courseSection + '\'' +
                ", courseQuarter='" + courseQuarter + '\'' +
                ", courseYear=" + courseYear +
                ", gradeStrategy='" + gradeStrategy + '\'' +
                '}';
    }
}