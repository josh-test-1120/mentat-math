package org.mentats.mentat.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

/**
 * Form request validation serializer
 * Exam request objects
 * new Exam creation
 * @author Joshua Summers
 */
public class ExamRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    @JsonProperty("exam_name")
    private String exam_name;

    @NotBlank
    @JsonProperty("exam_state")
    private Boolean exam_state;

    @NotBlank
    @JsonProperty("exam_required")
    private Boolean exam_required;

    @NotBlank
    @JsonProperty("exam_difficulty")
    private Integer exam_difficulty;

    @NotBlank
    @JsonProperty("exam_course_id")
    private Integer exam_course_id;

    @NotBlank
    @JsonProperty("exam_duration")
    private Double exam_duration;

    @NotBlank
    @JsonProperty("exam_online")
    private Boolean exam_online;

    /**
     * Getter for Exam name
     * @return string of exam name
     */
    public String getExam_name() {
        return exam_name;
    }

    /**
     * Setter for Exam name
     * @param exam_name string of exam name
     */
    public void setExam_name (String exam_name) {
        this.exam_name = exam_name;
    }

    /**
     * Getter for Is Published
     * @return boolean of is published
     */
    public Boolean getIs_published() { return exam_state; }

    /**
     * Setter for Is Published
     * @param exam_state boolean of is published
     */
    public void setIs_published(Boolean exam_state) {
        this.exam_state = exam_state;
    }

    /**
     * Getter for Is Required
     * @return boolean of is required
     */
    public Boolean getIs_required() { return exam_required; }

    /**
     * Setter for Is Required
     * @param exam_required boolean of is required
     */
    public void setIs_required(Boolean exam_required) {
        this.exam_required = exam_required;
    }

    /**
     * Getter for Exam difficulty
     * @return int of exam difficulty
     */
    public Integer getExam_difficulty() {
        return exam_difficulty;
    }

    /**
     * Setter for Exam difficulty
     * @param exam_difficulty int of exam difficulty
     */
    public void setExam_difficulty(Integer exam_difficulty) {
        this.exam_difficulty = exam_difficulty;
    }

    /**
     * Getter for Exam Course ID
     * @return int of exam course ID
     */
    public Integer getExam_course_id() {
        return exam_course_id;
    }

    /**
     * Setter for Exam Course ID
     * @param exam_course_id int of exam course ID
     */
    public void setExam_course_id(Integer exam_course_id) {
        this.exam_course_id = exam_course_id;
    }

    /**
     * Getter for Exam Duration
     * @return string of exam duration
     */
    public Boolean getExam_online() {
        return exam_online;
    }

    /**
     * Setter for Exam Course ID
     * @param exam_online int of exam course ID
     */
    public void setExam_online(Boolean exam_online) {
        this.exam_online = exam_online;
    }

    /**
     * Getter for Exam Duration
     * @return string of exam duration
     */
    public Double getExam_duration() {
        return exam_duration;
    }

    /**
     * Setter for Exam Course ID
     * @param exam_duration int of exam course ID
     */
    public void setExam_duration(Double exam_duration) {
        this.exam_duration = exam_duration;
    }
}