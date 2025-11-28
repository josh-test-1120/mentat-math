package org.mentats.mentat.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.LoginRequest;
import org.mentats.mentat.payload.request.SignupRequest;
import org.mentats.mentat.payload.response.JwtResponse;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.repositories.RoleRepository;
import org.mentats.mentat.repositories.UserRepository;
import org.mentats.mentat.security.jwt.JwtUtils;
import org.mentats.mentat.security.services.UserDetailsImpl;
import org.mentats.mentat.services.AuthService;
import org.mentats.mentat.utils.TestConstants;
import org.mentats.mentat.utils.TestDataBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthController
 * Tests authentication endpoints: signin, signup, getUserByEmail
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private User testUser;
    private LoginRequest loginRequest;
    private SignupRequest signupRequest;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        testUser = TestDataBuilder.createTestUser(
                TestConstants.TEST_USER_ID,
                TestConstants.TEST_USERNAME,
                TestConstants.TEST_EMAIL,
                TestConstants.TEST_FIRST_NAME,
                TestConstants.TEST_LAST_NAME,
                TestConstants.USER_TYPE_STUDENT
        );

        loginRequest = TestDataBuilder.createLoginRequest(
                TestConstants.TEST_USERNAME,
                TestConstants.TEST_PASSWORD
        );

        signupRequest = TestDataBuilder.createSignupRequest(
                "newuser",
                "newuser@example.com",
                TestConstants.TEST_PASSWORD,
                "New",
                "User",
                TestConstants.USER_TYPE_STUDENT
        );

        // Create UserDetailsImpl with authorities
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
        userDetails = new UserDetailsImpl(
                TestConstants.TEST_USER_ID,
                TestConstants.TEST_USERNAME,
                TestConstants.TEST_EMAIL,
                TestConstants.TEST_PASSWORD_HASH,
                authorities,
                TestConstants.USER_TYPE_STUDENT,
                TestConstants.TEST_FIRST_NAME
        );
    }

    @Test
    @DisplayName("Should successfully authenticate user and return JWT")
    void testAuthenticateUser_Success() {
        // Given
        String jwtToken = "test.jwt.token";
        when(authService.authenticate(loginRequest)).thenReturn(jwtToken);
        when(authService.getUserDetails(TestConstants.TEST_USERNAME)).thenReturn(userDetails);

        // When
        ResponseEntity<JwtResponse> response = authController.authenticateUser(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        JwtResponse jwtResponse = response.getBody();
        assertEquals(jwtToken, jwtResponse.getAccessToken());
        assertEquals(TestConstants.TEST_USER_ID, jwtResponse.getId());
        assertEquals(TestConstants.TEST_USERNAME, jwtResponse.getUsername());
        assertEquals(TestConstants.TEST_EMAIL, jwtResponse.getEmail());
        assertNotNull(jwtResponse.getRoles());
        verify(authService, times(1)).authenticate(loginRequest);
        verify(authService, times(1)).getUserDetails(TestConstants.TEST_USERNAME);
    }

    @Test
    @DisplayName("Should successfully register new user")
    void testRegisterUser_Success() {
        // Given
        when(authService.createNewUser(signupRequest)).thenReturn(testUser);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        doNothing().when(authService).validateSignupRequest(signupRequest);

        // When
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertEquals("User registered successfully!", messageResponse.getMessage());
        verify(authService, times(1)).validateSignupRequest(signupRequest);
        verify(authService, times(1)).createNewUser(signupRequest);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should return user when found by email")
    void testGetUserByEmail_Success() {
        // Given
        when(authService.getUserByEmail(TestConstants.TEST_EMAIL)).thenReturn(testUser);

        // When
        ResponseEntity<User> response = authController.getUserByEmail(TestConstants.TEST_EMAIL);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        User user = response.getBody();
        assertEquals(TestConstants.TEST_USER_ID, user.getId());
        assertEquals(TestConstants.TEST_USERNAME, user.getUsername());
        assertEquals(TestConstants.TEST_EMAIL, user.getEmail());
        verify(authService, times(1)).getUserByEmail(TestConstants.TEST_EMAIL);
    }

    @Test
    @DisplayName("Should return 404 when user not found by email")
    void testGetUserByEmail_NotFound() {
        // Given
        when(authService.getUserByEmail(TestConstants.TEST_EMAIL))
                .thenThrow(new RuntimeException("User not found"));

        // When
        ResponseEntity<User> response = authController.getUserByEmail(TestConstants.TEST_EMAIL);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(authService, times(1)).getUserByEmail(TestConstants.TEST_EMAIL);
    }

    @Test
    @DisplayName("Should handle authentication failure gracefully")
    void testAuthenticateUser_AuthenticationFailure() {
        // Given
        when(authService.authenticate(loginRequest))
                .thenThrow(new RuntimeException("Authentication failed"));

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            authController.authenticateUser(loginRequest);
        });
        verify(authService, times(1)).authenticate(loginRequest);
        verify(authService, never()).getUserDetails(anyString());
    }

    @Test
    @DisplayName("Should handle signup validation failure")
    void testRegisterUser_ValidationFailure() {
        // Given
        doThrow(new IllegalArgumentException("Validation failed"))
                .when(authService).validateSignupRequest(signupRequest);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            authController.registerUser(signupRequest);
        });
        verify(authService, times(1)).validateSignupRequest(signupRequest);
        verify(authService, never()).createNewUser(any(SignupRequest.class));
        verify(userRepository, never()).save(any(User.class));
    }
}

