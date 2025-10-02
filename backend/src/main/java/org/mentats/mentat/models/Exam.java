package org.mentats.mentat.models;

import java.sql.Date;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Repository;

/**
 * This class represents the Exam entity that contains exam details
 * @author Joshua Summers
 */
@Entity
@Repository
public class Exam {
    /**
     * Exam model class fields.
     */
    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("examId") // Map JSON field to Java field
    @Column(name = "exam_id")
    private Integer Id;

    // The course id assigned to exam
    @NotBlank
    @JsonProperty("courseId") // Map JSON field to Java field
    @Column(name = "exam_course_id")
    private Integer courseId;

    // The name assigned to exam
    @NotBlank
    @JsonProperty("examName") // Map JSON field to Java field
    @Column(name = "exam_name")
    private String name;

    // The status assigned to exam
    @NotBlank
    @JsonProperty("examState") // Map JSON field to Java field
    @Column(name = "exam_state")
    private Boolean state;

    // The required state of the exam
    @NotBlank
    @JsonProperty("examRequired") // Map JSON field to Java field
    @Column(name = "exam_required")
    private Boolean required;

    @NotBlank
    @JsonProperty("examDuration") // Map JSON field to Java field
    @Column(name = "exam_duration")
    private Double duration;

    @NotBlank
    @JsonProperty("examOnline") // Map JSON field to Java field
    @Column(name = "exam_online")
    private Boolean online;

    /**
     * This is the constructor for the Exam entity
     * @param Id
     * @param courseId
     * @param name
     * @param state
     * @param required
     * @param duration
     * @param online
     */
    public Exam(Integer Id, Integer courseId, String name, Boolean state,
                Boolean required, Double duration, Boolean online) {
        this.Id = Id;
        this.courseId = courseId;
        this.name = name;
        this.state = state;
        this.required = required;
        this.duration = duration;
        this.online = online;
    }

    /**
     * Default (empty) constructor for ExamResult entity
     */
    public Exam() {

    }

    // Getters and Setters for Entity
    public Integer getId() {
        return Id;
    }

    public void setId(Integer id) {
        Id = id;
    }

    public Integer getCourseId() {
        return courseId;
    }

    public void setCourseId(Integer courseId) {
        this.courseId = courseId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getState() {
        return state;
    }

    public void setState(Boolean state) {
        this.state = state;
    }

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public Boolean getOnline() {
        return online;
    }

    public void setOnline(Boolean online) {
        this.online = online;
    }
}