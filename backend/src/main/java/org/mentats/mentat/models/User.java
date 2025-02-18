package org.mentats.mentat.models;

/**
 * New stuff for Authentication
 */

import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * This is the User model to represent users
 */
@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email")
        })
public class User {
    /**
     * Roles configured for users
     */
    protected enum Level {
        STUDENT,
        INSTRUCTOR,
        ADMINISTRATOR
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Model attributes
    protected int userID;

    @NotBlank
    @Size(max = 20)
    protected String username;

    @NotBlank
    @Size(max = 120)
    protected String password;

    @NotBlank
    @Size(max = 50)
    @Email
    protected String email;

    @NotBlank
    @Size(max = 50)
    public String firstName;

    public char middleInit;

    @NotBlank
    @Size(max = 50)
    public String lastName;

    @NotBlank
    @Size(max = 20)
    public String userType;

    // @Telmen Unnecessary code for now. Will revive later.
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(  name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    protected Set<Role> roles = new HashSet<>();
    protected Level roleType;


    /**
     * Empty constructor
     * Lazy reference
     */
    public User() {
    }

    /**
     * Default Constructor
     */
    public User(String firstName, String lastName, String username, String email, String userType, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = password;
        /**
         * TBD Role validation for Instructor and Administrators
         * Add feature here
         */
        if (userType == null) this.userType = String.valueOf(Level.STUDENT);
        else this.userType = userType;
    }

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
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
        return String.join(" ", firstName, lastName, roles.toString().toLowerCase());
    }


    /**
     * Returns the user's role
     */
//    public Level getRole() {
//        return role;
//    }

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


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public String getUserType() {return userType;}

    public void setUserType(String userType) {this.userType = userType;}
}
