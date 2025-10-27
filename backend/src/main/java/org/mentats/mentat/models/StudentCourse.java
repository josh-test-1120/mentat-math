package org.mentats.mentat.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "StudentCourse",
        uniqueConstraints = @UniqueConstraint(columnNames = {"course_id","student_id"}))
public class StudentCourse {

    @EmbeddedId
    private StudentCourseId id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("courseId")  // This maps to the courseId in the embedded ID
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore()
    private Course course;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")  // This maps to the studentId in the embedded ID
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore()
    private User student;

    @Pattern(regexp = "^(A\\+|A|A-|B\\+|B|B-|C\\+|C|C-|D\\+|D|D-|F|INC|P|NP)$",
            message = "Invalid grade format")
    @Column(name = "student_course_grade", nullable = true, length = 5)
    private String studentCourseGrade;

    @Column(name = "student_date_registered", nullable = false)
    private LocalDate studentDateRegistered;

    public StudentCourse() {}

    public StudentCourse(Course course, User student, LocalDate studentDateRegistered) {
        this.course = course;
        this.student = student;
        this.studentDateRegistered = studentDateRegistered;
        this.id = new StudentCourseId(course.getCourseId(), student.getId());
    }

    // Getters and setters
    public StudentCourseId getId() { return id; }
    public void setId(StudentCourseId id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) {
        this.student = student;
        if (this.id != null && student != null) {
            this.id.setStudentId(student.getId());
        }
    }

    public Course getCourse() { return course; }
    public void setCourse(Course course) {
        this.course = course;
        if (this.id != null && course != null) {
            this.id.setCourseId(course.getCourseId());
        }
    }

    public LocalDate getStudentDateRegistered() { return studentDateRegistered; }
    public void setStudentDateRegistered(LocalDate studentDateRegistered) {
        this.studentDateRegistered = studentDateRegistered;
    }

    public String getStudentCourseGrade() { return studentCourseGrade; }
    public void setStudentCourseGrade(String studentCourseGrade) {
        this.studentCourseGrade = studentCourseGrade;
    }

    // Helper methods to get the IDs directly
    public Long getStudentId() {
        return student != null ? student.getId() : null;
    }

    public Long getCourseId() {
        return course != null ? course.getCourseId() : null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentCourse that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "StudentCourse{" +
                "courseId=" + getCourseId() +
                ", studentId=" + getStudentId() +
                ", studentCourseGrade='" + studentCourseGrade + '\'' +
                ", studentDateRegistered=" + studentDateRegistered +
                '}';
    }
}