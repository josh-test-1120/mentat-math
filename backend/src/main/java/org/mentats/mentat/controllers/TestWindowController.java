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
import java.util.List;

@RestController
@RequestMapping("/api/test-window")
@CrossOrigin(origins = "*")
public class TestWindowController {
    
    @Autowired
    private TestWindowService testWindowService;
    
    @PostMapping("/create")
    public ResponseEntity<?> createTestWindow(@RequestBody TestWindowRequest request) {
        try {
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
}