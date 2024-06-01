package org.mentats.mentat.payload.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Form request validation serializer
 * Login request objects
 * @author Joshua Summers
 */
public class LoginRequest {
    @NotBlank
    private String username;

    //@NotBlank
    private String password;

    /**
     * Getter for username
     * @return string of username
     */
    public String getUsername() {
        return username;
    }

    /**
     * Setter for username
     * @param username string of username
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Getter for password
     * @return string of password
     */
    public String getPassword() {
        return password;
    }

    /**
     * Setter for password
     * @param password string of password
     */
    public void setPassword(String password) {
        this.password = password;
    }
}