package org.mentats.mentat.payload.response;
import org.mentats.mentat.models.Exam;

import java.time.LocalDate;

/**
 * Form response validation serializer
 * Exam response objects
 * serialize Exam responses
 * @author Joshua Summers
 */
public class ExamResponse {
    private Long examId;
    private Long courseId;    // Only ID, not full entity
    private String examName;
    private Integer examRequired;
    private Integer examState;
    private Integer examDifficulty;
    private Double examDuration;
    private Integer examOnline;
    private LocalDate expirationDate;

    // Constructor from Entity
    public ExamResponse(Exam exam) {
        this.examId = exam.getId();
        this.courseId = exam.getCourse() != null ? exam.getCourse().getCourseId() : null;
        this.examName = exam.getName();
        this.examRequired = exam.getRequired();
        this.examState = exam.getState();
        this.examDifficulty = exam.getDifficulty();
        this.examDuration = exam.getDuration();
        this.examOnline = exam.getOnline();
        this.expirationDate = exam.getExpirationDate();
    }

    // Constructor for Projection injection (manual)
    public ExamResponse(Long examId, Long courseId, String examName, Integer examRequired,
                        Integer examState, Integer examDifficulty, Double examDuration,
                        Integer examOnline, LocalDate expirationDate) {
        this.examId = examId;
        this.courseId = courseId;
        this.examName = examName;
        this.examRequired = examRequired;
        this.examState = examState;
        this.examDifficulty = examDifficulty;
        this.examDuration = examDuration;
        this.examOnline = examOnline;
        this.expirationDate = expirationDate;
    }

    // Getters only (response is read-only)
    public Long getExamId() { return examId; }
    public Long getCourseId() { return courseId; }
    public String getExamName() { return examName; }
    public Integer getExamRequired() { return examRequired; }
    public Integer getExamState() { return examState; }
    public Integer getExamDifficulty() { return examDifficulty; }
    public Integer getExamOnline() { return examOnline; }
    public Double getExamDuration() { return examDuration; }
    public LocalDate getExpirationDate() { return expirationDate; }

    /**
     * String override for output response
     * @return
     */
    @Override
    public String toString() {
        return "ExamResponse{" +
                "examId=" + examId +
                ", courseId=" + courseId +
                ", examName='" + examName + '\'' +
                ", examRequired=" + examRequired +
                ", examState=" + examState +
                ", examDifficulty=" + examDifficulty +
                ", examDuration=" + examDuration +
                ", examOnline=" + examOnline +
                ", expirationDate=" + expirationDate +
                '}';
    }
}