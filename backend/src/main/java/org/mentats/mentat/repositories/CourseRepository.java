package org.mentats.mentat.repositories;

import org.mentats.mentat.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Course Repository Interface that interacts with the Database through JPA.
 *
 * @see org.springframework.data.jpa.repository.JpaRepository
 * @see https://spring.io/guides/gs/accessing-data-jpa
 * @author Joshua Summers
 *
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    // Find courses by professor ID
    List<Course> findByInstructor_Id(Long courseProfessorId);
//    List<Course> findByCourseProfessorId(Long courseProfessorId);
    // Find courses by year and quarter
    List<Course> findByCourseYearAndCourseQuarter(Integer courseYear, String courseQuarter);
    // Find courses by name (case-insensitive)
    List<Course> findByCourseNameContainingIgnoreCase(String courseName);
    // Find specific course by section, year, and quarter
    Optional<Course> findByCourseSectionAndCourseYearAndCourseQuarter(String courseSection, Integer courseYear, String courseQuarter);
    // Check if course exists with the same section, year, and quarter
    boolean existsByCourseSectionAndCourseYearAndCourseQuarter(String courseSection, Integer courseYear, String courseQuarter);
}