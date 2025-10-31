package org.mentats.mentat.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.sql.Date;
import java.util.List;

/**
 * Response DTO for scheduled exam summary
 * Contains exam statistics grouped by scheduled date
 * @author Telmen Enkhtuvshin
 */
public class ScheduleSummaryResponse {
    @JsonProperty("examName")
    private String examName;
    
    @JsonProperty("examId")
    private Long examId;
    
    @JsonProperty("scheduledDate")
    private String scheduledDate;
    
    @JsonProperty("totalScheduled")
    private Integer totalScheduled;
    
    @JsonProperty("students")
    private List<StudentSchedulingInfo> students;

    // Constructor
    public ScheduleSummaryResponse() {}

    public ScheduleSummaryResponse(String examName, Long examId, 
                                         String scheduledDate, Integer totalScheduled,
                                         List<StudentSchedulingInfo> students) {
        this.examName = examName;
        this.examId = examId;
        this.scheduledDate = scheduledDate;
        this.totalScheduled = totalScheduled;
        this.students = students;
    }

    // Getters and Setters
    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(String scheduledDate) { this.scheduledDate = scheduledDate; }

    public Integer getTotalScheduled() { return totalScheduled; }
    public void setTotalScheduled(Integer totalScheduled) { this.totalScheduled = totalScheduled; }

    public List<StudentSchedulingInfo> getStudents() { return students; }
    public void setStudents(List<StudentSchedulingInfo> students) { this.students = students; }

    /**
     * Inner class for student scheduling information
     */
    public static class StudentSchedulingInfo {
        @JsonProperty("username")
        private String username;
        
        @JsonProperty("email")
        private String email;
        
        @JsonProperty("scheduledDate")
        private String scheduledDate;
        
        @JsonProperty("testWindowId")
        private Long testWindowId;

        // Constructor
        public StudentSchedulingInfo() {}

        public StudentSchedulingInfo(String username, String email, 
                                     String scheduledDate, Long testWindowId) {
            this.username = username;
            this.email = email;
            this.scheduledDate = scheduledDate;
            this.testWindowId = testWindowId;
        }

        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getScheduledDate() { return scheduledDate; }
        public void setScheduledDate(String scheduledDate) { this.scheduledDate = scheduledDate; }

        public Long getTestWindowId() { return testWindowId; }
        public void setTestWindowId(Long testWindowId) { this.testWindowId = testWindowId; }
    }
}

