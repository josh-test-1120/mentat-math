package org.mentats.mentat.repositories;

import org.mentats.mentat.models.StudentCourse;
import org.mentats.mentat.projections.StudentCourseWithUserDetailsProjection;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.mentats.mentat.models.StudentCourseId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import java.util.List;

/**
 * JPA Repository interface for storing Student course enrollment DB entity and JPA object.
 *
 * @see org.mentats.mentat.models.StudentCourse
 * The interface method names are directly derived from the entity names and functions by verb conjugation.
 * @see org.springframework.data.jpa.repository.JpaRepository
 * @see https://spring.io/guides/gs/accessing-data-jpa
 * @author Telmen Enkhtuvshin
 */
@Repository
public interface StudentCourseRepository extends JpaRepository<StudentCourse, StudentCourseId> {
    // Custom queries for finding embedded ids
    // Check if a student is enrolled in a course
    boolean existsById_CourseIdAndId_StudentId(Long courseId, Long studentId);
    // Find all enrollments for a student (also works due to embedded id)
    List<StudentCourse> findByIdStudentId(Long studentId);
    // Find all enrollments for a student (works same as above, but guaranteed when id changes)
    List<StudentCourse> findById_StudentId(Long studentId);
    // Find all enrollments based on course ID (also works due to embedded id)
    List<StudentCourse> findByIdCourseId(Long courseId);
    // Find all enrollments for a course (works same as above, but guaranteed when id changes)
    List<StudentCourse> findById_CourseId(Long courseId);
    // Find enrollment for a student based on a course (use embedded IDs)
    Optional<StudentCourse> findById_CourseIdAndId_StudentId(Long courseId, Long studentId);
    // Complex query for student course with additional table info
    // Query by Course Id, with student details
    @Query("SELECT sc.id.courseId as courseId, sc.id.studentId as studentId, " +
            "sc.studentCourseGrade as studentCourseGrade, sc.studentDateRegistered as studentDateRegistered, " +
            "s.firstName as firstName, s.lastName as lastName, " +
            "s.username as userName, s.email as email " +
            "FROM StudentCourse sc " +
            "JOIN sc.course c " +
            "JOIN sc.student s " +
            "WHERE sc.id.courseId = :courseId")
    List<StudentCourseWithUserDetailsProjection> findResultDetailsByCourseIdWithStudentInfo(@Param("courseId") Long courseId);
}


