package org.mentats.mentat.security;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * MVC CORS configuration for session handling of Cross Origin Request Scripting
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Default bean for configuration
     * Separate URI calls are defined to avoid grouping auth calls
     * into this CORS space
     *
     * @return void
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Mapping for api calls
                registry.addMapping("/api/**")
                        .allowedOriginPatterns("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
                // Mapping for legacy course URI
                registry.addMapping("/course/**")
                        .allowedOriginPatterns("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
                // Mapping for exams
            }
        };
    }
}