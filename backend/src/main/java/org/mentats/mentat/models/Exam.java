package org.mentats.mentat.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

/**
 * This class represents the Exam entity that contains exam details
 * @author Joshua Summers
 */
@Entity
@Table(name = "exam")
public class Exam {
    /**
     * Exam model class fields.
     */
    // Primary Key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("examId") // Map JSON field to Java field
    @Column(name = "exam_id", updatable = false, nullable = false)
    private Long Id;

    // The course id assigned to exam
    // Fix course relationship - should be ManyToOne to Course entity
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_course_id")
    @JsonIgnore()
    private Course course;

    // The name assigned to exam
    @NotBlank
//    @JsonProperty("examName") // Map JSON field to Java field
    @Column(name = "exam_name")
    private String name;

    // The status assigned to exam
    @NotNull
//    @JsonProperty("examState") // Map JSON field to Java field
    @Column(name = "exam_state")
    private Integer state;

    // The required state of the exam
    @NotNull
//    @JsonProperty("examRequired") // Map JSON field to Java field
    @Column(name = "exam_required")
    private Integer required;

    // The required state of the exam
//    @JsonProperty("examDifficulty") // Map JSON field to Java field
    @Column(name = "exam_difficulty", nullable = true)
    private Integer difficulty;

    // The duration of the exam
    @NotNull
//    @JsonProperty("examDuration") // Map JSON field to Java field
    @Column(name = "exam_duration")
    private Double duration;

    // Is the exam online or offline
    @NotNull
//    @JsonProperty("examOnline") // Map JSON field to Java field
    @Column(name = "exam_online")
    private Integer online;

    // Optional booking expiration date. NULL => no expiration
//    @JsonProperty("examExpirationDate")
    @Column(name = "exam_expiration_date", nullable = true)
    private LocalDate expirationDate;

    /**
     * This is the constructor for the Exam entity
     * @param Id
     * @param course
     * @param name
     * @param state
     * @param required
     * @param difficulty
     * @param duration
     * @param online
     */
    public Exam(Long Id, Course course, String name, Integer state,
                Integer required, Integer difficulty, Double duration, Integer online) {
        this.Id = Id;
        this.course = course;
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

    public Course getCourse() { return course; }

    public void setCourse(Course course) { this.course = course; }

//    public Long getCourseId() {
//        return courseId;
//    }
//
//    public void setCourseId(Long courseId) {
//        this.courseId = courseId;
//    }

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

    public LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public Integer getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Integer difficulty) {
        this.difficulty = difficulty;
    }

    @JsonProperty("courseId")
    public Long getCourseId() {
        return course != null ? course.getCourseId() : null;
    }

    /**
     * This is the toString override for String result responses
     * @return String output of keys and values
     */
    @Override
    public String toString() {
        return "Exam{" +
                "Id=" + Id +
                ", courseId=" + (course != null ? course.toString() : "null") +
                ", name='" + name + '\'' +
                ", state=" + state +
                ", required=" + required +
                ", difficulty=" + difficulty +
                ", duration=" + duration +
                ", online=" + online +
                ", expirationDate=" + expirationDate +
                '}';
    }
}