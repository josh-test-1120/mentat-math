package org.mentats.mentat.models;

/**
 * Login interface class
 * describes login actions for compliant objects
 */
public interface Login {
    /**
     * Authenticate against Spring Security Backend
     * @param user This is the user to authorize
     * @return Boolean representing result of function
     */
    boolean authenticate(User user);

    /**
     * Authorize against Spring Security Backend
     * @param user This is the user to authorize
     * @return Boolean representing result of function
     */
    boolean authorize(User user);

    /**
     * Logout of the Spring Security Backend
     */
    boolean logout();
}
