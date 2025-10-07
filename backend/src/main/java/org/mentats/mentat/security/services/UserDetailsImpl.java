package org.mentats.mentat.security.services;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import org.mentats.mentat.models.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * User Details Implementation of User Details from
 * Spring Security
 */
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;

    private String username;

    private String email;

    private String firstName;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    private String userType;

    /**
     * Default constructor
     * @param id Long o user ID
     * @param username string of username
     * @param email string of email
     * @param password string of password
     * @param authorities Collection of objects extended from GrantedAuthority
     */
    public UserDetailsImpl(Long id, String username, String email, String password,
                           Collection<? extends GrantedAuthority> authorities,
                           String userType, String firstName) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.userType = userType;
        this.firstName = firstName;
    }

    /**
     * Builds the User Implementation Authority
     * Static class that makes an instance
     * @param user User object
     * @return UserDetailsImpl
     */
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                user.getUserType(),
                user.getFirstName());
    }

    /**
     * Override the get authorities Getter
     * @return Collection of objects extended from GrantedAuthority
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    /**
     * Getter for the user ID
     * @return Long of user ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Getter of the User email
     * @return string of the email
     */
    public String getEmail() {
        return email;
    }

    /**
     * Override the default Password Getter
     * @return string of password
     */
    @Override
    public String getPassword() {
        return password;
    }

    /**
     * Override the default Username Getter
     * @return string of username
     */
    @Override
    public String getUsername() {
        return username;
    }

    /**
     * Override the default FirstName Getter
     * @return string of firstName
     */
    public String getName() {
        return firstName;
    }

    /**
     * Override the default Username Getter
     * @return string of username
     */
    public String getUserType() {
        return userType;
    }

    /**
     * Checks to see if account has expired
     * @return boolean of the check
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Checks to see if the account is locked
     * @return boolean of the check
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Checks to see if the credential are expired
     * @return boolean of that check
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Check to see if the account is enabled
     * @return boolean of the check
     */
    @Override
    public boolean isEnabled() {
        return true;
    }

    /**
     * Overide the default equals method
     * @param o other Object
     * @return boolean of equals on the ID
     */
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}