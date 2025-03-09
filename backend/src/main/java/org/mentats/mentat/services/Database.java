package org.mentats.mentat.services;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Database {
    private static final String URL = "jdbc:mysql://mentat-math-db.cp0ek2eguzro.us-west-2.rds.amazonaws.com:3306/mentat_math_db";
    private static final String USER = "admin";
    private static final String PASSWORD = "mentat123!";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
