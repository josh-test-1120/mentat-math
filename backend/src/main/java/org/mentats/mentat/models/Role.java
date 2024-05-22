package org.mentats.mentat.models;

import jakarta.persistence.*;

/**
 * This is the User model to represent users
 */

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ERole name;

    /**
     * Empty constructor
     * Lazy reference
     */
    public Role() {

    }

    /**
     * Default Constructor
     */
    public Role(ERole name) {
        this.name = name;
    }

    /**
     * Getter for the role id
     * @return id
     */
    public Long getId() {
        return id;
    }

    /**
     * Setter for the role id
     * @param id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Getter for the role name
     * @return name
     */
    public ERole getName() {
        return name;
    }

    /**
     * Setter for the role name
     * @param name
     */
    public void setName(ERole name) {
        this.name = name;
    }
}