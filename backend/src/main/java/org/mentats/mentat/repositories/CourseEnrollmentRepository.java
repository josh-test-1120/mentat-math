/**
 * @author Telmen Enkhtuvshin
 * JPA Repository interface for storing Student course enrollment DB entity and JPA object.
 */

package org.mentats.mentat.repositories;

import org.mentats.mentat.models.StudentCourse;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<StudentCourse, Long> {
    boolean existsByCourseIdAndStudentId(int courseId, int studentId);
}


