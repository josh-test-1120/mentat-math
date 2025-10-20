package org.mentats.mentat.payload.response;

import org.mentats.mentat.models.ExamResult;
import java.sql.Date;

/**
 * Form response validation serializer
 * Exam result response objects
 * serialize Exam result responses
 * @author Joshua Summers
 */
public class ExamResultResponse {
    private Long examResultId;
    private Long examStudentId;    // Only ID, not full entity
    private Long examId;           // Only ID, not full entity
    private Integer examVersion;
    private String examScore;
    private Date examScheduledDate;
    private Date examTakenDate;

    // Constructor from Entity
    public ExamResultResponse(ExamResult examResult) {
        this.examResultId = examResult.getId();
        this.examStudentId = examResult.getStudent() != null ? examResult.getStudent().getId() : null;
        this.examId = examResult.getExam() != null ? examResult.getExam().getId() : null;
        this.examVersion = examResult.getExamVersion();
        this.examScore = examResult.getExamScore();
        this.examScheduledDate = examResult.getExamScheduledDate();
        this.examTakenDate = examResult.getExamTakenDate();
    }

    // Constructor for Projection injection (manual)
    public ExamResultResponse(Long examResultId, Long studentId, Long examId,
                              Integer examVersion, String examScore,
                              Date examScheduledDate, Date examTakenDate) {
        this.examResultId = examResultId;
        this.examStudentId = studentId;
        this.examId = examId;
        this.examVersion = examVersion;
        this.examScore = examScore;
        this.examScheduledDate = examScheduledDate;
        this.examTakenDate = examTakenDate;
    }

    // Getters only (response is read-only)
    public Long getExamResultId() { return examResultId; }
    public Long getExamStudentId() { return examStudentId; }
    public Long getExamId() { return examId; }
    public Integer getExamVersion() { return examVersion; }
    public String getExamScore() { return examScore; }
    public Date getExamScheduledDate() { return examScheduledDate; }
    public Date getExamTakenDate() { return examTakenDate; }

    /**
     * String override for output response
     * @return
     */
    @Override
    public String toString() {
        return "ExamResultResponse{" +
                "examResultId=" + examResultId +
                ", examStudentId=" + examStudentId +
                ", examId=" + examId +
                ", examVersion=" + examVersion +
                ", examScore='" + examScore + '\'' +
                ", examScheduledDate=" + examScheduledDate +
                ", examTakenDate=" + examTakenDate +
                '}';
    }
}