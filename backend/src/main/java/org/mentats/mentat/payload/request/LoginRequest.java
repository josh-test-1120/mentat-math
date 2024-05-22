package org.mentats.mentat.payload.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Form request validation serializer
 * Login request objects
 */
public class LoginRequest {
    @NotBlank
    private String username;

    //@NotBlank
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}