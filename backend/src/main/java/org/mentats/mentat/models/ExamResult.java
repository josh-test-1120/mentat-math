package org.mentats.mentat.models;

import java.math.BigInteger;
import java.sql.Date;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Repository;

/**
 * This class maps the exam_result table to a class
 * additional logic is included to improve relational data access
 * @author Joshua Summers
 */
@Entity
@Repository
public class ExamResult {
    /**
     * Exam Result model class fields.
     */
    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("examResultId") // Map JSON field to Java field
    @Column(name = "exam_result_id", updatable = false, nullable = false)
    private Long Id;

    // The student assigned to exam result
    @NotBlank
    @JsonProperty("examStudentId") // Map JSON field to Java field
    @Column(name = "exam_student_id")
    protected Long studentId;

    // The exam assigned to the result
    @JsonProperty("examId") // Map JSON field to Java field
    @NotBlank
    @Column(name = "exam_id")
    private Long examId;

    // The version of the exam assigned
    @Size(max = 20)
    @JsonProperty("examVersion") // Map JSON field to Java field
    @NotBlank
    @Column(name = "exam_version")
    public Integer examVersion;

    // The score of the exam assigned
    @Size(max = 1)
    @JsonProperty("examScore") // Map JSON field to Java field
    @NotBlank
    @Column(name = "exam_score")
    public String examScore;

    // This is the date the exam is scheduled for
    @NotBlank
    @JsonProperty("examScheduledDate") // Map JSON field to Java field
    @Column(name = "exam_scheduled_date")
    private Date examScheduledDate;

    // This is the date the exam was taken
    @NotBlank
    @JsonProperty("examTakenDate") // Map JSON field to Java field
    @Column(name = "exam_taken_date")
    public Date examTakenDate;

    /**
     * This is the constructor for the ExamResult entity
     *
     * @param Id                this is the exam result id
     * @param studentId         this is the student id
     * @param examId            this is the exam id
     * @param examVersion       this is the exam version
     * @param examScheduledDate this is the exam scheduled date
     * @param examTakenDate     this is the exam taken date
     */
    public ExamResult(Long Id, Long studentId, Long examId,
                      Integer examVersion, String examScore,
                      Date examScheduledDate, Date examTakenDate) {
        this.Id = Id;
        this.studentId = studentId;
        this.examId = examId;
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

    public Long getStudentId() {
        return studentId;
    }

    public Long getExamId() {
        return examId;
    }

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

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

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

    /**
     * This is the toString override for String result responses
     * @return String output of keys and values
     */
    @Override
    public String toString() {
        return "ExamResult{" +
                "examResultId=" + Id +
                ", studentId=" + studentId +
                ", examId=" + examId +
                ", examVersion=" + examVersion +
                ", examScore='" + examScore +
                ", examScheduledDate=" + examScheduledDate.toString() +
                ", examTakenDate=" + examTakenDate.toString() +
                '}';
    }
}
