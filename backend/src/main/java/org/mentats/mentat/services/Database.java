package org.mentats.mentat.services;

import org.springframework.beans.factory.annotation.Value;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Database connector for connection handling only
 * @author Phillip Ho
 */
public class Database {
    @Value("${DB_URL}")
    private static String URL;

    @Value("${DB_USER}")
    private static String USER;

    @Value("${DB_PASSWORD}")
    private static String PASSWORD;

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
