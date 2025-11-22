package org.mentats.mentat.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for changing user password
 * @author Telmen Enkhtuvshin
 */
public class PasswordChangeRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 40, message = "New password must be between 6 and 40 characters")
    private String newPassword;

    /**
     * Default constructor
     */
    public PasswordChangeRequest() {
    }

    /**
     * Constructor with all fields
     */
    public PasswordChangeRequest(String currentPassword, String newPassword) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }

    // Getters and Setters
    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

