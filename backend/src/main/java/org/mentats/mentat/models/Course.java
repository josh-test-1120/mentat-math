package org.mentats.mentat.models;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** This class stores data of any course an instructor wants to add i.e. Professor Black adds MATH260; should try to
 * have logic that shows all students registered for the class (may have to extend another class not build yet; TBD)
 * @author Telmen Enkhtuvshin
 */
@Entity
@Table(name = "Course",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "course_id"),
                @UniqueConstraint(columnNames = {"course_section", "course_year", "course_quarter"})
        })
public class Course {
    /**
     * Report.Report.Course class fields.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Report.Report.Course ID for this course
    private int course_ID;

    // The course name
    @NotBlank
    @Size(max = 50)
    @JsonProperty("courseName") // Map JSON field to Java field
    protected String course_name;

    //Report.Report.Course's instructor ID
    @JsonProperty("courseProfessorId") // Map JSON field to Java field
    private String courseProfessorId;

    // Course section
    @Size (max = 20)
    @JsonProperty("courseSection") // Map JSON field to Java field
    public String course_section;

    @Min(2000)
    @JsonProperty("courseYear") // Map JSON field to Java field
    private int courseYear;

    @NotBlank
    @Size(max = 20)
    @JsonProperty("courseQuarter") // Map JSON field to Java field
    //Report.Report.Course term (i.e. Winter 2024)
    public String course_quarter;




    /**
     * Report.Report.Course class constructor.
     *
     * @param courseName        String type course name.
     * @param courseProfessorId String type instructor ID.
     * @param courseQuarter     String type term of the course.
     */
    //Report.Report.Course object constructor
    public Course(String courseName, String courseProfessorId,
                  String courseQuarter, String courseSection, int courseYear){
        this.course_name        = courseName;
        this.courseProfessorId = courseProfessorId;
        this.course_quarter     = courseQuarter;
        this.course_section    = courseSection;
        this.courseYear        = courseYear;
    }

    /**
     * Default constructor for Course
     */
    public Course() {

    }

    /**
     * A getter method that returns the course ID
     * @return String course ID
     */
    public int getCourseID() {
        return course_ID;
    }

    /**
     * A getter method that returns the instructor ID
     * @return String instructor ID
     */
    public String getCourseProfessorId() {
        return courseProfessorId;
    }

    /**
     * A getter method that returns the Course name
     * @return String Course name
     */
    public String getCourseName() {
        return course_name;
    }

    /**
     * A getter method that returns the Course Section
     * @return String Course section
     */
    public String getCourseSection() {
        return course_section;
    }

    /**
     * A getter method that returns the Course year
     * @return String Course year
     */
    public int getCourseYear() {
        return courseYear;
    }

    /**
     * A getter method that returns the Course quarter
     * @return String Course quarter
     */
    public String getCourseQuarter() {
        return course_quarter;
    }

    /**
     * A method that adds a course to the system which creates.
     * @param courseName String course name
     * @param courseInstructorID String instructor ID
     * @param courseTerm String period of the year the course is taking place
     * @param courseSection String the exact section number of the course
     */
    public void addCourse(String courseName, String courseInstructorID,
                          String courseTerm, String courseSection,
                          int courseYear){
        //Creating course object
        Course newCourse = new Course(courseName, courseInstructorID,
                courseTerm, courseSection, courseYear);

        // TODO: 5/10/24 Continue adding new course to the system and database. (Still needs careful logic.)
    }

    /**
     * A method which updates the profile information of the course object and the connected database information.
     * @param courseID String course ID
     * @param courseName String course full name
     * @param courseProfessorId String instructor ID
     * @param courseTerm String course term of the year
     * @param courseSection String exact section identifier
     */
    public void updateCourse(int courseID, String courseName, String courseProfessorId,
                             String courseTerm, String courseSection){
        if (!Objects.equals(courseID, "")) {
            this.course_ID = courseID;
        }
        if (!Objects.equals(courseName, "")) {
            this.course_name = courseName;
        }
        if (!Objects.equals(courseProfessorId, "")) {
            this.courseProfessorId = courseProfessorId;
        }
        if (!Objects.equals(courseTerm, "")) {
            this.course_quarter = courseTerm;
        }
        if (!Objects.equals(courseSection, "")) {
            this.course_section = courseSection;
        }

        // TODO: 5/10/24 Continue updating the system and database ✅
    }

    /**
     * A method that deleted the course object and connected information from the database as well as system.
     */
    public void deleteCourse(){
        this.course_ID       = 0;
        this.course_name     = null;
        this.courseProfessorId   = null;
        this.course_quarter  = null;
        this.course_section  = null;


        // TODO: 5/10/24 Continue delete the course from the database and system. (Still needs careful logic.)
    }

}