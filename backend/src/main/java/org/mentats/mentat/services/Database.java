package org.mentats.mentat.services;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Database connector for connection handling only
 * @author Phillip Ho
 */
@Component
public class Database {
    // Variables for the static functions
    private static String URL;
    private static String USER;
    private static String PASSWORD;

    // Environmental variable loading
    @Value("${DB_URL}")
    private String URL_ENV;

    @Value("${DB_USER}")
    private String USER_ENV;

    @Value("${DB_PASSWORD}")
    private String PASSWORD_ENV;

    /**
     * Runs after the dependency injection to hydrate
     * the static parameters
     */
    @PostConstruct
    public void init() {
        URL = URL_ENV;
        USER = USER_ENV;
        PASSWORD = PASSWORD_ENV;
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
