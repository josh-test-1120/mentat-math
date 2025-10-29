package org.mentats.mentat.repositories;

import org.mentats.mentat.models.ExamResult;
import org.mentats.mentat.projections.ExamResultDetailsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Exam Result Repository Interface that interacts with the Database through JPA.
 *
 * @see org.springframework.data.jpa.repository.JpaRepository
 * @see https://spring.io/guides/gs/accessing-data-jpa
 * @author Joshua Summers
 */
@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    // Find ExamResults based on student Id
    List<ExamResult> findByStudent_Id(Long studentId);
    // Find ExamResults based on Exam Id
    List<ExamResult> findByExam_Id(Long examId);
    // Find the ExamResults based on Exam Id and Exam version
    List<ExamResult> findByExam_IdAndExamVersion(Long examId, Integer examVersion);
    // Delete the ExamResults based on Student Id
    void deleteByStudent_Id(Long studentId);
    // Delete the ExamResults based on Exam Id
    void deleteByExam_Id(Long examId);
    // Unique Record checks
    boolean existsByExam_IdAndExamVersion(Long examId, Integer examVersion);

    @Query("SELECT er.Id as examResultId, er.examScore as examScore, " +
            "er.examScheduledDate as examScheduledDate, er.examTakenDate as examTakenDate, " +
            "er.examVersion as examVersion, " +
            "e.name as examName, e.state as examState, e.required as examRequired, " +
            "e.difficulty as examDifficulty, e.duration as examDuration, e.online as examOnline, " +
            "e.Id as examId, c.courseId as courseId, " +
            "c.courseName as courseName, c.courseSection as courseSection, " +
            "c.courseYear as courseYear, c.courseQuarter as courseQuarter, " +
            "c.instructor.id as courseProfessorId, c.gradeStrategy as gradeStrategy " +
            "FROM ExamResult er " +
            "JOIN er.exam e " +
            "JOIN e.course c " +
            "WHERE er.student.id = :studentId")
    List<ExamResultDetailsProjection> findResultDetailsByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT er.Id as examResultId, er.examScore as examScore, " +
            "er.examScheduledDate as examScheduledDate, er.examTakenDate as examTakenDate, " +
            "er.examVersion as examVersion, " +
            "e.name as examName, e.state as examState, e.required as examRequired, " +
            "e.difficulty as examDifficulty, e.duration as examDuration, e.online as examOnline, " +
            "e.Id as examId, courseId as courseId, " +
            "c.courseName as courseName, c.courseSection as courseSection, " +
            "c.courseYear as courseYear, c.courseQuarter as courseQuarter, " +
            "c.instructor.id as courseProfessorId, c.gradeStrategy as gradeStrategy " +
            "FROM ExamResult er " +
            "JOIN er.exam e " +
            "JOIN e.course c " +
            "WHERE c.courseId = :courseId")
    List<ExamResultDetailsProjection> findResultDetailsByCourseId(@Param("courseId") Long courseId);
}
