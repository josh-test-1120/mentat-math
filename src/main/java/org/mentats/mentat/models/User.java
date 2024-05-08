package org.mentats.mentat.models;

/**
 * This is the User model to represent users
 */
public class User {
    // Default Roles
    protected enum Level {
        STUDENT,
        INSTRUCTOR,
        ADMINISTRATOR
    }
    // Model attributes
    protected int userID;
    protected String userName;
    protected String password;

    public String firstName;
    public char middleInit;
    public String lastName;
    protected Level role;

    /**
     * Default Constructor
     */
    public User(int userID, String firstName, char middleInit, String lastName, Level role) {
        this.userID = userID;
        this.firstName = firstName;
        this.middleInit = middleInit;
        this.lastName = lastName;
        /**
         * TBD Role validation for Instructor and Administrators
         * Add feature here
         */
        if (role == null) this.role = Level.STUDENT;
        else this.role = role;
    }

    /**
     * This is the User ID getter
     * @return UserID
     */
    public int getUserID() {
        return userID;
    }

    /**
     * Returns a user's full name
     * @return String representing the user name
     */
    public String getName() {
        return String.join(" ", firstName, lastName, role.toString().toLowerCase());
    }

    /**
     * Returns the user's role
     */
    public Level getRole() {
        return role;
    }

    /**
     * Login function for the user
     */
    public void login() {

    }

    /**
     * Logout function for the user
     */
    public void logout() {

    }
}
