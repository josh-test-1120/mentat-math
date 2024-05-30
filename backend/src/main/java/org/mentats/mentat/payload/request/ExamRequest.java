package org.mentats.mentat.payload.request;

import java.util.Set;

import jakarta.validation.constraints.*;

/**
 * Form request validation serializer
 * Signup request objects
 * new User creation
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

    public String getExam_name() {
        return exam_name;
    }

    public void setExam_name (String exam_name) {
        this.exam_name = exam_name;
    }

    public boolean getIs_published() { return is_published; }

    public void setIs_published(boolean is_published) {
        this.is_published = is_published;
    }

    public boolean getIs_required() { return is_required; }

    public void setIs_required(boolean is_required) {
        this.is_required = is_required;
    }

    public int getExam_difficulty() {
        return exam_difficulty;
    }

    public void setExam_difficulty(int exam_difficulty) {
        this.exam_difficulty = exam_difficulty;
    }

    public int getExam_course_id() {
        return exam_course_id;
    }

    public void setExam_course_id(int exam_course_id) {
        this.exam_course_id = exam_course_id;
    }
}