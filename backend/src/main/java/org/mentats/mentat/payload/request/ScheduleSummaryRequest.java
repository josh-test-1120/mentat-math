package org.mentats.mentat.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.sql.Date;

/**
 * Request DTO for schedule summary
 * Contains optional filter parameters for retrieving scheduled exam summaries
 * @author Telmen Enkhtuvshin
 */
public class ScheduleSummaryRequest {
    
    @JsonProperty("courseId")
    private Long courseId;
    
    @JsonProperty("startDate")
    private Date startDate;
    
    @JsonProperty("endDate")
    private Date endDate;
    
    @JsonProperty("examId")
    private Long examId;
    
    // Default constructor
    public ScheduleSummaryRequest() {}

    // Constructors
    public ScheduleSummaryRequest(Long courseId, Date startDate, Date endDate, Long examId) {
        this.courseId = courseId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.examId = examId;
    }

    // Getters and Setters
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    /**
     * String override for output response
     * @return String representation of the request
     */
    @Override
    public String toString() {
        return "ScheduleSummaryRequest{" +
                "courseId=" + courseId +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", examId=" + examId +
                '}';
    }
}

