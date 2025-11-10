// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/controllers/TestWindowController.java
// This is the controller class for the TestWindow entity.
// It is used to handle the HTTP requests for the TestWindow entity.
package org.mentats.mentat.controllers;

import org.mentats.mentat.models.TestWindow;
import org.mentats.mentat.services.TestWindowService;
import org.mentats.mentat.payload.request.TestWindowRequest;
import org.mentats.mentat.payload.response.TestWindowResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/test-window")
public class TestWindowController {
    
    @Autowired
    private TestWindowService testWindowService;
    private static final Logger logger = LoggerFactory.getLogger(TestWindowController.class);
    
    @PostMapping("/create")
    public ResponseEntity<?> createTestWindow(@RequestBody TestWindowRequest request) {
        try {
            logger.info("Creating test window: {}", request.getWindowName());
            TestWindow testWindow = testWindowService.createTestWindow(request);
            TestWindowResponse response = new TestWindowResponse(testWindow);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating test window: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Error creating test window: " + e.getMessage()));
        }
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getTestWindowsByCourse(@PathVariable Integer courseId) {
        try {
            logger.info("Fetching test windows for course: {}", courseId);
            List<TestWindowResponse> testWindows = testWindowService.getTestWindowsByCourseId(courseId)
                    .stream()
                    .map(TestWindowResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(testWindows);
        } catch (Exception e) {
            logger.error("Error fetching test windows: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching test windows: " + e.getMessage()));
        }
    }
    
    @GetMapping("/professor/{professorId}")
    public ResponseEntity<?> getTestWindowsByProfessor(@PathVariable String professorId) {
        try {
            logger.info("Fetching test windows for professor: {}", professorId);
            List<TestWindowResponse> testWindows = testWindowService.getTestWindowsByProfessorId(professorId)
                    .stream()
                    .map(TestWindowResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(testWindows);
        } catch (Exception e) {
            logger.error("Error fetching test windows: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching test windows: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTestWindowById(@PathVariable Integer id) {
        try {
            logger.info("Fetching test window by id: {}", id);
            return testWindowService.getTestWindowById(id)
                .map(TestWindowResponse::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error fetching test window: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching test window: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestWindow(@PathVariable Integer id, @RequestBody TestWindowRequest request) {
        try {
            logger.info("Updating test window: {}", id);
            TestWindow testWindow = testWindowService.updateTestWindow(id, request);
            if (testWindow != null) {
                TestWindowResponse response = new TestWindowResponse(testWindow);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error updating test window: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Error updating test window: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestWindow(@PathVariable Integer id) {
        try {
            logger.info("Deleting test window: {}", id);
            boolean deleted = testWindowService.deleteTestWindow(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Test window deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting test window: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Error deleting test window: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/disable-weekday")
    public ResponseEntity<?> disableWeekday(@PathVariable Integer id, @RequestParam String weekday) {
        try {
            logger.info("Disabling weekday {} for test window: {}", weekday, id);
            String result = testWindowService.disableWeekday(id, weekday);
            if (result.equals("deleted")) {
                return ResponseEntity.ok(Map.of("message", "Test window deleted (no active weekdays remaining)"));
            } else if (result.equals("updated")) {
                return ResponseEntity.ok(Map.of("message", "Weekday disabled successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error disabling weekday: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Error disabling weekday: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/add-exception")
    public ResponseEntity<?> addException(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        try {
            String date = request.get("date");
            if (date == null || date.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Date parameter is required"));
            }
            
            logger.info("Adding exception date {} for test window: {}", date, id);
            TestWindow updated = testWindowService.addExceptionDate(id, date);
            if (updated != null) {
                TestWindowResponse response = new TestWindowResponse(updated);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error adding exception date: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Error adding exception date: " + e.getMessage()));
        }
    }

    /**
     * Update the end date of a test window
     * It is used for deleting the test window from the input date till the end.
     * 
     * @param id the id of the test window
     * @param request the request body
     * @return the response entity
     */
    @PatchMapping("/{id}/update-end-date")
    public ResponseEntity<?> updateEndDate(
        @PathVariable Integer id,
        @RequestBody Map<String, String> request
    ) {
        try {
            // Get the end date from the request body
            String endDate = request.get("endDate");
            logger.info("Received endDate string: {}", endDate);

            // Parse the date explicitly with ISO format to avoid timezone issues
            LocalDate parsedDate = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE);
            logger.info("Parsed date: {}", parsedDate);
            
            // Update the end date using the service method
            testWindowService.updateTestWindowEndDate(id, parsedDate);
            
            logger.info("Successfully updated end date for test window: {}", id);
            return ResponseEntity.ok().body(Map.of("message", "End date updated successfully"));
        } catch (Exception e) {
            logger.error("Error updating end date: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}