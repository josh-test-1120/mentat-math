// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/services/TestWindowService.java
// This is the service class for the TestWindow entity. The business logic for the TestWindow entity is separated and implemented here.
package org.mentats.mentat.services;

import org.mentats.mentat.models.TestWindow;
import org.mentats.mentat.repositories.TestWindowRepository;
import org.mentats.mentat.payload.request.TestWindowRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class TestWindowService {
    
    @Autowired
    private TestWindowRepository testWindowRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    public TestWindow createTestWindow(TestWindowRequest request) {
        TestWindow testWindow = new TestWindow();
        
        testWindow.setTestWindowTitle(request.getWindowName());
        testWindow.setDescription(request.getDescription());
        testWindow.setCourseId(request.getCourseId());
        testWindow.setTestWindowStartDate(LocalDate.parse(request.getStartDate(), DATE_FORMATTER));
        testWindow.setTestWindowEndDate(LocalDate.parse(request.getEndDate(), DATE_FORMATTER));
        testWindow.setTestStartTime(LocalTime.parse(request.getStartTime(), TIME_FORMATTER));
        testWindow.setTestEndTime(LocalTime.parse(request.getEndTime(), TIME_FORMATTER));
        testWindow.setWeekdays(request.getWeekdays() != null ? request.getWeekdays() : "{}");
        testWindow.setExceptions(request.getExceptions());
        testWindow.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        return testWindowRepository.save(testWindow);
    }
    
    public List<TestWindow> getTestWindowsByCourseId(Integer courseId) {
        return testWindowRepository.findByCourseId(courseId);
    }
    
    public List<TestWindow> getActiveTestWindowsByCourseId(Integer courseId) {
        return testWindowRepository.findByCourseIdAndIsActiveTrue(courseId);
    }
    
    public List<TestWindow> getTestWindowsByProfessorId(String professorId) {
        return testWindowRepository.findByProfessorId(professorId);
    }
    
    public List<TestWindow> getActiveTestWindowsByProfessorId(String professorId) {
        return testWindowRepository.findActiveByProfessorId(professorId);
    }
    
    public Optional<TestWindow> getTestWindowById(Integer id) {
        return testWindowRepository.findById(id);
    }
    
    public TestWindow updateTestWindow(Integer id, TestWindowRequest request) {
        Optional<TestWindow> existingWindow = testWindowRepository.findById(id);
        if (existingWindow.isPresent()) {
            TestWindow testWindow = existingWindow.get();
            
            testWindow.setTestWindowTitle(request.getWindowName());
            testWindow.setDescription(request.getDescription());
            testWindow.setCourseId(request.getCourseId());
            testWindow.setTestWindowStartDate(LocalDate.parse(request.getStartDate(), DATE_FORMATTER));
            testWindow.setTestWindowEndDate(LocalDate.parse(request.getEndDate(), DATE_FORMATTER));
            testWindow.setTestStartTime(LocalTime.parse(request.getStartTime(), TIME_FORMATTER));
            testWindow.setTestEndTime(LocalTime.parse(request.getEndTime(), TIME_FORMATTER));
            testWindow.setWeekdays(request.getWeekdays() != null ? request.getWeekdays() : "{}");
            testWindow.setExceptions(request.getExceptions());
            testWindow.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            
            return testWindowRepository.save(testWindow);
        }
        return null;
    }
    
    public boolean deleteTestWindow(Integer id) {
        if (testWindowRepository.existsById(id)) {
            testWindowRepository.deleteById(id);
            return true;
        }
        return false;
    }
}