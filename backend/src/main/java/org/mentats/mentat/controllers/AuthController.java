package org.mentats.mentat.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.LoginRequest;
import org.mentats.mentat.payload.request.SignupRequest;
import org.mentats.mentat.payload.response.JwtResponse;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.repositories.RoleRepository;
import org.mentats.mentat.repositories.UserRepository;
import org.mentats.mentat.security.jwt.JwtUtils;
import org.mentats.mentat.security.services.UserDetailsImpl;

/**
 * Authorization Controller
 * Methods that drive and control auth mappings
 * base URI is /api/auth
 */
@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;

    @Autowired
    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder encoder;

    @Autowired
    private final JwtUtils jwtUtils;

    private final AuthService authService;

    /**
     * Default constructor with Dependency Injection (DI)
     * for access to pipeline services
     * @param authenticationManager
     * @param userRepository
     * @param roleRepository
     * @param encoder
     * @param jwtUtils
     * @param authService
     */
    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtils,
                          AuthService authService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.authService = authService;
    }

    /**
     * Mapping for signin requests
     * @param loginRequest
     * @return JSON response (serialized user)
     */
    @PostMapping("/signin")
    //public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    public ResponseEntity<JwtResponse> authenticateUser( @RequestBody LoginRequest loginRequest) {
        String jwt = authService.authenticate(loginRequest);

        UserDetailsImpl userDetails = (UserDetailsImpl) authService.getUserDetails(loginRequest.getUsername());
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    /**
     * Mapping for signin requests
     * @param signUpRequest
     * @return JSON response (allowed empty)
     */
    @PostMapping("/signup")
    //public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    public ResponseEntity<?> registerUser( @RequestBody SignupRequest signUpRequest) {
        authService.validateSignupRequest(signUpRequest);
        System.out.println("This is the signup request");
        System.out.println(signUpRequest.getUsername());
        System.out.println(signUpRequest.getLastname());
        User user = authService.createNewUser(signUpRequest);
        userRepository.save(user);
        // Clean way to wrap text into an Entity
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    /**
     * Get user information based on email address
     * @param email
     * @return JSON response (serialized user)
     */
    @GetMapping("/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        try {
            User user = authService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get the current logged-in user's details
     * @param token HTTP request containing JWT
     * @return User details
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove 'Bearer ' prefix
            String username = jwtUtils.getUserNameFromJwtToken(jwt);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> userDetails = new HashMap<>();
            userDetails.put("id", user.getId());
            userDetails.put("username", user.getUsername());
            userDetails.put("email", user.getEmail());
            userDetails.put("role", user.getUserType());

            return ResponseEntity.ok(userDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Token");
        }
    }
}