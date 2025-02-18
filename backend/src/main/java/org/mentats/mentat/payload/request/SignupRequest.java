package org.mentats.mentat.payload.request;

import java.util.Set;

import jakarta.validation.constraints.*;

/**
 * Form request validation serializer
 * Signup request objects
 * new User creation
 * @author Joshua Summers
 */
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String firstname;

    @NotBlank
    @Size(min = 3, max = 20)
    private String lastname;

    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    private Set<String> role;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank
    @Size(min = 6, max = 20)
    private String userType;

    /**
     * Getter for First Name
     * @return string of first name
     */
    public String getFirstname() {
        return firstname;
    }

    /**
     * Setter for First Name
     * @param firstname string of first name
     */
    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    /**
     * Getter for Last Name
     * @return string of last name
     */
    public String getLastname() { return lastname; }

    /**
     * Setter for Last Name
     * @param lastname string for last name
     */
    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    /**
     * Getter for Username
     * @return string of username
     */
    public String getUsername() {
        return username;
    }

    /**
     * Getter for Username
     * @param username string of username
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Getter for Email
     * @return string of email
     */
    public String getEmail() {
        return email;
    }

    /**
     * Setter for Email
     * @param email string of email
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Getter for Password
     * @return string of password
     */
    public String getPassword() {
        return password;
    }

    /**
     * Setter for Password
     * @param password string of password
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Getter for the Role
     * @return Set of String's representing the roles
     */
    public Set<String> getRole() {
        return this.role;
    }

    /**
     * Setter for the Role
     * @param role Set of String's representing the roles
     */
    public void setRole(Set<String> role) {
        this.role = role;
    }

    public String getUserType() {return userType; }
    public void setUserType(String userType) {this.userType = userType;}
}