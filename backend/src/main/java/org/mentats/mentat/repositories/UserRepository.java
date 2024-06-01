package org.mentats.mentat.repositories;

import org.mentats.mentat.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Uses JPA repository for data access abstraction
 * Based on User Entity
 *
 * @see org.springframework.data.jpa.repository.JpaRepository
 * @see https://spring.io/guides/gs/accessing-data-jpa
 * @author Joshua Summers
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Find the User by the username
     * @param username string of the username
     * @return Optional or User object
     */
    Optional<User> findByUsername(String username);

    /**
     * Check to see if username already exists
     * @param username string of the username
     * @return boolean of the check
     */
    Boolean existsByUsername(String username);

    /**
     * Check to see if email already exists
     * @param email string of email
     * @return boolean of the check
     */
    Boolean existsByEmail(String email);

    /**
     * Find the user by email address
     * @param email string of email
     * @return Optional or User object
     */
    Optional<User> findByEmail(String email);
}