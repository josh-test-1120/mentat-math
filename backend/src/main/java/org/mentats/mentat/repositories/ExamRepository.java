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
public interface ExamRepository extends JpaRepository<Exam, Integer> {
    // Find exams by course ID
    List<Exam> findByCourseId(Integer courseId);
    // Find exams by state (active/inactive)
    List<Exam> findByState(Boolean state);
    // Find exams by required status
    List<Exam> findByRequired(Boolean required);
    // Find exams by online status
    List<Exam> findByOnline(Boolean online);
    // Find exams by course ID and state
    List<Exam> findByCourseIdAndState(Integer courseId, Boolean state);
    // Delete exams by course ID
    void deleteByCourseId(Integer courseId);
}
