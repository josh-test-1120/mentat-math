// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/payload/response/TestWindowExamRestrictionResponse.java
// This is the response DTO for test window exam restriction operations.
package org.mentats.mentat.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

public class TestWindowExamRestrictionResponse {
    
    @JsonProperty("testWindowId")
    private Long testWindowId;
    
    @JsonProperty("examId")
    private Long examId;
    
    @JsonProperty("examName")
    private String examName;
    
    @JsonProperty("isAllowed")
    private Boolean isAllowed;
    
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
    
    // Constructors
    public TestWindowExamRestrictionResponse() {}
    
    public TestWindowExamRestrictionResponse(Long testWindowId, Long examId, String examName, 
                                           Boolean isAllowed, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.testWindowId = testWindowId;
        this.examId = examId;
        this.examName = examName;
        this.isAllowed = isAllowed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getTestWindowId() {
        return testWindowId;
    }
    
    public void setTestWindowId(Long testWindowId) {
        this.testWindowId = testWindowId;
    }
    
    public Long getExamId() {
        return examId;
    }
    
    public void setExamId(Long examId) {
        this.examId = examId;
    }
    
    public String getExamName() {
        return examName;
    }
    
    public void setExamName(String examName) {
        this.examName = examName;
    }
    
    public Boolean getIsAllowed() {
        return isAllowed;
    }
    
    public void setIsAllowed(Boolean isAllowed) {
        this.isAllowed = isAllowed;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "TestWindowExamRestrictionResponse{" +
                "testWindowId=" + testWindowId +
                ", examId=" + examId +
                ", examName='" + examName + '\'' +
                ", isAllowed=" + isAllowed +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
