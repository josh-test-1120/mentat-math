package org.mentats.mentat.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.PasswordChangeRequest;
import org.mentats.mentat.payload.request.ProfileUpdateRequest;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.payload.response.ProfileUpdateResponse;
import org.mentats.mentat.payload.response.UserResponse;
import org.mentats.mentat.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.mentats.mentat.security.services.UserDetailsImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserController
 * Tests API endpoint request/response handling
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserController Tests")
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserController userController;

    private User testUser;
    private Long testUserId;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        testUserId = 1L;
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");

        userDetails = new UserDetailsImpl(
                testUserId,
                "testuser",
                "test@example.com",
                "encodedPassword",
                null,
                "STUDENT",
                "Test"
        );

        // Setup security context (only for tests that need it)
        // Note: getUserProfile doesn't use authentication, so we set this up per-test
        SecurityContextHolder.setContext(securityContext);
    }
    
    /**
     * Helper method to setup authentication for tests that need it
     */
    private void setupAuthentication() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);
    }

    @Test
    @DisplayName("Should successfully get user profile by ID")
    void testGetUserProfile_Success() {
        // Given
        // Note: getUserProfile doesn't require authentication, so no security setup needed
        when(userService.getUserById(testUserId)).thenReturn(testUser);

        // When
        ResponseEntity<?> response = userController.getUserProfile(testUserId);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof UserResponse);
        UserResponse userResponse = (UserResponse) response.getBody();
        assertEquals(testUserId, userResponse.getId());
        verify(userService, times(1)).getUserById(testUserId);
    }

    @Test
    @DisplayName("Should return 404 when user not found")
    void testGetUserProfile_NotFound() {
        // Given
        // Note: getUserProfile doesn't require authentication, so no security setup needed
        when(userService.getUserById(testUserId))
                .thenThrow(new EntityNotFoundException("User not found"));

        // When
        ResponseEntity<?> response = userController.getUserProfile(testUserId);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(userService, times(1)).getUserById(testUserId);
    }

    @Test
    @DisplayName("Should successfully update profile with valid data")
    void testUpdateProfile_Success() {
        // Given
        setupAuthentication(); // This test needs authentication
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "UpdatedFirst",
                "UpdatedLast",
                "testuser",
                "test@example.com"
        );
        when(userService.updateProfile(testUserId, request)).thenReturn(testUser);

        // When
        ResponseEntity<?> response = userController.updateProfile(testUserId, request);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof ProfileUpdateResponse);
        verify(userService, times(1)).updateProfile(testUserId, request);
    }

    @Test
    @DisplayName("Should return 404 when updating non-existent user")
    void testUpdateProfile_UserNotFound() {
        // Given
        setupAuthentication(); // This test needs authentication
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "UpdatedFirst",
                "UpdatedLast",
                "testuser",
                "test@example.com"
        );
        when(userService.updateProfile(testUserId, request))
                .thenThrow(new EntityNotFoundException("User not found"));

        // When
        ResponseEntity<?> response = userController.updateProfile(testUserId, request);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertEquals("User not found", messageResponse.getMessage());
    }

    @Test
    @DisplayName("Should return 400 when validation fails")
    void testUpdateProfile_ValidationError() {
        // Given
        setupAuthentication(); // This test needs authentication
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "UpdatedFirst",
                "UpdatedLast",
                "testuser",
                "test@example.com"
        );
        when(userService.updateProfile(testUserId, request))
                .thenThrow(new IllegalArgumentException("Username is already taken"));

        // When
        ResponseEntity<?> response = userController.updateProfile(testUserId, request);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertTrue(messageResponse.getMessage().contains("Invalid input") || 
                  messageResponse.getMessage().contains("Username is already taken"));
    }

    @Test
    @DisplayName("Should return 403 when user tries to update another user's profile")
    void testUpdateProfile_UnauthorizedUser() {
        // Given
        setupAuthentication(); // This test needs authentication
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "UpdatedFirst",
                "UpdatedLast",
                "testuser",
                "test@example.com"
        );
        Long differentUserId = 999L;

        // When
        ResponseEntity<?> response = userController.updateProfile(differentUserId, request);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertTrue(messageResponse.getMessage().contains("own profile"));
        verify(userService, never()).updateProfile(anyLong(), any(ProfileUpdateRequest.class));
    }

    @Test
    @DisplayName("Should successfully change password with valid data")
    void testChangePassword_Success() {
        // Given
        setupAuthentication(); // This test needs authentication
        PasswordChangeRequest request = new PasswordChangeRequest(
                "currentPassword",
                "newPassword123"
        );
        doNothing().when(userService).changePassword(testUserId, request);

        // When
        ResponseEntity<?> response = userController.changePassword(testUserId, request);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(userService, times(1)).changePassword(testUserId, request);
    }

    @Test
    @DisplayName("Should return 401 when current password is incorrect")
    void testChangePassword_IncorrectPassword() {
        // Given
        setupAuthentication(); // This test needs authentication
        PasswordChangeRequest request = new PasswordChangeRequest(
                "wrongPassword",
                "newPassword123"
        );
        doThrow(new SecurityException("Current password is incorrect"))
                .when(userService).changePassword(testUserId, request);

        // When
        ResponseEntity<?> response = userController.changePassword(testUserId, request);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertEquals("Current password is incorrect", messageResponse.getMessage());
    }

    @Test
    @DisplayName("Should return 400 when password validation fails")
    void testChangePassword_ValidationError() {
        // Given
        setupAuthentication(); // This test needs authentication
        PasswordChangeRequest request = new PasswordChangeRequest(
                "currentPassword",
                "short" // Too short
        );
        doThrow(new IllegalArgumentException("New password must be at least 6 characters long"))
                .when(userService).changePassword(testUserId, request);

        // When
        ResponseEntity<?> response = userController.changePassword(testUserId, request);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
    }

    @Test
    @DisplayName("Should return 404 when user not found for password change")
    void testChangePassword_UserNotFound() {
        // Given
        setupAuthentication(); // This test needs authentication
        PasswordChangeRequest request = new PasswordChangeRequest(
                "currentPassword",
                "newPassword123"
        );
        doThrow(new EntityNotFoundException("User not found"))
                .when(userService).changePassword(testUserId, request);

        // When
        ResponseEntity<?> response = userController.changePassword(testUserId, request);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
    }
}

