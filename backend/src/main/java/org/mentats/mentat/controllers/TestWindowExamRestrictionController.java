// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/controllers/TestWindowExamRestrictionController.java
// This is the controller class for the TestWindowExamRestriction entity.
// It handles HTTP requests for managing test window exam restrictions.
package org.mentats.mentat.controllers;

import org.mentats.mentat.services.TestWindowExamRestrictionService;
import org.mentats.mentat.payload.request.TestWindowExamRestrictionRequest;
import org.mentats.mentat.payload.response.TestWindowExamRestrictionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-window-exam-restrictions")
public class TestWindowExamRestrictionController {
    
    @Autowired
    private TestWindowExamRestrictionService restrictionService;
    
    private static final Logger logger = LoggerFactory.getLogger(TestWindowExamRestrictionController.class);
    
    /**
     * Set exam restrictions for a test window
     * @param request the restriction request
     * @return response with created/updated restrictions
     */
    @PostMapping("/set")
    public ResponseEntity<?> setExamRestrictions(@RequestBody TestWindowExamRestrictionRequest request) {
        try {
            logger.info("Setting exam restrictions for test window: {}", request.getTestWindowId());
            List<TestWindowExamRestrictionResponse> restrictions = restrictionService.setExamRestrictions(request);
            return ResponseEntity.ok(Map.of(
                "message", "Exam restrictions set successfully",
                "restrictions", restrictions,
                "count", restrictions.size()
            ));
        } catch (Exception e) {
            logger.error("Error setting exam restrictions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to set exam restrictions: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get all exam restrictions for a test window
     * @param testWindowId the test window ID
     * @return list of restrictions
     */
    @GetMapping("/test-window/{testWindowId}")
    public ResponseEntity<?> getExamRestrictions(@PathVariable Long testWindowId) {
        try {
            logger.info("Getting exam restrictions for test window: {}", testWindowId);
            List<TestWindowExamRestrictionResponse> restrictions = restrictionService.getExamRestrictions(testWindowId);
            return ResponseEntity.ok(Map.of(
                "restrictions", restrictions,
                "count", restrictions.size()
            ));
        } catch (Exception e) {
            logger.error("Error getting exam restrictions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get exam restrictions: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get allowed exams for a test window
     * @param testWindowId the test window ID
     * @return list of allowed exam restrictions
     */
    @GetMapping("/test-window/{testWindowId}/allowed")
    public ResponseEntity<?> getAllowedExams(@PathVariable Long testWindowId) {
        try {
            logger.info("Getting allowed exams for test window: {}", testWindowId);
            List<TestWindowExamRestrictionResponse> allowedExams = restrictionService.getAllowedExams(testWindowId);
            return ResponseEntity.ok(Map.of(
                "allowedExams", allowedExams,
                "count", allowedExams.size()
            ));
        } catch (Exception e) {
            logger.error("Error getting allowed exams: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get allowed exams: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get restricted exams for a test window
     * @param testWindowId the test window ID
     * @return list of restricted exam restrictions
     */
    @GetMapping("/test-window/{testWindowId}/restricted")
    public ResponseEntity<?> getRestrictedExams(@PathVariable Long testWindowId) {
        try {
            logger.info("Getting restricted exams for test window: {}", testWindowId);
            List<TestWindowExamRestrictionResponse> restrictedExams = restrictionService.getRestrictedExams(testWindowId);
            return ResponseEntity.ok(Map.of(
                "restrictedExams", restrictedExams,
                "count", restrictedExams.size()
            ));
        } catch (Exception e) {
            logger.error("Error getting restricted exams: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get restricted exams: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Check if an exam is allowed in a test window
     * @param testWindowId the test window ID
     * @param examId the exam ID
     * @return true if allowed, false if restricted, null if not found
     */
    @GetMapping("/test-window/{testWindowId}/exam/{examId}/status")
    public ResponseEntity<?> isExamAllowed(@PathVariable Long testWindowId, @PathVariable Long examId) {
        try {
            logger.info("Checking if exam {} is allowed in test window {}", examId, testWindowId);
            Boolean isAllowed = restrictionService.isExamAllowed(testWindowId, examId);
            return ResponseEntity.ok(Map.of(
                "testWindowId", testWindowId,
                "examId", examId,
                "isAllowed", isAllowed
            ));
        } catch (Exception e) {
            logger.error("Error checking exam status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to check exam status: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Add a single exam restriction
     * @param testWindowId the test window ID
     * @param examId the exam ID
     * @param isAllowed whether the exam is allowed
     * @return the created/updated restriction
     */
    @PostMapping("/test-window/{testWindowId}/exam/{examId}")
    public ResponseEntity<?> addExamRestriction(
            @PathVariable Long testWindowId,
            @PathVariable Long examId,
            @RequestParam(defaultValue = "true") Boolean isAllowed) {
        try {
            logger.info("Adding exam restriction: testWindowId={}, examId={}, isAllowed={}", 
                       testWindowId, examId, isAllowed);
            TestWindowExamRestrictionResponse restriction = restrictionService.addExamRestriction(
                testWindowId, examId, isAllowed);
            return ResponseEntity.ok(Map.of(
                "message", "Exam restriction added successfully",
                "restriction", restriction
            ));
        } catch (Exception e) {
            logger.error("Error adding exam restriction: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to add exam restriction: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Remove an exam restriction
     * @param testWindowId the test window ID
     * @param examId the exam ID
     * @return success message
     */
    @DeleteMapping("/test-window/{testWindowId}/exam/{examId}")
    public ResponseEntity<?> removeExamRestriction(@PathVariable Long testWindowId, @PathVariable Long examId) {
        try {
            logger.info("Removing exam restriction: testWindowId={}, examId={}", testWindowId, examId);
            boolean removed = restrictionService.removeExamRestriction(testWindowId, examId);
            if (removed) {
                return ResponseEntity.ok(Map.of(
                    "message", "Exam restriction removed successfully"
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error removing exam restriction: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to remove exam restriction: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Remove all exam restrictions for a test window
     * @param testWindowId the test window ID
     * @return success message
     */
    @DeleteMapping("/test-window/{testWindowId}")
    public ResponseEntity<?> removeAllExamRestrictions(@PathVariable Long testWindowId) {
        try {
            logger.info("Removing all exam restrictions for test window: {}", testWindowId);
            restrictionService.removeAllExamRestrictions(testWindowId);
            return ResponseEntity.ok(Map.of(
                "message", "All exam restrictions removed successfully"
            ));
        } catch (Exception e) {
            logger.error("Error removing all exam restrictions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to remove all exam restrictions: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get allowed exam IDs for a test window
     * @param testWindowId the test window ID
     * @return list of allowed exam IDs
     */
    @GetMapping("/test-window/{testWindowId}/allowed-ids")
    public ResponseEntity<?> getAllowedExamIds(@PathVariable Long testWindowId) {
        try {
            logger.info("Getting allowed exam IDs for test window: {}", testWindowId);
            List<Long> allowedIds = restrictionService.getAllowedExamIds(testWindowId);
            return ResponseEntity.ok(Map.of(
                "allowedExamIds", allowedIds,
                "count", allowedIds.size()
            ));
        } catch (Exception e) {
            logger.error("Error getting allowed exam IDs: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get allowed exam IDs: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get statistics for a test window
     * @param testWindowId the test window ID
     * @return statistics
     */
    @GetMapping("/test-window/{testWindowId}/stats")
    public ResponseEntity<?> getTestWindowStats(@PathVariable Long testWindowId) {
        try {
            logger.info("Getting statistics for test window: {}", testWindowId);
            Map<String, Object> stats = restrictionService.getTestWindowStats(testWindowId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting test window stats: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get test window stats: " + e.getMessage()
            ));
        }
    }
}
