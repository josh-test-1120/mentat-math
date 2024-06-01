package org.mentats.mentat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main server startup class
 * Manages the Spring Server
 */
@SpringBootApplication
public class EZMathApplication {

	public static void main(String[] args) {
		SpringApplication.run(EZMathApplication.class, args);
	}

}
