package org.mentats.mentat.models;

import java.util.Date;

public interface Login {
    /**
     * Authenticate against Spring Security Backend
     * @param user
     * @return Boolean representing result of function
     */
    public boolean authenticate(User user);

    /**
     * Authorize against Spring Security Backend
     * @param user
     * @return Boolean representing result of function
     */
    public boolean authorize(User user);

    /**
     * Logout of the Spring Security Backend
     */
    public boolean logout();
}
