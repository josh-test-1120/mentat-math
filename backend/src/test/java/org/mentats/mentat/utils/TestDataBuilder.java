package org.mentats.mentat.utils;

import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.LoginRequest;
import org.mentats.mentat.payload.request.PasswordChangeRequest;
import org.mentats.mentat.payload.request.ProfileUpdateRequest;
import org.mentats.mentat.payload.request.SignupRequest;

/**
 * Test Data Builder Utility
 * Provides reusable test data creation methods to reduce duplication
 * across test files.
 * 
 * Usage:
 *   User user = TestDataBuilder.createTestUser(1L, "testuser");
 *   ProfileUpdateRequest request = TestDataBuilder.createProfileUpdateRequest();
 */
public class TestDataBuilder {

    /**
     * Create a test User entity
     * @param id User ID
     * @param username Username
     * @return User entity with default test values
     */
    public static User createTestUser(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword("$2a$10$encodedPasswordHash");
        user.setUserType("STUDENT");
        return user;
    }

    /**
     * Create a test User entity with all fields
     * @param id User ID
     * @param username Username
     * @param email Email
     * @param firstName First name
     * @param lastName Last name
     * @param userType User type
     * @return User entity
     */
    public static User createTestUser(Long id, String username, String email, 
                                     String firstName, String lastName, String userType) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPassword("$2a$10$encodedPasswordHash");
        user.setUserType(userType);
        return user;
    }

    /**
     * Create a ProfileUpdateRequest with default test values
     * @return ProfileUpdateRequest
     */
    public static ProfileUpdateRequest createProfileUpdateRequest() {
        return new ProfileUpdateRequest(
                "John",
                "Doe",
                "johndoe",
                "john@example.com"
        );
    }

    /**
     * Create a ProfileUpdateRequest with custom values
     * @param firstName First name
     * @param lastName Last name
     * @param username Username
     * @param email Email
     * @return ProfileUpdateRequest
     */
    public static ProfileUpdateRequest createProfileUpdateRequest(
            String firstName, String lastName, String username, String email) {
        return new ProfileUpdateRequest(firstName, lastName, username, email);
    }

    /**
     * Create a PasswordChangeRequest with default test values
     * @return PasswordChangeRequest
     */
    public static PasswordChangeRequest createPasswordChangeRequest() {
        return new PasswordChangeRequest(
                "currentPassword",
                "newPassword123"
        );
    }

    /**
     * Create a PasswordChangeRequest with custom values
     * @param currentPassword Current password
     * @param newPassword New password
     * @return PasswordChangeRequest
     */
    public static PasswordChangeRequest createPasswordChangeRequest(
            String currentPassword, String newPassword) {
        return new PasswordChangeRequest(currentPassword, newPassword);
    }

    /**
     * Create a SignupRequest with default test values
     * @return SignupRequest
     */
    public static SignupRequest createSignupRequest() {
        SignupRequest request = new SignupRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("password123");
        request.setFirstname("New");
        request.setLastname("User");
        request.setUserType("STUDENT");
        return request;
    }

    /**
     * Create a SignupRequest with custom values
     * @param username Username
     * @param email Email
     * @param password Password
     * @param firstname First name
     * @param lastname Last name
     * @param userType User type
     * @return SignupRequest
     */
    public static SignupRequest createSignupRequest(
            String username, String email, String password,
            String firstname, String lastname, String userType) {
        SignupRequest request = new SignupRequest();
        request.setUsername(username);
        request.setEmail(email);
        request.setPassword(password);
        request.setFirstname(firstname);
        request.setLastname(lastname);
        request.setUserType(userType);
        return request;
    }

    /**
     * Create a LoginRequest with default test values
     * @return LoginRequest
     */
    public static LoginRequest createLoginRequest() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");
        return request;
    }

    /**
     * Create a LoginRequest with custom values
     * @param username Username
     * @param password Password
     * @return LoginRequest
     */
    public static LoginRequest createLoginRequest(String username, String password) {
        LoginRequest request = new LoginRequest();
        request.setUsername(username);
        request.setPassword(password);
        return request;
    }
}

