// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/controllers/TestWindowController.java
// This is the controller class for the TestWindow entity.
// It is used to handle the HTTP requests for the TestWindow entity.
package org.mentats.mentat.controllers;

import org.mentats.mentat.models.TestWindow;
import org.mentats.mentat.services.TestWindowService;
import org.mentats.mentat.payload.request.TestWindowRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

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
            System.out.println("TestWindowController.createTestWindow() called YOLO");
            System.out.println("Creating test window: " + request);
            System.out.println("Test window request: " + request);
            System.out.println("Test window request windowName: " + request.getWindowName());
            System.out.println("Test window request description: " + request.getDescription());
            System.out.println("Test window request courseId: " + request.getCourseId());
            System.out.println("Test window request startDate: " + request.getStartDate());
            System.out.println("Test window request endDate: " + request.getEndDate());
            System.out.println("Test window request startTime: " + request.getStartTime());
            System.out.println("Test window request endTime: " + request.getEndTime());
            System.out.println("Test window request weekdays: " + request.getWeekdays());
            System.out.println("Test window request exceptions: " + request.getExceptions());
            System.out.println("Test window request isActive: " + request.getIsActive());
                
            TestWindow testWindow = testWindowService.createTestWindow(request);
            return ResponseEntity.ok(testWindow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating test window: " + e.getMessage());
        }
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getTestWindowsByCourse(@PathVariable Integer courseId) {
        try {
            List<TestWindow> testWindows = testWindowService.getTestWindowsByCourseId(courseId);
            return ResponseEntity.ok(testWindows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching test windows: " + e.getMessage());
        }
    }
    
    @GetMapping("/professor/{professorId}")
    public ResponseEntity<?> getTestWindowsByProfessor(@PathVariable String professorId) {
        try {
            List<TestWindow> testWindows = testWindowService.getTestWindowsByProfessorId(professorId);
            return ResponseEntity.ok(testWindows);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching test windows: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTestWindowById(@PathVariable Integer id) {
        try {
            return testWindowService.getTestWindowById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching test window: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestWindow(@PathVariable Integer id, @RequestBody TestWindowRequest request) {
        try {
            TestWindow testWindow = testWindowService.updateTestWindow(id, request);
            if (testWindow != null) {
                return ResponseEntity.ok(testWindow);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating test window: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestWindow(@PathVariable Integer id) {
        try {
            boolean deleted = testWindowService.deleteTestWindow(id);
            if (deleted) {
                return ResponseEntity.ok("Test window deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting test window: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}/disable-weekday")
    public ResponseEntity<?> disableWeekday(@PathVariable Integer id, @RequestParam String weekday) {
        try {
            String result = testWindowService.disableWeekday(id, weekday);
            if (result.equals("deleted")) {
                return ResponseEntity.ok("Test window deleted (no active weekdays remaining)");
            } else if (result.equals("updated")) {
                return ResponseEntity.ok("Weekday disabled successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error disabling weekday: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/add-exception")
    public ResponseEntity<?> addException(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        try {
            String date = request.get("date");
            if (date == null || date.isEmpty()) {
                return ResponseEntity.badRequest().body("Date parameter is required");
            }
            
            TestWindow updated = testWindowService.addExceptionDate(id, date);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding exception date: " + e.getMessage());
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
            
            return ResponseEntity.ok().body(Map.of("message", "End date updated successfully"));
        } catch (Exception e) {
            System.err.println("Error updating end date: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}