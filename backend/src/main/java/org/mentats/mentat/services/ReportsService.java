package org.mentats.mentat.services;

import org.mentats.mentat.models.ExamResult;
import org.mentats.mentat.payload.request.ScheduleSummaryRequest;
import org.mentats.mentat.payload.response.ScheduleSummaryResponse;
import org.mentats.mentat.repositories.ExamResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating reports and summaries
 * Handles scheduled exam statistics and summaries
 * @author Telmen Enkhtuvshin
 */
@Service
public class ReportsService {
    
    @Autowired
    private ExamResultRepository examResultRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Get schedule summary grouped by exam and date
     * Returns statistics showing which students scheduled which exams on which dates
     * 
     * @param request ScheduleSummaryRequest containing optional filter parameters
     * @return List of ScheduleSummaryResponse grouped by exam and scheduled date
     */
    public List<ScheduleSummaryResponse> getScheduleSummary(ScheduleSummaryRequest request) {
        // Fetch all exam results that have scheduled dates
        List<ExamResult> allResults = examResultRepository.findAll();
        
        // Filter to only scheduled exams (has scheduled date)
        List<ExamResult> scheduledResults = allResults.stream()
                .filter(result -> result.getExamScheduledDate() != null)
                .filter(result -> {
                    // Apply courseId filter if provided
                    if (request != null && request.getCourseId() != null) {
                        return result.getExam() != null 
                                && result.getExam().getCourse() != null
                                && result.getExam().getCourse().getCourseId().equals(request.getCourseId());
                    }
                    return true;
                })
                .filter(result -> {
                    // Apply examId filter if provided
                    if (request != null && request.getExamId() != null) {
                        return result.getExam() != null 
                                && result.getExam().getId().equals(request.getExamId());
                    }
                    return true;
                })
                .filter(result -> {
                    // Apply date range filter if provided
                    if (request != null && result.getExamScheduledDate() != null) {
                        Date scheduledDate = result.getExamScheduledDate();
                        if (request.getStartDate() != null && scheduledDate.before(request.getStartDate())) {
                            return false;
                        }
                        if (request.getEndDate() != null && scheduledDate.after(request.getEndDate())) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (scheduledResults.isEmpty()) {
            return new ArrayList<>();
        }

        // Group by exam and scheduled date
        Map<String, List<ExamResult>> groupedResults = scheduledResults.stream()
                .collect(Collectors.groupingBy(result -> {
                    Long examId = result.getExam() != null ? result.getExam().getId() : 0L;
                    String examName = result.getExam() != null ? result.getExam().getName() : "Unknown";
                    String scheduledDate = result.getExamScheduledDate() != null 
                            ? result.getExamScheduledDate().toString() 
                            : "No Date";
                    return examId + "|" + examName + "|" + scheduledDate;
                }));

        // Build response list
        List<ScheduleSummaryResponse> responseList = new ArrayList<>();

        for (Map.Entry<String, List<ExamResult>> entry : groupedResults.entrySet()) {
            String[] keyParts = entry.getKey().split("\\|");
            Long examId = Long.parseLong(keyParts[0]);
            String examName = keyParts[1];
            String scheduledDate = keyParts[2];
            
            List<ExamResult> results = entry.getValue();
            
            // Build student list
            List<ScheduleSummaryResponse.StudentSchedulingInfo> students = results.stream()
                    .map(result -> {
                        String username = result.getStudent() != null 
                                ? result.getStudent().getUsername() 
                                : "Unknown";
                        String email = result.getStudent() != null 
                                ? result.getStudent().getEmail() 
                                : "Unknown";
                        String resultScheduledDate = result.getExamScheduledDate() != null 
                                ? result.getExamScheduledDate().toString() 
                                : "No Date";
                        
                        // Note: testWindowId is not directly available in ExamResult
                        // You may need to add this relationship or set to null if not available
                        Long testWindowId = null; // TODO: Add test window relationship if needed
                        
                        return new ScheduleSummaryResponse.StudentSchedulingInfo(
                                username, email, resultScheduledDate, testWindowId
                        );
                    })
                    .collect(Collectors.toList());

            // Create response object
            ScheduleSummaryResponse response = new ScheduleSummaryResponse(
                    examName,
                    examId,
                    scheduledDate,
                    results.size(),
                    students
            );

            responseList.add(response);
        }

        return responseList;
    }
}

