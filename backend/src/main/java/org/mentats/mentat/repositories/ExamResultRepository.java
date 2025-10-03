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
    // Find ExamResults based on student Id
    List<ExamResult> findByStudentId(Integer studentId);
    // Find ExamResults based on Exam Id
    List<ExamResult> findByExamId(Integer examId);
    // Find the ExamResults based on Exam Id and Exam version
    List<ExamResult> findByExamIdAndExamVersion(Integer examId, Integer examVersion);
    // Delete the ExamResults based on Student Id
    void deleteByStudentId(Integer studentId);
    // Delete the ExamResults based on Exam Id
    void deleteByExamId(Integer examId); // Add this method
}
