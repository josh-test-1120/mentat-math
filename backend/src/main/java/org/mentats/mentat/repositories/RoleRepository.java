package org.mentats.mentat.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.mentats.mentat.models.ERole;
import org.mentats.mentat.models.Role;

/**
 * Uses JPA repository for data access abstraction
 * Based on Role and ERole Entity
 *
 * @see org.springframework.data.jpa.repository.JpaRepository
 * @see https://spring.io/guides/gs/accessing-data-jpa
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(ERole name);
}
