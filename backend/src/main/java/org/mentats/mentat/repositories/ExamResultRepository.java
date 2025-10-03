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
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    // Find ExamResults based on student Id
    List<ExamResult> findByStudentId(Long studentId);
    // Find ExamResults based on Exam Id
    List<ExamResult> findByExamId(Long examId);
    // Find the ExamResults based on Exam Id and Exam version
    List<ExamResult> findByExamIdAndExamVersion(Long examId, Integer examVersion);
    // Delete the ExamResults based on Student Id
    void deleteByStudentId(Long studentId);
    // Delete the ExamResults based on Exam Id
    void deleteByExamId(Long examId); // Add this method
}
