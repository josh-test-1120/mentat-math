package org.mentats.mentat.utils;

/**
 * Test Constants
 * Centralized constants for use across test files to ensure consistency
 */
public class TestConstants {
    
    // Test User IDs
    public static final Long TEST_USER_ID = 1L;
    public static final Long TEST_USER_ID_2 = 2L;
    public static final Long NON_EXISTENT_USER_ID = 999L;
    
    // Test Usernames
    public static final String TEST_USERNAME = "testuser";
    public static final String TEST_USERNAME_2 = "testuser2";
    public static final String DUPLICATE_USERNAME = "existinguser";
    
    // Test Emails
    public static final String TEST_EMAIL = "test@example.com";
    public static final String TEST_EMAIL_2 = "test2@example.com";
    public static final String DUPLICATE_EMAIL = "existing@example.com";
    
    // Test Names
    public static final String TEST_FIRST_NAME = "Test";
    public static final String TEST_LAST_NAME = "User";
    
    // Test Passwords
    public static final String TEST_PASSWORD = "password123";
    public static final String TEST_PASSWORD_HASH = "$2a$10$encodedPasswordHash";
    public static final String INVALID_PASSWORD = "wrongpassword";
    public static final String SHORT_PASSWORD = "short";
    
    // Test User Types
    public static final String USER_TYPE_STUDENT = "STUDENT";
    public static final String USER_TYPE_INSTRUCTOR = "INSTRUCTOR";
    public static final String USER_TYPE_ADMIN = "ADMINISTRATOR";
    
    // Error Messages
    public static final String ERROR_USER_NOT_FOUND = "User not found";
    public static final String ERROR_USERNAME_TAKEN = "Username is already taken";
    public static final String ERROR_EMAIL_IN_USE = "Email is already in use";
    public static final String ERROR_INCORRECT_PASSWORD = "Current password is incorrect";
    public static final String ERROR_PASSWORD_TOO_SHORT = "New password must be at least 6 characters long";
    
    // HTTP Status Codes
    public static final int HTTP_OK = 200;
    public static final int HTTP_BAD_REQUEST = 400;
    public static final int HTTP_UNAUTHORIZED = 401;
    public static final int HTTP_FORBIDDEN = 403;
    public static final int HTTP_NOT_FOUND = 404;
    public static final int HTTP_CONFLICT = 409;
    public static final int HTTP_INTERNAL_SERVER_ERROR = 500;
    
    // Private constructor to prevent instantiation
    private TestConstants() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }
}

