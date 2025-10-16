package org.mentats.mentat.payload.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.sql.Date;

/**
 * Form request validation serializer
 * Exam result request objects
 * serialize Exam result posts
 * @author Joshua Summers
 */
public class ExamResultRequest {
    @NotNull
    private Long examStudentId;

    @NotNull
    private Long examId;

    @NotNull
    private Integer examVersion;

    @Size(max = 1)
    private String examScore;

    @NotNull
    private Date examScheduledDate;

    private Date examTakenDate;

    // Default constructor
    public ExamResultRequest() {}

    // Getters and setters
    public Long getExamStudentId() { return examStudentId; }
    public void setExamStudentId(Long examStudentId) { this.examStudentId = examStudentId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public Integer getExamVersion() { return examVersion; }
    public void setExamVersion(Integer examVersion) { this.examVersion = examVersion; }

    public String getExamScore() { return examScore; }
    public void setExamScore(String examScore) { this.examScore = examScore; }

    public Date getExamScheduledDate() { return examScheduledDate; }
    public void setExamScheduledDate(Date examScheduledDate) { this.examScheduledDate = examScheduledDate; }

    public Date getExamTakenDate() { return examTakenDate; }
    public void setExamTakenDate(Date examTakenDate) { this.examTakenDate = examTakenDate; }

    /**
     * String override for output response
     * @return
     */
    @Override
    public String toString() {
        return "ExamResultRequest{" +
                "examStudentId=" + examStudentId +
                ", examId=" + examId +
                ", examVersion=" + examVersion +
                ", examScore='" + examScore + '\'' +
                ", examScheduledDate=" + examScheduledDate +
                ", examTakenDate=" + examTakenDate +
                '}';
    }
}