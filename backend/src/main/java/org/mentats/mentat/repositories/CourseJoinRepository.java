package org.mentats.mentat.repositories;

import org.mentats.mentat.models.CourseJoin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Course Repository Interface that interacts with the Database through JPA.
 * @author Telmen Enkhtuvshin
 */
@Repository
public interface CourseJoinRepository extends JpaRepository<CourseJoin, Integer> {
    // Find courses by professor ID
    List<CourseJoin> findByCourseProfessorId(String courseProfessorId);
   boolean existsById(int courseId);
}