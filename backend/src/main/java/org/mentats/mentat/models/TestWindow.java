// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/models/TestWindow.java
// This is the JPA model for the TestWindow entity.
// It is used to store the test window data.
package org.mentats.mentat.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_window")
public class TestWindow {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_window_id")
    private Integer testWindowId;
    
    @Column(name = "test_start_time", nullable = false)
    private LocalTime testStartTime;
    
    @Column(name = "test_end_time", nullable = false)
    private LocalTime testEndTime;
    
    @Column(name = "test_window_created_datetime", nullable = false)
    private LocalDateTime testWindowCreatedDatetime;
    
    @Column(name = "test_window_start_date")
    private LocalDate testWindowStartDate;
    
    @Column(name = "test_window_end_date")
    private LocalDate testWindowEndDate;
    
    @Column(name = "course_id", nullable = false)
    private Integer courseId;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "test_window_title", nullable = false, length = 255)
    private String testWindowTitle;
    
    @Column(name = "weekdays", columnDefinition = "JSON", nullable = false)
    private String weekdays;
    
    @Column(name = "exceptions", columnDefinition = "JSON")
    private String exceptions;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    // Constructors
    public TestWindow() {}
    
    public TestWindow(String testWindowTitle, LocalTime testStartTime, LocalTime testEndTime, 
                     LocalDate testWindowStartDate, LocalDate testWindowEndDate, 
                     Integer courseId, String description, String weekdays, 
                     String exceptions, Boolean isActive) {
        this.testWindowTitle = testWindowTitle;
        this.testStartTime = testStartTime;
        this.testEndTime = testEndTime;
        this.testWindowStartDate = testWindowStartDate;
        this.testWindowEndDate = testWindowEndDate;
        this.courseId = courseId;
        this.description = description;
        this.weekdays = weekdays;
        this.exceptions = exceptions;
        this.isActive = isActive;
        this.testWindowCreatedDatetime = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Integer getTestWindowId() { return testWindowId; }
    public void setTestWindowId(Integer testWindowId) { this.testWindowId = testWindowId; }
    
    public LocalTime getTestStartTime() { return testStartTime; }
    public void setTestStartTime(LocalTime testStartTime) { this.testStartTime = testStartTime; }
    
    public LocalTime getTestEndTime() { return testEndTime; }
    public void setTestEndTime(LocalTime testEndTime) { this.testEndTime = testEndTime; }
    
    public LocalDateTime getTestWindowCreatedDatetime() { return testWindowCreatedDatetime; }
    public void setTestWindowCreatedDatetime(LocalDateTime testWindowCreatedDatetime) { this.testWindowCreatedDatetime = testWindowCreatedDatetime; }
    
    public LocalDate getTestWindowStartDate() { return testWindowStartDate; }
    public void setTestWindowStartDate(LocalDate testWindowStartDate) { this.testWindowStartDate = testWindowStartDate; }
    
    public LocalDate getTestWindowEndDate() { return testWindowEndDate; }
    public void setTestWindowEndDate(LocalDate testWindowEndDate) { this.testWindowEndDate = testWindowEndDate; }
    
    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getTestWindowTitle() { return testWindowTitle; }
    public void setTestWindowTitle(String testWindowTitle) { this.testWindowTitle = testWindowTitle; }
    
    public String getWeekdays() { return weekdays; }
    public void setWeekdays(String weekdays) { this.weekdays = weekdays; }
    
    public String getExceptions() { return exceptions; }
    public void setExceptions(String exceptions) { this.exceptions = exceptions; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}