package org.mentats.mentat.services;

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
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.repositories.RoleRepository;
import org.mentats.mentat.repositories.UserRepository;
import org.mentats.mentat.security.jwt.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService
 * Tests authentication and user creation operations
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private SignupRequest signupRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");

        signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstname("New");
        signupRequest.setLastname("User");
        signupRequest.setUserType("STUDENT");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");
    }

    @Test
    @DisplayName("Should successfully authenticate user with valid credentials")
    void testAuthenticate_Success() {
        // Given
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("test-jwt-token");

        // When
        String token = authService.authenticate(loginRequest);

        // Then
        assertNotNull(token);
        assertEquals("test-jwt-token", token);
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, times(1)).generateJwtToken(authentication);
    }

    @Test
    @DisplayName("Should successfully get user details by username")
    void testGetUserDetails_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When
        var userDetails = authService.getUserDetails("testuser");

        // Then
        assertNotNull(userDetails);
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when user not found")
    void testGetUserDetails_NotFound() {
        // Given
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(UsernameNotFoundException.class, () -> {
            authService.getUserDetails("nonexistent");
        });
        verify(userRepository, times(1)).findByUsername("nonexistent");
    }

    @Test
    @DisplayName("Should successfully get user by email")
    void testGetUserByEmail_Success() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        User result = authService.getUserByEmail("test@example.com");

        // Then
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository, times(1)).findByEmail("test@example.com");
    }

    @Test
    @DisplayName("Should throw UsernameNotFoundException when email not found")
    void testGetUserByEmail_NotFound() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(UsernameNotFoundException.class, () -> {
            authService.getUserByEmail("nonexistent@example.com");
        });
        verify(userRepository, times(1)).findByEmail("nonexistent@example.com");
    }

    @Test
    @DisplayName("Should successfully validate signup request with unique username and email")
    void testValidateSignupRequest_Success() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        // When & Then - should not throw exception
        assertDoesNotThrow(() -> {
            authService.validateSignupRequest(signupRequest);
        });
        verify(userRepository, times(1)).existsByUsername("newuser");
        verify(userRepository, times(1)).existsByEmail("newuser@example.com");
    }

    @Test
    @DisplayName("Should throw Error when username is already taken")
    void testValidateSignupRequest_UsernameTaken() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        // When & Then
        assertThrows(Error.class, () -> {
            authService.validateSignupRequest(signupRequest);
        });
        verify(userRepository, times(1)).existsByUsername("newuser");
        verify(userRepository, never()).existsByEmail(anyString());
    }

    @Test
    @DisplayName("Should throw Error when email is already in use")
    void testValidateSignupRequest_EmailInUse() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(true);

        // When & Then
        assertThrows(Error.class, () -> {
            authService.validateSignupRequest(signupRequest);
        });
        verify(userRepository, times(1)).existsByUsername("newuser");
        verify(userRepository, times(1)).existsByEmail("newuser@example.com");
    }

    @Test
    @DisplayName("Should successfully create new user with valid data")
    void testCreateNewUser_Success() {
        // Given
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        // When
        User result = authService.createNewUser(signupRequest);

        // Then
        assertNotNull(result);
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when username is blank")
    void testCreateNewUser_BlankUsername() {
        // Given
        signupRequest.setUsername("   "); // Blank username

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            authService.createNewUser(signupRequest);
        });
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when username is null")
    void testCreateNewUser_NullUsername() {
        // Given
        signupRequest.setUsername(null);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            authService.createNewUser(signupRequest);
        });
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should correctly identify blank strings")
    void testIsBlank() {
        assertTrue(AuthService.isBlank(null));
        assertTrue(AuthService.isBlank(""));
        assertTrue(AuthService.isBlank("   "));
        assertFalse(AuthService.isBlank("not blank"));
        assertFalse(AuthService.isBlank("  not blank  "));
    }
}

