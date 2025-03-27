package org.mentats.mentat.repositories;

import org.mentats.mentat.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Course Repository Interface that interacts with the Database through JPA.
 * @author Telmen Enkhtuvshin
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
}