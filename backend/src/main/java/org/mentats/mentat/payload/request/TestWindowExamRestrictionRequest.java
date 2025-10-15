// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/payload/request/TestWindowExamRestrictionRequest.java
// This is the request DTO for test window exam restriction operations.
package org.mentats.mentat.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class TestWindowExamRestrictionRequest {
    
    @NotNull
    @JsonProperty("testWindowId")
    private Long testWindowId;
    
    @NotNull
    @JsonProperty("examIds")
    private List<Long> examIds;
    
    @JsonProperty("isAllowed")
    private Boolean isAllowed = true; // Default to allowed
    
    // Constructors
    public TestWindowExamRestrictionRequest() {}
    
    public TestWindowExamRestrictionRequest(Long testWindowId, List<Long> examIds, Boolean isAllowed) {
        this.testWindowId = testWindowId;
        this.examIds = examIds;
        this.isAllowed = isAllowed;
    }
    
    // Getters and Setters
    public Long getTestWindowId() {
        return testWindowId;
    }
    
    public void setTestWindowId(Long testWindowId) {
        this.testWindowId = testWindowId;
    }
    
    public List<Long> getExamIds() {
        return examIds;
    }
    
    public void setExamIds(List<Long> examIds) {
        this.examIds = examIds;
    }
    
    public Boolean getIsAllowed() {
        return isAllowed;
    }
    
    public void setIsAllowed(Boolean isAllowed) {
        this.isAllowed = isAllowed;
    }
    
    @Override
    public String toString() {
        return "TestWindowExamRestrictionRequest{" +
                "testWindowId=" + testWindowId +
                ", examIds=" + examIds +
                ", isAllowed=" + isAllowed +
                '}';
    }
}
