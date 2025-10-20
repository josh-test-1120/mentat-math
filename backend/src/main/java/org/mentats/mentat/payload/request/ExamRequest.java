package org.mentats.mentat.payload.request;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * Form request validation serializer
 * Exam request objects
 * serialize Exam posts
 * @author Joshua Summers
 */
public class ExamRequest {
    private Long examId;

    @NotBlank
    @Size(min = 3, max = 20)
    private String examName;

    @NotNull
    private Integer examState;

    @NotNull
    private Integer examRequired;

    @NotNull
    private Integer examDifficulty;

    @NotNull
    private Long examCourseId;

    @NotNull
    private Double examDuration;

    @NotNull
    private Integer examOnline;

    private LocalDate examExpirationDate;

    /**
     * Getter for Exam Id
     * @return Long of examId
     */
    public Long getExamId() {
        return examId;
    }

    /**
     * Setter for Exam Id
     * @param examId Long of examId
     */
    public void setExamId (Long examId) {
        this.examId = examId;
    }

    /**
     * Getter for Exam name
     * @return string of examName
     */
    public String getExamName() {
        return examName;
    }

    /**
     * Setter for Exam name
     * @param examName string of examName
     */
    public void setExamName (String examName) {
        this.examName = examName;
    }

    /**
     * Getter for Exam state
     * @return Integer of examState
     */
    public Integer getExamState() { return examState; }

    /**
     * Setter for Exam state
     * @param examState Integer of examState
     */
    public void setExamState(Integer examState) {
        this.examState = examState;
    }

    /**
     * Getter for Exam required state
     * @return Integer of examRequired
     */
    public Integer getExamRequired() { return examRequired; }

    /**
     * Setter for Exam required state
     * @param examRequired Integer of examRequired
     */
    public void setExamRequired(Integer examRequired) {
        this.examRequired = examRequired;
    }

    /**
     * Getter for Exam difficulty
     * @return Integer of examDifficulty
     */
    public Integer getExamDifficulty() {
        return examDifficulty;
    }

    /**
     * Setter for Exam difficulty
     * @param examDifficulty Integer of examDifficulty
     */
    public void setExamDifficulty(Integer examDifficulty) {
        this.examDifficulty = examDifficulty;
    }

    /**
     * Getter for Exam Course ID
     * @return Long of examCourseId
     */
    public Long getExamCourseId() {
        return examCourseId;
    }

    /**
     * Setter for Exam Course ID
     * @param examCourseId Long of examCourseId
     */
    public void setExamCourseId(Long examCourseId) {
        this.examCourseId = examCourseId;
    }

    /**
     * Getter for Exam Online
     * @return Integer of examOnline
     */
    public Integer getExamOnline() {
        return examOnline;
    }

    /**
     * Setter for Exam Online
     * @param examOnline Integer of examOnline
     */
    public void setExamOnline(Integer examOnline) {
        this.examOnline = examOnline;
    }

    /**
     * Getter for Exam Duration
     * @return Double of examDuration
     */
    public Double getExamDuration() {
        return examDuration;
    }

    /**
     * Setter for Exam Duration
     * @param examDuration Double of examDuration
     */
    public void setExamDuration(Double examDuration) {
        this.examDuration = examDuration;
    }

    /**
     * Getter for Exam Expiration Date
     * @return LocalDate of examExpirationDate
     */
    public LocalDate getExamExpirationDate() {
        return examExpirationDate;
    }

    /**
     * Setter for Exam Expiration Date
     * @param examExpirationDate LocalDate of examExpirationDate
     */
    public void setExamExpirationDate(LocalDate examExpirationDate) {
        this.examExpirationDate = examExpirationDate;
    }

    /**
     * String override for output response
     * @return
     */
    @Override
    public String toString() {
        return "ExamRequest{" +
                "examId=" + examId +
                ", examName='" + examName + '\'' +
                ", examState=" + examState +
                ", examRequired=" + examRequired +
                ", examDifficulty=" + examDifficulty +
                ", examCourseId=" + examCourseId +
                ", examDuration=" + examDuration +
                ", examOnline=" + examOnline +
                ", examExpirationDate=" + examExpirationDate +
                '}';
    }
}