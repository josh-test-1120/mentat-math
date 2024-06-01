package org.mentats.mentat.payload.request;

import java.util.Set;

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
    private String exam_name;

    @NotBlank
    private boolean is_published;

    @NotBlank
    private boolean is_required;

    @NotBlank
    private int exam_difficulty;

    @NotBlank
    private int exam_course_id;

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
    public boolean getIs_published() { return is_published; }

    /**
     * Setter for Is Published
     * @param is_published boolean of is published
     */
    public void setIs_published(boolean is_published) {
        this.is_published = is_published;
    }

    /**
     * Getter for Is Required
     * @return boolean of is required
     */
    public boolean getIs_required() { return is_required; }

    /**
     * Setter for Is Required
     * @param is_required boolean of is required
     */
    public void setIs_required(boolean is_required) {
        this.is_required = is_required;
    }

    /**
     * Getter for Exam difficulty
     * @return int of exam difficulty
     */
    public int getExam_difficulty() {
        return exam_difficulty;
    }

    /**
     * Setter for Exam difficulty
     * @param exam_difficulty int of exam difficulty
     */
    public void setExam_difficulty(int exam_difficulty) {
        this.exam_difficulty = exam_difficulty;
    }

    /**
     * Getter for Exam Course ID
     * @return int of exam course ID
     */
    public int getExam_course_id() {
        return exam_course_id;
    }

    /**
     * Setter for Exam Course ID
     * @param exam_course_id int of exam course ID
     */
    public void setExam_course_id(int exam_course_id) {
        this.exam_course_id = exam_course_id;
    }
}