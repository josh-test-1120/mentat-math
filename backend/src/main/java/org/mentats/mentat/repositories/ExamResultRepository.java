package org.mentats.mentat.repositories;

import org.mentats.mentat.models.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Exam Result Repository Interface that interacts with the Database through JPA.
 * @author Joshua Summers
 */

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Integer> {
    // Interfaces for service repository
    List<ExamResult> findByStudentId(Integer studentId);
    List<ExamResult> findByExamId(Integer examId);
    List<ExamResult> findByExamIdAndExamVersion(Integer examId, Integer examVersion);
    void deleteByStudentId(Integer studentId);
    void deleteByExamId(Integer examId); // Add this method
}
