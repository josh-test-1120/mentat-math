package org.mentats.mentat.payload.response;

import java.util.List;

/**
 * JWT Response Serialization
 * Handles managing JWT tokens, validation, and injection
 * @author Joshua Summers
 */
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private String userType;

    /**
     * Default constructor
     * @param accessToken string of the access token hash
     * @param id Long of the user ID
     * @param username string of the username
     * @param email string of the user email
     * @param roles List of String's representing the user Roles
     */
    public JwtResponse(String accessToken, Long id, String username, String email, List<String> roles,
                       String userType) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.userType =userType;
    }

    /**
     * Getter for Access Token
     * @return string of access token
     */
    public String getAccessToken() {
        return token;
    }

    /**
     * Setter for the Access Token
     * @param accessToken string of access token
     */
    public void setAccessToken(String accessToken) {
        this.token = accessToken;
    }

    /**
     * Getter for the Token Type
     * @return string of the token type
     */
    public String getTokenType() {
        return type;
    }

    /**
     * Setter for the Token Type
     * @param tokenType string of the token type
     */
    public void setTokenType(String tokenType) {
        this.type = tokenType;
    }

    /**
     * Getter for the User Token ID
     * @return Long of the User ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Setter for the User Token ID
     * @param id Long of the user ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Getter for the email
     * @return string of the user email
     */
    public String getEmail() {
        return email;
    }

    /**
     * Setter for the email
     * @param email string of the user email
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Getter for the Username
     * @return string of the username
     */
    public String getUsername() {
        return username;
    }

    /**
     * Setter for the Username
     * @param username string of the username
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Getter for the Roles
     * @return List of String's representing the user Roles
     */
    public List<String> getRoles() {
        return roles;
    }

    /**
     * Getter for the User type
     * @return String User Type
     */
    public String getUserType() { return userType;}

    /**
     * Setter for User type
     * @param userType String type userType
     */
    public void setUserType(String userType) { this.userType = userType;}

}