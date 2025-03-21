package org.mentats.mentat.security.jwt;

import org.mentats.mentat.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;
import io.jsonwebtoken.*;

/**
 * Component for JWT Utilities
 * @author Joshua Summers
 */
@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${saas.app.jwtSecret}")
    private String secret;

    @Value("${saas.app.jwtExpirationMs}")
    private int expiration;

    /**
     * Generate claims for JWT
     * @param authentication
     * @return Claim Map
     */
    private Claims generateClaims(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        Claims claims = Jwts.claims().setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration)).build();

        claims.put("id", userPrincipal.getId()); // Add User ID
        claims.put("email", userPrincipal.getEmail()); // Add Email
        claims.put("role", userPrincipal.getAuthorities()); // Add Role

        return claims;
    }

    /**
     * Sign the claims with the has key
     * @param claims
     * @return signed string
     */
    private String signClaims(Claims claims) {
        return Jwts.builder()
                .setClaims(claims)
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }

    /**
     * Generate the JWT
     * @param authentication
     * @return string of the signed token
     */
    public String generateJwtToken(Authentication authentication) {
        Claims claims = generateClaims(authentication);
        return signClaims(claims);
    }

    /**
     * Ensure token is signed properly
     * @param token
     * @return true or false based on validity
     */
    private boolean isValidJwtToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * General validate function
     * @param token
     * @return true or false based on validity
     * @see org.mentats.mentat.security.jwt.JwtUtils.isValidJwtToken function
     */
    public boolean validateJwtToken(String token) {
        return isValidJwtToken(token);
    }

    /**
     * Get the claim from the token
     * @param token
     * @param claimName
     * @return string of claim
     */
    private Object getClaim(String token, String claimName) {
        return Jwts.parser()
                .setSigningKey(secret)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get(claimName, Object.class);
    }

    /**
     * Gets the username from the token
     * @param jwt
     * @return username
     */
    public String getUserNameFromJwtToken(String jwt) {
        return getClaim(jwt, "sub").toString();
    }

    /**
     * Gets the userID from the token
     * @param jwt
     * @return ID
     */
    public Long getUserIdFromJwtToken(String jwt) {
        return Long.valueOf(getClaim(jwt, "id").toString());
    }

    /**
     * Gets the user email from the token
     * @param jwt
     * @return user email
     */
    public String getEmailFromJwtToken(String jwt) {
        return getClaim(jwt, "email").toString();
    }

    /**
     * Gets the user role from the token
     * @param jwt
     * @return user role
     */
    public String getUserRoleFromJwtToken(String jwt) {
        return getClaim(jwt, "role").toString();
    }
}