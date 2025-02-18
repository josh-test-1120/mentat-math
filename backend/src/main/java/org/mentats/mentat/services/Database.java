package org.mentats.mentat.services;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Database connector for connection handling only
 * @author Phillip Ho
 */
public class Database {
    private static final String URL = "jdbc:mysql://localhost:3306/ezmath";
    private static final String USER = "root";
    private static final String PASSWORD = "Tmysql7;";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
