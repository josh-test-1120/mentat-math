package org.mentats.mentat.services;

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
import org.mentats.mentat.repositories.UserRepository;
import org.mentats.mentat.utils.TestConstants;
import org.mentats.mentat.utils.TestDataBuilder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService
 * Tests user profile and password management operations
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Long testUserId;

    @BeforeEach
    void setUp() {
        // Use TestDataBuilder for consistent test data creation
        testUserId = TestConstants.TEST_USER_ID;
        testUser = TestDataBuilder.createTestUser(
                testUserId,
                TestConstants.TEST_USERNAME,
                TestConstants.TEST_EMAIL,
                TestConstants.TEST_FIRST_NAME,
                TestConstants.TEST_LAST_NAME,
                TestConstants.USER_TYPE_STUDENT
        );
    }

    @Test
    @DisplayName("Should successfully get user by ID")
    void testGetUserById_Success() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // When
        User result = userService.getUserById(testUserId);

        // Then
        assertNotNull(result);
        assertEquals(testUserId, result.getId());
        assertEquals("testuser", result.getUsername());
        verify(userRepository, times(1)).findById(testUserId);
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when user not found")
    void testGetUserById_NotFound() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, () -> {
            userService.getUserById(testUserId);
        });
        verify(userRepository, times(1)).findById(testUserId);
    }

    @Test
    @DisplayName("Should successfully update profile with valid data")
    void testUpdateProfile_Success() {
        // Given
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "UpdatedFirst",
                "UpdatedLast",
                "testuser", // Same username
                "test@example.com" // Same email
        );
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.updateProfile(testUserId, request);

        // Then
        assertNotNull(result);
        verify(userRepository, times(1)).findById(testUserId);
        verify(userRepository, times(1)).save(any(User.class));
        verify(userRepository, never()).existsByUsername(anyString());
        verify(userRepository, never()).existsByEmail(anyString());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when username is already taken")
    void testUpdateProfile_UsernameTaken() {
        // Given
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "UpdatedFirst",
                "UpdatedLast",
                "newusername", // Different username
                "test@example.com"
        );
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("newusername")).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            userService.updateProfile(testUserId, request);
        });
        verify(userRepository, times(1)).existsByUsername("newusername");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when email is already in use")
    void testUpdateProfile_EmailInUse() {
        // Given
        ProfileUpdateRequest request = new ProfileUpdateRequest(
                "UpdatedFirst",
                "UpdatedLast",
                "testuser",
                "newemail@example.com" // Different email
        );
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByEmail("newemail@example.com")).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            userService.updateProfile(testUserId, request);
        });
        verify(userRepository, times(1)).existsByEmail("newemail@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully change password with valid current password")
    void testChangePassword_Success() {
        // Given
        PasswordChangeRequest request = new PasswordChangeRequest(
                "currentPassword",
                "newPassword123"
        );
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        // Use anyString() for password hash since we can't guarantee exact reference
        when(passwordEncoder.matches(eq("currentPassword"), anyString())).thenReturn(true);
        when(passwordEncoder.matches(eq("newPassword123"), anyString())).thenReturn(false);
        when(passwordEncoder.encode("newPassword123")).thenReturn("$2a$10$newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.changePassword(testUserId, request);

        // Then
        // Verify getUserById was called (which calls findById internally)
        verify(userRepository, times(1)).findById(testUserId);
        // Verify password checks
        verify(passwordEncoder, times(1)).matches(eq("currentPassword"), anyString());
        verify(passwordEncoder, times(1)).matches(eq("newPassword123"), anyString());
        verify(passwordEncoder, times(1)).encode("newPassword123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw SecurityException when current password is incorrect")
    void testChangePassword_IncorrectCurrentPassword() {
        // Given
        PasswordChangeRequest request = new PasswordChangeRequest(
                "wrongPassword",
                "newPassword123"
        );
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", testUser.getPassword())).thenReturn(false);

        // When & Then
        assertThrows(SecurityException.class, () -> {
            userService.changePassword(testUserId, request);
        });
        verify(passwordEncoder, times(1)).matches("wrongPassword", testUser.getPassword());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when new password is too short")
    void testChangePassword_PasswordTooShort() {
        // Given
        PasswordChangeRequest request = new PasswordChangeRequest(
                "currentPassword",
                "short" // Less than 6 characters
        );
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", testUser.getPassword())).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            userService.changePassword(testUserId, request);
        });
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when new password is same as current")
    void testChangePassword_SamePassword() {
        // Given
        PasswordChangeRequest request = new PasswordChangeRequest(
                "currentPassword",
                "currentPassword"
        );
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.matches("currentPassword", testUser.getPassword())).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            userService.changePassword(testUserId, request);
        });
        verify(userRepository, never()).save(any(User.class));
    }
}

