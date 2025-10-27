package org.mentats.mentat.payload.response;

import org.mentats.mentat.models.StudentCourse;

import java.time.LocalDate;

/**
 * Form response validation serializer
 * Student Course response objects
 * serialize Student Course responses
 * @author Joshua Summers
 */
public class StudentCourseResponse {
    private Long courseId;
    private Long studentId;
    private String studentCourseGrade;
    private LocalDate studentDateRegistered;

    // Constructor from Entity
    public StudentCourseResponse(StudentCourse studentCourse) {
        this.courseId = studentCourse.getCourseId();
        this.studentId = studentCourse.getStudentId();
        this.studentCourseGrade = studentCourse.getStudentCourseGrade();
        this.studentDateRegistered = studentCourse.getStudentDateRegistered();
    }

    // Constructor for Projection injection (manual)
    public StudentCourseResponse(Long courseId, Long studentId,
                                 String studentCourseGrade, LocalDate studentDateRegistered) {
        this.courseId = courseId;
        this.studentId = studentId;
        this.studentCourseGrade = studentCourseGrade;
        this.studentDateRegistered = studentDateRegistered;
    }

    // Getters only (response is read-only)
    public Long getCourseId() { return courseId; }
    public Long getStudentId() { return studentId; }
    public String getStudentCourseGrade() { return studentCourseGrade; }
    public LocalDate getStudentDateRegistered() { return studentDateRegistered; }

    /**
     * String override for output response
     * @return
     */
    @Override
    public String toString() {
        return "StudentCourseResponse{" +
                "courseId=" + courseId +
                ", studentId=" + studentId +
                ", studentCourseGrade='" + studentCourseGrade + '\'' +
                ", studentDateRegistered=" + studentDateRegistered +
                '}';
    }
}
