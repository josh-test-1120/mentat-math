// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/repositories/TestWindowExamRestrictionRepository.java
// This is the repository interface for the TestWindowExamRestriction entity.
// It provides data access methods for test window exam restrictions.
package org.mentats.mentat.repositories;

import org.mentats.mentat.models.TestWindowExamRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestWindowExamRestrictionRepository extends JpaRepository<TestWindowExamRestriction, Long> {
    
    /**
     * Find all restrictions for a specific test window
     * @param testWindowId the test window ID
     * @return list of restrictions
     */
    List<TestWindowExamRestriction> findByTestWindowId(Long testWindowId);
    
    /**
     * Find all restrictions for a specific exam
     * @param examId the exam ID
     * @return list of restrictions
     */
    List<TestWindowExamRestriction> findByExamId(Long examId);
    
    /**
     * Find a specific restriction by test window and exam IDs
     * @param testWindowId the test window ID
     * @param examId the exam ID
     * @return optional restriction
     */
    Optional<TestWindowExamRestriction> findByTestWindowIdAndExamId(Long testWindowId, Long examId);
    
    /**
     * Find all allowed exams for a test window
     * @param testWindowId the test window ID
     * @return list of allowed restrictions
     */
    List<TestWindowExamRestriction> findByTestWindowIdAndIsAllowedTrue(Long testWindowId);
    
    /**
     * Find all restricted exams for a test window
     * @param testWindowId the test window ID
     * @return list of restricted restrictions
     */
    List<TestWindowExamRestriction> findByTestWindowIdAndIsAllowedFalse(Long testWindowId);
    
    /**
     * Check if a specific exam is allowed in a test window
     * @param testWindowId the test window ID
     * @param examId the exam ID
     * @return true if allowed, false if restricted, null if not found
     */
    @Query("SELECT twer.isAllowed FROM TestWindowExamRestriction twer WHERE twer.testWindowId = :testWindowId AND twer.examId = :examId")
    Boolean isExamAllowedInTestWindow(@Param("testWindowId") Long testWindowId, @Param("examId") Long examId);
    
    /**
     * Delete all restrictions for a specific test window
     * @param testWindowId the test window ID
     */
    void deleteByTestWindowId(Long testWindowId);
    
    /**
     * Delete all restrictions for a specific exam
     * @param examId the exam ID
     */
    void deleteByExamId(Long examId);
    
    /**
     * Delete a specific restriction by test window and exam IDs
     * @param testWindowId the test window ID
     * @param examId the exam ID
     */
    void deleteByTestWindowIdAndExamId(Long testWindowId, Long examId);
    
    /**
     * Count restrictions for a test window
     * @param testWindowId the test window ID
     * @return count of restrictions
     */
    long countByTestWindowId(Long testWindowId);
    
    /**
     * Count allowed exams for a test window
     * @param testWindowId the test window ID
     * @return count of allowed exams
     */
    long countByTestWindowIdAndIsAllowedTrue(Long testWindowId);
    
    /**
     * Count restricted exams for a test window
     * @param testWindowId the test window ID
     * @return count of restricted exams
     */
    long countByTestWindowIdAndIsAllowedFalse(Long testWindowId);
}
