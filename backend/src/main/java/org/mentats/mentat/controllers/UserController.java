package org.mentats.mentat.controllers;

import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.PasswordChangeRequest;
import org.mentats.mentat.payload.request.ProfileUpdateRequest;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.payload.response.PasswordChangeResponse;
import org.mentats.mentat.payload.response.ProfileUpdateResponse;
import org.mentats.mentat.payload.response.UserResponse;
import org.mentats.mentat.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

/**
 * User Controller
 * Handles user profile and account management operations
 * Base URI: /api/user
 * @author Telmen Enkhtuvshin
 */
@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/user")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    /**
     * Get user profile by ID
     * @param userId User ID
     * @return UserResponse with user information
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(new UserResponse(user));
        } catch (Exception e) {
            logger.error("Error fetching user profile: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get user by ID (alternative endpoint matching AuthController pattern)
     * @param userId User ID
     * @return UserResponse with user information
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(new UserResponse(user));
        } catch (Exception e) {
            logger.error("Error fetching user: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update user profile information
     * @param userId User ID
     * @param request ProfileUpdateRequest with updated fields
     * @return ProfileUpdateResponse with updated user information
     */
    @PatchMapping("/profile/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId,
                                           @Valid @RequestBody ProfileUpdateRequest request) {
        try {
            // Check if user is updating their own profile or is an admin
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("Authentication required"));
            }

            // Get the authenticated user's ID from UserDetailsImpl
            Object principal = authentication.getPrincipal();
            Long authenticatedUserId = null;

            if (principal instanceof org.mentats.mentat.security.services.UserDetailsImpl) {
                org.mentats.mentat.security.services.UserDetailsImpl userDetails = 
                        (org.mentats.mentat.security.services.UserDetailsImpl) principal;
                authenticatedUserId = userDetails.getId();
            }

            // Users can only update their own profile
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("You can only update your own profile"));
            }

            User updatedUser = userService.updateProfile(userId, request);
            ProfileUpdateResponse response = new ProfileUpdateResponse(
                    "Profile updated successfully",
                    new UserResponse(updatedUser)
            );
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            logger.error("User not found updating profile: {}", e.getMessage());
            return ResponseEntity.status(404)
                    .body(new MessageResponse("User not found"));
        } catch (IllegalArgumentException e) {
            logger.error("Validation error updating profile: {}", e.getMessage());
            // Return error response if validation error occurs
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid input: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating profile: {}", e.getMessage());
            // Return error response
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    /**
     * Change user password
     * @param userId User ID
     * @param request PasswordChangeRequest with current and new password
     * @return PasswordChangeResponse indicating success
     */
    @PatchMapping("/password/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@PathVariable Long userId,
                                            @Valid @RequestBody PasswordChangeRequest request) {
        try {
            // Check if user is changing their own password or is an admin
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(new MessageResponse("Authentication required"));
            }

            // Get the authenticated user's ID from UserDetailsImpl
            Object principal = authentication.getPrincipal();
            Long authenticatedUserId = null;

            if (principal instanceof org.mentats.mentat.security.services.UserDetailsImpl) {
                org.mentats.mentat.security.services.UserDetailsImpl userDetails = 
                        (org.mentats.mentat.security.services.UserDetailsImpl) principal;
                authenticatedUserId = userDetails.getId();
            }

            // Users can only change their own password
            if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("You can only change your own password"));
            }

            userService.changePassword(userId, request);
            PasswordChangeResponse response = new PasswordChangeResponse(
                    "Password changed successfully",
                    userId,
                    java.time.Instant.now()
            );
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            logger.error("User not found changing password: {}", e.getMessage());
            return ResponseEntity.status(404)
                    .body(new MessageResponse("User not found"));
        } catch (IllegalArgumentException e) {
            logger.error("Validation error changing password: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid input: " + e.getMessage()));
        } catch (SecurityException e) {
            logger.error("Security error changing password: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Current password is incorrect"));
        } catch (Exception e) {
            logger.error("Error changing password: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new MessageResponse("Failed to change password: " + e.getMessage()));
        }
    }
}

