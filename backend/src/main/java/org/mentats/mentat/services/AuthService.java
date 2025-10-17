package org.mentats.mentat.services;

import org.mentats.mentat.models.ERole;
import org.mentats.mentat.models.Role;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.LoginRequest;
import org.mentats.mentat.payload.request.SignupRequest;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.repositories.RoleRepository;
import org.mentats.mentat.repositories.UserRepository;
import org.mentats.mentat.security.jwt.JwtUtils;
import org.mentats.mentat.security.services.UserDetailsImpl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import javax.management.relation.RoleNotFoundException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Authorization Service for interacting with the
 * Various repositories needed for authenticating
 * users
 * @author Joshua Summers
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final CourseRepository courseRepository;

    /**
     * Default constructor using Dependency Injection (DI)
     * @param userRepository UserRepository
     * @param roleRepository RoleRepository
     * @param encoder PasswordEncoder
     * @param jwtUtils JwtUtils
     * @param authenticationManager AuthenticationManager
     */
    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder encoder,
                       JwtUtils jwtUtils,
                       AuthenticationManager authenticationManager,
                       CourseRepository courseRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.courseRepository = courseRepository;
    }

    /**
     * Authenticate method
     * @param loginRequest LoginRequest
     * @return string of the token
     */
    public String authenticate(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtUtils.generateJwtToken(authentication);
    }

    /**
     * Get the User Details
     * @param username string of the username
     * @return UserDetailsImpl
     */
    public UserDetailsImpl getUserDetails(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));
        return UserDetailsImpl.build(user);
    }

    /**
     * Validator for the SignUp Request serializer
     * @param signUpRequest SignupRequest
     */
    public void validateSignupRequest(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new Error("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new Error("Error: Email is already in use!");
        }
    }

    /**
     * Gets the user by email
     * @param email string of the email
     * @return User object
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));
    }

    /**
     * Checks to see if the str is empty
     * formats the return automatically
     * @param str string
     * @return boolean of check
     */
    public static boolean isBlank(String str) {
        return str == null || str.isEmpty() || str.trim().isEmpty();
    }

    /**
     * Create new user method
     * Validator and JPA injector
     * @param signUpRequest SignupRequest
     * @return User object
     */
    public User createNewUser(SignupRequest signUpRequest) {
        // Validate input data (example)
        if (isBlank(signUpRequest.getUsername())) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (signUpRequest.getUsername() == null || signUpRequest.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }

        // All looks good, now create a new user object
        User user = new User(
                signUpRequest.getFirstname(),
                signUpRequest.getLastname(),
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getUserType(),
                encoder.encode(signUpRequest.getPassword())
        );

//        Set<Role> roles = new HashSet<>(); // Initialize roles as an empty set
//
//        // Check if getRole() returns null before proceeding
//        if (signUpRequest.getRole() != null) {
//            // Map string roles to ERole values
//            Map<String, ERole> roleMap = Map.of(
//                    "admin", ERole.ROLE_ADMIN,
//                    "mod", ERole.ROLE_MODERATOR,
//                    // Default role
//                    "", ERole.ROLE_USER
//            );
//
//            // Get roles from request and map to ERole
//            roles = signUpRequest.getRole().stream()
//                    .map(roleName -> {
//                        try {
//                            return roleRepository.findByName(roleMap.getOrDefault(roleName, ERole.ROLE_USER))
//                                    .orElseThrow(() -> new RoleNotFoundException("Role not found: " + roleName));
//                        } catch (RoleNotFoundException e) {
//                            throw new RuntimeException(e);
//                        }
//                    })
//                    .collect(Collectors.toSet());
//        } // End of null check for getRole()

//        user.setRoles(roles);

        // Save the user into the database through the JPA
        return userRepository.save(user);
    }
}
