package org.mentats.mentat.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Repository;

/**
 * This class represents the Course entity that contains course details
 * @author Joshua Summers
 */
@Entity
//@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "course",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "course_id"),
                @UniqueConstraint(columnNames = {"course_section", "course_year", "course_quarter"})
        })
public class Course {
    /**
     * Report.Report.Course class fields.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    // Report.Report.Course ID for this course
    private Long courseId;

    // Course name
    @NotBlank
    @Size(max = 50)
    @JsonProperty("courseName") // Map JSON field to Java field
    @Column(name = "course_name")
    protected String courseName;

    // Course instructor ID
    @JsonProperty("courseProfessorId") // Map JSON field to Java field
    @Column(name = "course_professor_id")
    private Long courseProfessorId;

    // Course section
    @Size (max = 20)
    @JsonProperty("courseSection") // Map JSON field to Java field
    @Column(name = "course_section")
    public String courseSection;

    // Couse Year
    @Min(2000)
    @JsonProperty("courseYear") // Map JSON field to Java field
    @Column(name = "course_year")
    private int courseYear;

    // Course Quarter
    @NotBlank
    @Size(max = 20)
    @JsonProperty("courseQuarter") // Map JSON field to Java field
    @Column(name = "course_quarter")
    public String courseQuarter;

    // Course Grade Strategy
    @NotBlank
    @Size(max = 255)
    @JsonProperty("gradeStrategy") // Map JSON field to Java field
    @Column(name = "course_grade_strategy", columnDefinition = "JSON")
    public String gradeStrategy;

    /**
     * This is the constructor for the course Entity
     * @param courseId
     * @param courseName
     * @param courseProfessorId
     * @param courseQuarter
     * @param courseSection
     * @param courseYear
     * @param gradeStrategy
     */
    public Course(Long courseId, String courseName, Long courseProfessorId,
                  String courseQuarter, String courseSection, int courseYear,
                  String gradeStrategy) {
        this.courseId          = courseId;
        this.courseName        = courseName;
        this.courseProfessorId = courseProfessorId;
        this.courseQuarter     = courseQuarter;
        this.courseSection     = courseSection;
        this.courseYear        = courseYear;
        this.gradeStrategy     = gradeStrategy;
    }

    /**
     * Default constructor for Course
     */
    public Course() {

    }

    /**
     * A getter method that returns the course ID
     * @return String course ID
     */
    public Long getCourseId() {
        return courseId;
    }

    /**
     * A getter method that returns the instructor ID
     * @return String instructor ID
     */
    public Long getCourseProfessorId() {
        return courseProfessorId;
    }

    /**
     * A getter method that returns the Course name
     * @return String Course name
     */
    public String getCourseName() {
        return courseName;
    }

    /**
     * A getter method that returns the Course Section
     * @return String Course section
     */
    public String getCourseSection() {
        return courseSection;
    }

    /**
     * A getter method that returns the Course year
     * @return String Course year
     */
    public Integer getCourseYear() {
        return courseYear;
    }

    /**
     * A getter method that returns the Course quarter
     * @return String Course quarter
     */
    public String getCourseQuarter() {
        return courseQuarter;
    }

    public String getGradeStrategy() {
        return gradeStrategy;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public void setCourseProfessorId(Long courseProfessorId) {
        this.courseProfessorId = courseProfessorId;
    }

    public void setCourseSection(String courseSection) {
        this.courseSection = courseSection;
    }

    public void setCourseYear(int courseYear) {
        this.courseYear = courseYear;
    }

    public void setCourseQuarter(String courseQuarter) {
        this.courseQuarter = courseQuarter;
    }

    public void setGradeStrategy(String gradeStrategy) {
        this.gradeStrategy = gradeStrategy;
    }

    /**
     * This is the toString override for String result responses
     * @return String output of keys and values
     */
    @Override
    public String toString() {
        return "Course{" +
                "courseId=" + courseId +
                ", courseName='" + courseName + '\'' +
                ", courseProfessorId=" + courseProfessorId +
                ", courseSection='" + courseSection + '\'' +
                ", courseYear=" + courseYear +
                ", courseQuarter='" + courseQuarter + '\'' +
                ", gradeStrategy='" + gradeStrategy + '\'' +
                '}';
    }
}