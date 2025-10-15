// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/models/TestWindowExamRestriction.java
// This is the JPA model for the TestWindowExamRestriction entity.
// It represents the many-to-many relationship between test windows and exams with restriction status.
package org.mentats.mentat.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_window_exam_restrictions")
public class TestWindowExamRestriction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restriction_id")
    @JsonProperty("restrictionId")
    private Long restrictionId;
    
    @Column(name = "test_window_id", nullable = false)
    @JsonProperty("testWindowId")
    private Long testWindowId;
    
    @Column(name = "exam_id", nullable = false)
    @JsonProperty("examId")
    private Long examId;
    
    @Column(name = "is_allowed", nullable = false)
    @JsonProperty("isAllowed")
    private Boolean isAllowed;
    
    @Column(name = "created_at")
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
    
    // Constructors
    public TestWindowExamRestriction() {
        this.isAllowed = true; // Default to allowed
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public TestWindowExamRestriction(Long testWindowId, Long examId, Boolean isAllowed) {
        this.testWindowId = testWindowId;
        this.examId = examId;
        this.isAllowed = isAllowed;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getRestrictionId() {
        return restrictionId;
    }
    
    public void setRestrictionId(Long restrictionId) {
        this.restrictionId = restrictionId;
    }
    
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
    
    public Boolean getIsAllowed() {
        return isAllowed;
    }
    
    public void setIsAllowed(Boolean isAllowed) {
        this.isAllowed = isAllowed;
        this.updatedAt = LocalDateTime.now();
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
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "TestWindowExamRestriction{" +
                "restrictionId=" + restrictionId +
                ", testWindowId=" + testWindowId +
                ", examId=" + examId +
                ", isAllowed=" + isAllowed +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
