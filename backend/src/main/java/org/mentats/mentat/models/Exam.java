package org.mentats.mentat.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
    private Long Id;

    // The course id assigned to exam
    @NotBlank
    @JsonProperty("courseId") // Map JSON field to Java field
    @Column(name = "exam_course_id")
    private Long courseId;

    // The name assigned to exam
    @NotBlank
    @JsonProperty("examName") // Map JSON field to Java field
    @Column(name = "exam_name")
    private String name;

    // The status assigned to exam
    @NotBlank
    @JsonProperty("examState") // Map JSON field to Java field
    @Column(name = "exam_state")
    private Integer state;

    // The required state of the exam
    @NotBlank
    @JsonProperty("examRequired") // Map JSON field to Java field
    @Column(name = "exam_required")
    private Integer required;

    // The required state of the exam
    @NotBlank
    @JsonProperty("examDifficulty") // Map JSON field to Java field
    @Column(name = "exam_difficulty")
    private Integer difficulty;

    // The duration of the exam
    @NotBlank
    @JsonProperty("examDuration") // Map JSON field to Java field
    @Column(name = "exam_duration")
    private Double duration;

    // Is the exam online or offline
    @NotBlank
    @JsonProperty("examOnline") // Map JSON field to Java field
    @Column(name = "exam_online")
    private Integer online;

    /**
     * This is the constructor for the Exam entity
     * @param Id
     * @param courseId
     * @param name
     * @param state
     * @param required
     * @param difficulty
     * @param duration
     * @param online
     */
    public Exam(Long Id, Long courseId, String name, Integer state,
                Integer required, Integer difficulty, Double duration, Integer online) {
        this.Id = Id;
        this.courseId = courseId;
        this.name = name;
        this.state = state;
        this.required = required;
        this.difficulty = difficulty;
        this.duration = duration;
        this.online = online;
    }

    /**
     * Default (empty) constructor for ExamResult entity
     */
    public Exam() {

    }

    // Getters and Setters for Entity
    public Long getId() {
        return Id;
    }

    public void setId(Long id) {
        Id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getState() {
        return state;
    }

    public void setState(Integer state) {
        this.state = state;
    }

    public Integer getRequired() {
        return required;
    }

    public void setRequired(Integer required) {
        this.required = required;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public Integer getOnline() {
        return online;
    }

    public void setOnline(Integer online) {
        this.online = online;
    }

    public Integer getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Integer difficulty) {
        this.difficulty = difficulty;
    }

    /**
     * This is the toString override for String result responses
     * @return String output of keys and values
     */
    @Override
    public String toString() {
        return "Exam{" +
                "Id=" + Id +
                ", courseId=" + courseId +
                ", name='" + name + '\'' +
                ", state=" + state +
                ", required=" + required +
                ", difficulty=" + difficulty +
                ", duration=" + duration +
                ", online=" + online +
                '}';
    }
}