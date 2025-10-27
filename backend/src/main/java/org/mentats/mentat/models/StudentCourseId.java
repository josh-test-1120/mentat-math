/**
 * @author Telmen Enkhtuvshin
 * This is the JPA composite ID class for StudentCourse JPA persistance object to
 * determine ID and primary keys of StudentCourse object.
 */

package org.mentats.mentat.models;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class StudentCourseId implements Serializable {
    private Long courseId;
    private Long studentId;

    public StudentCourseId() {}

    public StudentCourseId(Long courseId, Long studentId) {
        this.courseId = courseId;
        this.studentId = studentId;
    }

    // Getters and setters
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentCourseId that)) return false;
        return Objects.equals(courseId, that.courseId) &&
                Objects.equals(studentId, that.studentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(courseId, studentId);
    }
}