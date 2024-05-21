package org.mentats.mentat;

/**
 * This class represents a Profile entity for both students and instructors; it holds
 * details such as a student or instructor's name, email, department, etc.
 *
 * @author Phillip Ho
 */


public class Profile {


    private String firstName;
    private String middleInit;
    private String lastName;
    private int profileID;
    private String email;

    //Profile constructor
    public Profile(String firstName, String middleInit, String lastName, int profileID, String email) {
        this.firstName = firstName;
        this.middleInit = middleInit;
        this.lastName = lastName;
        this.profileID = profileID;
        this.email = email;
    }

    //no-arg constructor
    public Profile() {

    }


    //Profile getter functions
    public String getFirstName() {
        return firstName;
    }

    public String getMiddleInit() {
        return middleInit;
    }

    public String getLastName() {
        return lastName;
    }

    public int getProfileID() {
        return profileID;
    }

    public String getEmail() {
        return email;
    }

    //Profile setter functions
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setMiddleInit(String middleInit) {
        this.middleInit = middleInit;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setProfileID(int profileID) {
        this.profileID = profileID;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    //Profile methods
    public void updateProfile() {
        //logic here
    }

    public void viewProfile() {
        //logic here
    }

    static class Instructor extends Profile {
        //instructor specific attribute
        private String department;

        //constructor
        public Instructor(String firstName, String middleInit, String lastName, int profileID, String email, String department){
            super(firstName, middleInit, lastName, profileID, email);
            this.department = department;
        }

        //getter
        public String getDepartment() {
            return department;
        }

        //setter
        public void setDepartment(String department) {
            this.department = department;
        }
    }

    static class Student extends Profile{
        //student specific attribute
        private String course;

        //constructor
        public Student(String firstName, String middleInit, String lastName, int profileID, String email, String course){
            super(firstName, middleInit, lastName, profileID, email);
            this.course = course;
        }

        //no-arg constructor
        public Student() {
            super();
        }

        //getter
        public String getcourse() {
            return course;
        }

        //setter
        public void setcourse(String course) {
            this.course = course;
        }
    }
}
