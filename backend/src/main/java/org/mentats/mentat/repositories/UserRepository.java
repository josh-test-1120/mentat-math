package org.mentats.mentat.repositories;

import org.mentats.mentat.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;

// Use ReactiveCrudRepository instead of JpaRepository
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    //find by email
    Optional<User> findByEmail(String email);

}