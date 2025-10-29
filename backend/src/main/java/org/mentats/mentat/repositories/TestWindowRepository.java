// @author Telmen Enkhtuvshin
// backend/src/main/java/org/mentats/mentat/repositories/TestWindowRepository.java
// This is the JPA repository for the TestWindow entity.
// It is used to store the test window data.

package org.mentats.mentat.repositories;

import org.mentats.mentat.models.TestWindow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestWindowRepository extends JpaRepository<TestWindow, Integer> {
    
    // Find test windows by course ID
    List<TestWindow> findByCourseId(Integer courseId);
    
    // Find active test windows by course ID
    List<TestWindow> findByCourseIdAndIsActiveTrue(Integer courseId);
    
    // Find test windows by instructor (through course)
    @Query("SELECT tw FROM TestWindow tw WHERE tw.courseId IN" +
            "(SELECT c.courseId FROM Course c WHERE c.instructor.id = :professorId)")
    List<TestWindow> findByProfessorId(@Param("professorId") String professorId);
    
    // Find active test windows by instructor
    @Query("SELECT tw FROM TestWindow tw WHERE tw.courseId IN" +
            "(SELECT c.courseId FROM Course c WHERE c.instructor.id = :professorId) AND tw.isActive = true")
    List<TestWindow> findActiveByProfessorId(@Param("professorId") String professorId);
}