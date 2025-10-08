// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/services/TestWindowExamRestrictionService.java
// This is the service class for the TestWindowExamRestriction entity.
// It contains the business logic for managing test window exam restrictions.
package org.mentats.mentat.services;

import org.mentats.mentat.models.TestWindowExamRestriction;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.repositories.TestWindowExamRestrictionRepository;
import org.mentats.mentat.repositories.ExamRepository;
import org.mentats.mentat.payload.request.TestWindowExamRestrictionRequest;
import org.mentats.mentat.payload.response.TestWindowExamRestrictionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class TestWindowExamRestrictionService {
    
    @Autowired
    private TestWindowExamRestrictionRepository restrictionRepository;
    
    @Autowired
    private ExamRepository examRepository;
    
    /**
     * Set exam restrictions for a test window
     * @param request the restriction request
     * @return list of created/updated restrictions
     */
    @Transactional
    public List<TestWindowExamRestrictionResponse> setExamRestrictions(TestWindowExamRestrictionRequest request) {
        List<TestWindowExamRestrictionResponse> responses = new ArrayList<>();
        
        // First, remove all existing restrictions for this test window
        restrictionRepository.deleteByTestWindowId(request.getTestWindowId());
        
        // Create new restrictions for the provided exam IDs
        for (Long examId : request.getExamIds()) {
            // Verify exam exists
            Optional<Exam> examOpt = examRepository.findById(examId);
            if (examOpt.isPresent()) {
                TestWindowExamRestriction restriction = new TestWindowExamRestriction(
                    request.getTestWindowId(),
                    examId,
                    request.getIsAllowed()
                );
                
                TestWindowExamRestriction saved = restrictionRepository.save(restriction);
                Exam exam = examOpt.get();
                
                responses.add(new TestWindowExamRestrictionResponse(
                    saved.getTestWindowId(),
                    saved.getExamId(),
                    exam.getName(),
                    saved.getIsAllowed(),
                    saved.getCreatedAt(),
                    saved.getUpdatedAt()
                ));
            }
        }
        
        return responses;
    }
    
    /**
     * Get all exam restrictions for a test window
     * @param testWindowId the test window ID
     * @return list of restrictions
     */
    public List<TestWindowExamRestrictionResponse> getExamRestrictions(Long testWindowId) {
        List<TestWindowExamRestriction> restrictions = restrictionRepository.findByTestWindowId(testWindowId);
        
        return restrictions.stream().map(restriction -> {
            Optional<Exam> examOpt = examRepository.findById(restriction.getExamId());
            String examName = examOpt.map(Exam::getName).orElse("Unknown Exam");
            
            return new TestWindowExamRestrictionResponse(
                restriction.getTestWindowId(),
                restriction.getExamId(),
                examName,
                restriction.getIsAllowed(),
                restriction.getCreatedAt(),
                restriction.getUpdatedAt()
            );
        }).collect(Collectors.toList());
    }
    
    /**
     * Get allowed exams for a test window
     * @param testWindowId the test window ID
     * @return list of allowed exam restrictions
     */
    public List<TestWindowExamRestrictionResponse> getAllowedExams(Long testWindowId) {
        List<TestWindowExamRestriction> restrictions = restrictionRepository.findByTestWindowIdAndIsAllowedTrue(testWindowId);
        
        return restrictions.stream().map(restriction -> {
            Optional<Exam> examOpt = examRepository.findById(restriction.getExamId());
            String examName = examOpt.map(Exam::getName).orElse("Unknown Exam");
            
            return new TestWindowExamRestrictionResponse(
                restriction.getTestWindowId(),
                restriction.getExamId(),
                examName,
                restriction.getIsAllowed(),
                restriction.getCreatedAt(),
                restriction.getUpdatedAt()
            );
        }).collect(Collectors.toList());
    }
    
    /**
     * Get restricted exams for a test window
     * @param testWindowId the test window ID
     * @return list of restricted exam restrictions
     */
    public List<TestWindowExamRestrictionResponse> getRestrictedExams(Long testWindowId) {
        List<TestWindowExamRestriction> restrictions = restrictionRepository.findByTestWindowIdAndIsAllowedFalse(testWindowId);
        
        return restrictions.stream().map(restriction -> {
            Optional<Exam> examOpt = examRepository.findById(restriction.getExamId());
            String examName = examOpt.map(Exam::getName).orElse("Unknown Exam");
            
            return new TestWindowExamRestrictionResponse(
                restriction.getTestWindowId(),
                restriction.getExamId(),
                examName,
                restriction.getIsAllowed(),
                restriction.getCreatedAt(),
                restriction.getUpdatedAt()
            );
        }).collect(Collectors.toList());
    }
    
    /**
     * Check if an exam is allowed in a test window
     * @param testWindowId the test window ID
     * @param examId the exam ID
     * @return true if allowed, false if restricted, null if not found
     */
    public Boolean isExamAllowed(Long testWindowId, Long examId) {
        return restrictionRepository.isExamAllowedInTestWindow(testWindowId, examId);
    }
    
    /**
     * Add a single exam restriction
     * @param testWindowId the test window ID
     * @param examId the exam ID
     * @param isAllowed whether the exam is allowed
     * @return the created/updated restriction
     */
    @Transactional
    public TestWindowExamRestrictionResponse addExamRestriction(Long testWindowId, Long examId, Boolean isAllowed) {
        // Check if restriction already exists
        Optional<TestWindowExamRestriction> existing = restrictionRepository.findByTestWindowIdAndExamId(testWindowId, examId);
        
        TestWindowExamRestriction restriction;
        if (existing.isPresent()) {
            // Update existing restriction
            restriction = existing.get();
            restriction.setIsAllowed(isAllowed);
        } else {
            // Create new restriction
            restriction = new TestWindowExamRestriction(testWindowId, examId, isAllowed);
        }
        
        TestWindowExamRestriction saved = restrictionRepository.save(restriction);
        Optional<Exam> examOpt = examRepository.findById(examId);
        String examName = examOpt.map(Exam::getName).orElse("Unknown Exam");
        
        return new TestWindowExamRestrictionResponse(
            saved.getTestWindowId(),
            saved.getExamId(),
            examName,
            saved.getIsAllowed(),
            saved.getCreatedAt(),
            saved.getUpdatedAt()
        );
    }
    
    /**
     * Remove an exam restriction
     * @param testWindowId the test window ID
     * @param examId the exam ID
     * @return true if removed, false if not found
     */
    @Transactional
    public boolean removeExamRestriction(Long testWindowId, Long examId) {
        Optional<TestWindowExamRestriction> existing = restrictionRepository.findByTestWindowIdAndExamId(testWindowId, examId);
        if (existing.isPresent()) {
            restrictionRepository.deleteByTestWindowIdAndExamId(testWindowId, examId);
            return true;
        }
        return false;
    }
    
    /**
     * Remove all exam restrictions for a test window
     * @param testWindowId the test window ID
     */
    @Transactional
    public void removeAllExamRestrictions(Long testWindowId) {
        restrictionRepository.deleteByTestWindowId(testWindowId);
    }
    
    /**
     * Get exam IDs that are allowed in a test window
     * @param testWindowId the test window ID
     * @return list of allowed exam IDs
     */
    public List<Long> getAllowedExamIds(Long testWindowId) {
        return restrictionRepository.findByTestWindowIdAndIsAllowedTrue(testWindowId)
                .stream()
                .map(TestWindowExamRestriction::getExamId)
                .collect(Collectors.toList());
    }
    
    /**
     * Get exam IDs that are restricted in a test window
     * @param testWindowId the test window ID
     * @return list of restricted exam IDs
     */
    public List<Long> getRestrictedExamIds(Long testWindowId) {
        return restrictionRepository.findByTestWindowIdAndIsAllowedFalse(testWindowId)
                .stream()
                .map(TestWindowExamRestriction::getExamId)
                .collect(Collectors.toList());
    }
    
    /**
     * Get statistics for a test window
     * @param testWindowId the test window ID
     * @return statistics map
     */
    public java.util.Map<String, Object> getTestWindowStats(Long testWindowId) {
        long totalRestrictions = restrictionRepository.countByTestWindowId(testWindowId);
        long allowedExams = restrictionRepository.countByTestWindowIdAndIsAllowedTrue(testWindowId);
        long restrictedExams = restrictionRepository.countByTestWindowIdAndIsAllowedFalse(testWindowId);
        
        return java.util.Map.of(
            "totalRestrictions", totalRestrictions,
            "allowedExams", allowedExams,
            "restrictedExams", restrictedExams
        );
    }
}
