/**
 * @author Telmen Enkhtuvshin
 * JPA Repository interface for storing Student course enrollment DB entity and JPA object.
 * @see org.mentats.mentat.models.StudentCourse
 * The interface method names are directly derived from the entity names and functions by verb conjugation.
 */

package org.mentats.mentat.repositories;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.StudentCourse;
import org.springframework.stereotype.Repository;
import org.mentats.mentat.models.StudentCourseId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<StudentCourse, StudentCourseId> {
    // Check if a student is enrolled in a course
    boolean existsByCourseIdAndStudentId(int courseId, int studentId);
    // Find all enrollments for a course
    List<StudentCourse> findByCourseId(int courseId);
    // Find all enrollments for a student
    List<StudentCourse> findByStudentId(int studentId);
}


