package org.mentats.mentat.controllers;

import org.mentats.mentat.payload.request.ScheduleSummaryRequest;
import org.mentats.mentat.payload.response.ScheduleSummaryResponse;
import org.mentats.mentat.services.ReportsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Reports REST API Controller
 * Methods for generating reports and summaries
 * base URI is /api/scheduled-exam
 * @author Telmen Enkhtuvshin
 */
@RestController
@RequestMapping("/api/scheduled-exam")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportsController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReportsController.class);
    
    @Autowired
    private ReportsService reportsService;

    /**
     * Get schedule summary
     * Returns statistics showing which students scheduled which exams on which dates
     * 
     * @param request ScheduleSummaryRequest containing optional filter parameters
     * @return ResponseEntity with list of ScheduleSummaryResponse
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getScheduleSummary(@ModelAttribute ScheduleSummaryRequest request) {
        try {
            logger.info("Fetching schedule summary with request: {}", request);
            
            List<ScheduleSummaryResponse> summary = reportsService.getScheduleSummary(request);
            
            if (summary == null || summary.isEmpty()) {
                logger.info("No scheduled exams found");
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            logger.info("Successfully fetched {} summary entries", summary.size());
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            logger.error("Error fetching schedule summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching summary: " + e.getMessage());
        }
    }
}

