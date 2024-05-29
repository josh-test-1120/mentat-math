package org.mentats.mentat.models;

import java.util.Objects;

/** This class stores data of any course an instructor wants to add i.e. Professor Black adds MATH260; should try to
 * have logic that shows all students registered for the class (may have to extend another class not build yet; TBD)
 * @author Telmen Enkhtuvshin
 */
public class Course {
    /**
     * Report.Report.Course class fields.
     */
    // Report.Report.Course ID for this course
    private String courseID;
    // The course name
    public String courseName;
    //Report.Report.Course's instructor ID
    private String instructorID;
    //Report.Report.Course's instructor name
    public String instructorName;
    //Report.Report.Course term (i.e. Winter 2024)
    public String term;
    public String section;

    /**
     * Report.Report.Course class constructor.
     * @param courseID       String type course ID.
     * @param courseName     String type course name.
     * @param instructorID   String type instructor ID.
     * @param instructorName String type name of the instructor.
     * @param term           String type term of the course.
     * @param section        String type section of the course.
     */
    //Report.Report.Course object constructor
    public Course(String courseID, String courseName, String instructorID, String instructorName,
                  String term, String section){
        this.courseID       = courseID;
        this.courseName     = courseName;
        this.instructorID   = instructorID;
        this.instructorName = instructorName;
        this.term           = term;
        this.section        = section;
    }

    /**
     * A getter method that returns the course ID
     * @return String course ID
     */
    public String getCourseID() {
        return courseID;
    }

    /**
     * A getter method that returns the instructor ID
     * @return String instructor ID
     */
    public String getInstructorID() {
        return instructorID;
    }

    /**
     * A method that adds a course to the system which creates.
     * @param courseID String course ID
     * @param courseName String course name
     * @param courseInstructorID String instructor ID
     * @param courseInstructorName String Instructor name teaching the course
     * @param courseTerm String period of the year the course is taking place
     * @param section String the exact section number of the course
     */
    public void addCourse(String courseID, String courseName, String courseInstructorID,
                          String courseInstructorName, String courseTerm, String section){
        //Creating course object
        Course newCourse = new Course(courseID, courseName, courseInstructorID,
                courseInstructorName, courseTerm, section);

        // TODO: 5/10/24 Continue adding new course to the system and database. (Still needs careful logic.)
    }

    /**
     * A method which updates the profile information of the course object and the connected database information.
     * @param courseID String course ID
     * @param courseName String course full name
     * @param courseInstructorID String instructor ID
     * @param courseInstructorName String instructor name
     * @param courseTerm String course term of the year
     * @param courseSection String exact section identifier
     */
    public void updateCourse(String courseID, String courseName, String courseInstructorID,
                             String courseInstructorName, String courseTerm, String courseSection){
        if (!Objects.equals(courseID, "")) {
            this.courseID = courseID;
        }
        if (!Objects.equals(courseName, "")) {
            this.courseName = courseName;
        }
        if (!Objects.equals(courseInstructorID, "")) {
            this.instructorID = courseInstructorID;
        }
        if (!Objects.equals(courseInstructorName, "")) {
            this.instructorName = courseInstructorName;
        }
        if (!Objects.equals(courseTerm, "")) {
            this.term = courseTerm;
        }
        if (!Objects.equals(courseSection, "")) {
            this.section = courseSection;
        }

        // TODO: 5/10/24 Continue updating the system and database ✅
    }

    /**
     * A method that deleted the course object and connected information from the database as well as system.
     */
    public void deleteCourse(){
        this.courseID       = null;
        this.courseName     = null;
        this.instructorID   = null;
        this.instructorName = null;
        this.term           = null;
        this.section        = null;


        // TODO: 5/10/24 Continue delete the course from the database and system. (Still needs careful logic.)
    }

}