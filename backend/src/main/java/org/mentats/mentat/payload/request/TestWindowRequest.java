// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/payload/request/TestWindowRequest.java
// This is the request class for the TestWindow entity.
// It is used to store the test window data.
package org.mentats.mentat.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TestWindowRequest {
    
    @JsonProperty("windowName")
    private String windowName;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("courseId")
    private Integer courseId;
    
    @JsonProperty("startDate")
    private String startDate;
    
    @JsonProperty("endDate")
    private String endDate;
    
    @JsonProperty("startTime")
    private String startTime;
    
    @JsonProperty("endTime")
    private String endTime;
    
    @JsonProperty("weekdays")
    private String weekdays;
    
    @JsonProperty("exceptions")
    private String exceptions;
    
    @JsonProperty("isActive")
    private Boolean isActive;
    
    // Constructors, getters, and setters
    public TestWindowRequest() {}
    
    // Getters and setters
    public String getWindowName() { return windowName; }
    public void setWindowName(String windowName) { this.windowName = windowName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }
    
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    
    public String getWeekdays() { return weekdays; }
    public void setWeekdays(String weekdays) { this.weekdays = weekdays; }
    
    public String getExceptions() { return exceptions; }
    public void setExceptions(String exceptions) { this.exceptions = exceptions; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}