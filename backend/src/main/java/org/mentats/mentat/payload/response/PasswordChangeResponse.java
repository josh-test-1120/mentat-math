package org.mentats.mentat.payload.response;

import java.time.Instant;

/**
 * Response DTO for password change operations.
 * Provides confirmation metadata without exposing sensitive data.
 */
public class PasswordChangeResponse {
    private final String message;
    private final Long userId;
    private final Instant changedAt;

    public PasswordChangeResponse(String message, Long userId, Instant changedAt) {
        this.message = message;
        this.userId = userId;
        this.changedAt = changedAt;
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }

    public Instant getChangedAt() {
        return changedAt;
    }
}

