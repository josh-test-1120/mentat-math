package org.mentats.mentat.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

@Entity
@Table(name = "StudentCourse",
       uniqueConstraints = @UniqueConstraint(columnNames = {"course_id","student_id"}))
@IdClass(StudentCourseId.class)
public class StudentCourse {

    @Id
    @Column(name = "course_id", nullable = false)
    @JsonProperty("courseId")
    private int courseId;

    @Id
    @Column(name = "student_id", nullable = false)
    @JsonProperty("studentId")
    private int studentId;

    @Pattern(regexp = "^(A\\+|A|A-|B\\+|B|B-|C\\+|C|C-|D\\+|D|D-|F|INC|P|NP)$",
         message = "Invalid grade format")
    @Column(name = "student_course_grade", nullable = true, length = 5)
    private String studentCourseGrade;

    @Column(name = "student_date_registered", nullable = false)
    private LocalDate studentDateRegistered;

    public StudentCourse() {}
    public StudentCourse(int courseId, int studentId, LocalDate studentDateRegistered) {
        this.courseId = courseId;
        this.studentId = studentId;
        this.studentDateRegistered = studentDateRegistered;
    }

    public int getCourseId() {
        return courseId;
    }

    public int getStudentId() {
        return studentId;
    }

    public LocalDate getStudentDateRegistered() {
        return studentDateRegistered;
    }

    public String getStudentCourseGrade() {
        return studentCourseGrade;
    }

    public void setCourseId(int courseId) {
        this.courseId = courseId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public void setStudentDateRegistered(LocalDate studentDateRegistered) {
        this.studentDateRegistered = studentDateRegistered;
    }
    
    public void setStudentCourseGrade(String studentCourseGrade) {
        this.studentCourseGrade = studentCourseGrade;
    }


}