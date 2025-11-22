package org.mentats.mentat.payload.response;

import org.mentats.mentat.models.User;

/**
 * Response DTO for User information
 * Excludes sensitive information like password
 * @author Telmen Enkhtuvshin
 */
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String userType;

    /**
     * Default constructor
     */
    public UserResponse() {
    }

    /**
     * Constructor from User entity
     * @param user User entity
     */
    public UserResponse(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.userType = user.getUserType();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
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

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}

