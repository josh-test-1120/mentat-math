package org.mentats.mentat.payload.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Form request validation serializer
 * Student ourse request objects
 * serialize Student Course posts
 * @author Joshua Summers
 */
public class StudentCourseRequest {

    private Long courseId;

    private Long studentId;

    @Size(min = 0, max = 5)
    private String studentCourseGrade;

    @NotNull
    private LocalDate studentDateRegistered;

    /**
     * Default constructor
     */
    public StudentCourseRequest() {}


    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentCourseGrade() {
        return studentCourseGrade;
    }

    public void setStudentCourseGrade(String studentCourseGrade) {
        this.studentCourseGrade = studentCourseGrade;
    }

    public LocalDate getStudentDateRegistered() {
        return studentDateRegistered;
    }

    public void setStudentDateRegistered(LocalDate studentDateRegistered) {
        this.studentDateRegistered = studentDateRegistered;
    }

    @Override
    public String toString() {
        return "StudentCourseRequest{" +
                "courseId=" + courseId +
                ", studentId=" + studentId +
                ", studentCourseGrade='" + studentCourseGrade + '\'' +
                ", studentDateRegistered=" + studentDateRegistered +
                '}';
    }
}