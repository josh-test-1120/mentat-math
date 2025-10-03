package org.mentats.mentat.repositories;

import org.mentats.mentat.models.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Exam Repository Interface that interacts with the Database through JPA.
 * @author Joshua Summers
 */
@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    // Find exams by course ID
    List<Exam> findByCourseId(Long courseId);
    // Find exams by state (active/inactive)
    List<Exam> findByState(Integer state);
    // Find exams by required status
    List<Exam> findByRequired(Integer required);
    // Find exams by online status
    List<Exam> findByOnline(Integer online);
    // Find exams by course ID and state
    List<Exam> findByCourseIdAndState(Long courseId, Integer state);
    // Delete exams by course ID
    void deleteByCourseId(Long courseId);
}
