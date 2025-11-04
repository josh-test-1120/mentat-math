package org.mentats.mentat.services;

import org.mentats.mentat.payload.request.ScheduleSummaryRequest;
import org.mentats.mentat.payload.response.ScheduleSummaryResponse;
import org.mentats.mentat.projections.ExamResultDetailsProjection;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for generating reports and summaries
 * Handles scheduled exam statistics and summaries
 * Uses existing ExamResultDetailsProjection for consistency
 * @author Telmen Enkhtuvshin
 */
@Service
public class ReportsService {
    
    @Autowired
    private ExamResultRepository examResultRepository;

    /**
     * Get schedule summary - returns flat list for frontend grouping
     * Uses existing ExamResultDetailsProjection extended with student info
     * All filtering is done at the database level for optimal performance
     * 
     * @param request ScheduleSummaryRequest containing optional filter parameters
     * @return List of ScheduleSummaryResponse (one per student scheduling)
     */
    public List<ScheduleSummaryResponse> getScheduleSummary(ScheduleSummaryRequest request) {
        // Extract filter parameters
        Long instructorId = (request != null) ? request.getInstructorId() : null;
        Long courseId = (request != null) ? request.getCourseId() : null;
        Long examId = (request != null) ? request.getExamId() : null;
        Date startDate = (request != null) ? request.getStartDate() : null;
        Date endDate = (request != null) ? request.getEndDate() : null;
        
        // Use extended version of existing query pattern
        List<ExamResultDetailsProjection> projections = examResultRepository.findScheduleSummaryDetails(
                instructorId, courseId, examId, startDate, endDate);
        
        if (projections == null || projections.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Convert projections to response DTOs (flat list, one per student)
        List<ScheduleSummaryResponse> responseList = new ArrayList<>();
        
        for (ExamResultDetailsProjection projection : projections) {
            String scheduledDate = projection.getExamScheduledDate() != null 
                    ? projection.getExamScheduledDate().toString() 
                    : "No Date";
            
            // Create a single student entry
            ScheduleSummaryResponse.StudentSchedulingInfo student = 
                    new ScheduleSummaryResponse.StudentSchedulingInfo(
                            projection.getStudentUsername() != null 
                                    ? projection.getStudentUsername() : "Unknown",
                            projection.getStudentEmail() != null 
                                    ? projection.getStudentEmail() : "Unknown",
                            scheduledDate,
                            null // testWindowId not available via direct relationship
                    );
            
            // Create response with single student (frontend will group these)
            ScheduleSummaryResponse response = new ScheduleSummaryResponse(
                    projection.getExamName() != null ? projection.getExamName() : "Unknown",
                    projection.getExamId(),
                    scheduledDate,
                    1, // Each entry represents 1 scheduling
                    List.of(student) // Single student in list
            );
            
            responseList.add(response);
        }
        
        return responseList;
    }
}

