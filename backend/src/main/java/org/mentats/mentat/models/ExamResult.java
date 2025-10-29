package org.mentats.mentat.models;

import java.math.BigInteger;
import java.sql.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Repository;

/**
 * This class maps the exam_result table to a class
 * additional logic is included to improve relational data access
 * @author Joshua Summers
 */
@Entity
@Table(name = "exam_result")
public class ExamResult {
    /**
     * Exam Result model class fields.
     */
    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_result_id", updatable = false, nullable = false)
    private Long Id;

    // Fix the student relationship - should be ManyToOne to Student entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_student_id")
    @NotNull
    private User student;

    // Fix the exam relationship - should be ManyToOne to Exam entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    @NotNull
    private Exam exam;

    // The version of the exam assigned
    @NotNull
    @Column(name = "exam_version")
    public Integer examVersion;

    // The score of the exam assigned
    @Size(max = 1)
    @Column(name = "exam_score")
    public String examScore;

    // This is the date the exam is scheduled for
    @NotNull
    @Column(name = "exam_scheduled_date")
    private Date examScheduledDate;

    // This is the date the exam was taken
    @Column(name = "exam_taken_date")
    public Date examTakenDate;

    /**
     * This is the constructor for the ExamResult entity
     * @param Id
     * @param student
     * @param exam
     * @param examVersion
     * @param examScore
     * @param examScheduledDate
     * @param examTakenDate
     */
    public ExamResult(Long Id, User student, Exam exam,
                      Integer examVersion, String examScore,
                      Date examScheduledDate, Date examTakenDate) {
        this.Id = Id;
        this.student = student;
        this.exam = exam;
        this.examVersion = examVersion;
        this.examScore = examScore;
        this.examScheduledDate = examScheduledDate;
        this.examTakenDate = examTakenDate;
    }

    /**
     * Default (empty) constructor for ExamResult entity
     */
    public ExamResult() {

    }

    // Getters for the entity
    public Long getId() {
        return Id;
    }

    public User getStudent() { return student; }

    public Exam getExam() { return exam; }

    public Integer getExamVersion() {
        return examVersion;
    }

    public String getExamScore() {
        return examScore;
    }

    public Date getExamScheduledDate() {
        return examScheduledDate;
    }

    public Date getExamTakenDate() {
        return examTakenDate;
    }

    // Setters for the entity
    public void setId(Long Id) {
        this.Id = Id;
    }

    public void setStudent(User student) { this.student = student; }

    public void setExam(Exam exam) { this.exam = exam; }

    public void setExamVersion(Integer examVersion) {
        this.examVersion = examVersion;
    }

    public void setExamScore(String examScore) {
        this.examScore = examScore;
    }

    public void setExamScheduledDate(Date examScheduledDate) {
        this.examScheduledDate = examScheduledDate;
    }

    public void setExamTakenDate(Date examTakenDate) {
        this.examTakenDate = examTakenDate;
    }

    // JSON properties for API responses
    @JsonProperty("studentId")
    public Long getStudentId() {
        return student != null ? student.getId() : null;
    }

    @JsonProperty("examId")
    public Long getExamId() {
        return exam != null ? exam.getId() : null;
    }

    /**
     * This is the toString override for String result responses
     * @return String output of keys and values
     */
    @Override
    public String toString() {
        return "ExamResult{" +
                "examResultId=" + Id +
                ", student=" + (student != null ? student.toString() : "null") +
                ", exam=" + (exam != null ? exam.toString() : "null") +
                ", examVersion=" + examVersion +
                ", examScore='" + examScore +
                ", examScheduledDate=" + (examScheduledDate != null ? examScheduledDate.toString() : "null") +
                ", examTakenDate=" + (examTakenDate != null ? examTakenDate.toString() : "null") +
                '}';
    }
}