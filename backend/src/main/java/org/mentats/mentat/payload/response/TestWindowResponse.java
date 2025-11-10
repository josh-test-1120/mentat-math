package org.mentats.mentat.payload.response;

import org.mentats.mentat.models.TestWindow;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

/**
 * Form response validation serializer
 * TestWindow response objects
 * serialize TestWindow responses
 * @author Telmen Enkhtuvshin
 */
public class TestWindowResponse {
    private Long testWindowId;
    private String testWindowTitle;
    private String description;
    private Long courseId;
    private LocalDate testWindowStartDate;
    private LocalDate testWindowEndDate;
    private LocalTime testStartTime;
    private LocalTime testEndTime;
    private String weekdays;
    private String exceptions;
    private Boolean isActive;
    private LocalDateTime testWindowCreatedDatetime;

    // Default constructor
    public TestWindowResponse() {}

    // Constructor from Entity
    public TestWindowResponse(TestWindow testWindow) {
        this.testWindowId = testWindow.getTestWindowId();
        this.testWindowTitle = testWindow.getTestWindowTitle();
        this.description = testWindow.getDescription();
        this.courseId = testWindow.getCourseId();
        this.testWindowStartDate = testWindow.getTestWindowStartDate();
        this.testWindowEndDate = testWindow.getTestWindowEndDate();
        this.testStartTime = testWindow.getTestStartTime();
        this.testEndTime = testWindow.getTestEndTime();
        this.weekdays = testWindow.getWeekdays();
        this.exceptions = testWindow.getExceptions();
        this.isActive = testWindow.getIsActive();
        this.testWindowCreatedDatetime = testWindow.getTestWindowCreatedDatetime();
    }

    // Constructor for manual creation
    public TestWindowResponse(Long testWindowId, String testWindowTitle, String description,
                             Long courseId, LocalDate testWindowStartDate, LocalDate testWindowEndDate,
                             LocalTime testStartTime, LocalTime testEndTime, String weekdays,
                             String exceptions, Boolean isActive, LocalDateTime testWindowCreatedDatetime) {
        this.testWindowId = testWindowId;
        this.testWindowTitle = testWindowTitle;
        this.description = description;
        this.courseId = courseId;
        this.testWindowStartDate = testWindowStartDate;
        this.testWindowEndDate = testWindowEndDate;
        this.testStartTime = testStartTime;
        this.testEndTime = testEndTime;
        this.weekdays = weekdays;
        this.exceptions = exceptions;
        this.isActive = isActive;
        this.testWindowCreatedDatetime = testWindowCreatedDatetime;
    }

    // Getters only (response is read-only)
    public Long getTestWindowId() { return testWindowId; }
    public String getTestWindowTitle() { return testWindowTitle; }
    public String getDescription() { return description; }
    public Long getCourseId() { return courseId; }
    public LocalDate getTestWindowStartDate() { return testWindowStartDate; }
    public LocalDate getTestWindowEndDate() { return testWindowEndDate; }
    public LocalTime getTestStartTime() { return testStartTime; }
    public LocalTime getTestEndTime() { return testEndTime; }
    public String getWeekdays() { return weekdays; }
    public String getExceptions() { return exceptions; }
    public Boolean getIsActive() { return isActive; }
    public LocalDateTime getTestWindowCreatedDatetime() { return testWindowCreatedDatetime; }
}

