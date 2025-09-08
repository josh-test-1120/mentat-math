/**
 * @author Telmen Enkhtuvshin
 * This is the JPA composite ID class for StudentCourse JPA persistance object to
 * determine ID and primary keys of StudentCourse object.
 */

package org.mentats.mentat.models;

import java.io.Serializable;
import java.util.Objects;

public class StudentCourseId implements Serializable {
    private int courseId;
    private int studentId;

    public StudentCourseId() {}

    public StudentCourseId(int courseId, int studentId) {
        this.courseId = courseId;
        this.studentId = studentId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudentCourseId that)) return false;
        return courseId == that.courseId && studentId == that.studentId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(courseId, studentId);
    }
}
