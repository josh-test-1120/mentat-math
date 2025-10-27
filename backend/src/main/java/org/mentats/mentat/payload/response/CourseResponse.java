package org.mentats.mentat.payload.response;
import org.mentats.mentat.models.Course;

/**
 * Form response validation serializer
 * Course response objects
 * serialize Course responses
 * @author Joshua Summers
 */
public class CourseResponse {
    private Long courseId;
    private String courseName;
    private Long courseProfessorId;    // Only ID, not full entity
    private String courseSection;
    private String courseQuarter;
    private Integer courseYear;
    private String gradeStrategy;

    // Constructor from Entity
    public CourseResponse(Course course) {
        this.courseId = course.getCourseId();
        this.courseName = course.getCourseName();
        this.courseProfessorId = course.getInstructor() != null ? course.getInstructor().getId() : null;
        this.courseSection = course.getCourseSection();
        this.courseQuarter = course.getCourseQuarter();
        this.courseYear = course.getCourseYear();
        this.gradeStrategy = course.getGradeStrategy();
    }

    // Constructor for Projection injection (manual)
    public CourseResponse(Long courseId, String courseName, Long courseProfessorId, String courseSection,
                          String courseQuarter, Integer courseYear, String gradeStrategy) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.courseProfessorId = courseProfessorId;
        this.courseSection = courseSection;
        this.courseQuarter = courseQuarter;
        this.courseYear = courseYear;
        this.gradeStrategy = gradeStrategy;
    }

    // Getters only (response is read-only)
    public Long getCourseId() { return courseId; }
    public Long getCourseProfessorId() { return courseProfessorId; }
    public String getCourseName() { return courseName; }
    public String getCourseSection() { return courseSection; }
    public String getCourseQuarter() { return courseQuarter; }
    public Integer getCourseYear() { return courseYear; }
    public String getGradeStrategy() { return gradeStrategy; }

    /**
     * String override for output response
     * @return
     */
    @Override
    public String toString() {
        return "CourseResponse{" +
                "courseId=" + courseId +
                ", courseName='" + courseName + '\'' +
                ", courseProfessorId=" + courseProfessorId +
                ", courseSection='" + courseSection + '\'' +
                ", courseQuarter='" + courseQuarter + '\'' +
                ", courseYear=" + courseYear +
                ", gradeStrategy='" + gradeStrategy + '\'' +
                '}';
    }
}