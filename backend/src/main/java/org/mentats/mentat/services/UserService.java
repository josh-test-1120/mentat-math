package org.mentats.mentat.services;

import jakarta.persistence.EntityNotFoundException;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.ProfileUpdateRequest;
import org.mentats.mentat.payload.request.PasswordChangeRequest;
import org.mentats.mentat.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User Service
 * Handles user profile and account management operations
 * @author Telmen Enkhtuvshin
 */
@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get user by ID
     * @param userId User ID
     * @return User entity
     * @throws EntityNotFoundException if user not found
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
    }

    /**
     * Update user profile information
     * @param userId User ID
     * @param request ProfileUpdateRequest with updated fields
     * @throws EntityNotFoundException if user not found
     * @throws IllegalArgumentException if validation fails (duplicate username/email)
     */
    @Transactional
    public User updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = getUserById(userId);

        // Check if username is being changed and if it's already taken
        if (!user.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username is already taken");
            }
        }

        // Check if email is being changed and if it's already taken
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email is already in use");
            }
        }

        // Update user fields
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Save updated user
        User updatedUser = userRepository.save(user);
        logger.info("Profile updated for user ID: {}", userId);
        return updatedUser;
    }

    /**
     * Change user password
     * @param userId User ID
     * @param request PasswordChangeRequest with current and new password
     * @throws EntityNotFoundException if user not found
     * @throws SecurityException if current password is incorrect
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = getUserById(userId);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new SecurityException("Current password is incorrect");
        }

        // Validate new password
        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        // Check if new password is the same as current password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        logger.info("Password changed for user ID: {}", userId);
    }
}

