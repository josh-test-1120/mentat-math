package org.mentats.mentat.payload.response;

/**
 * Response DTO for profile update operations.
 * Wraps a sanitized user object with a status message.
 */
public class ProfileUpdateResponse {
    private final String message;
    private final UserResponse user;

    public ProfileUpdateResponse(String message, UserResponse user) {
        this.message = message;
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public UserResponse getUser() {
        return user;
    }
}

