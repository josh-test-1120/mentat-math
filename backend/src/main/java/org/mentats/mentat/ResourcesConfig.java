package org.mentats.mentat;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Used to adjust the static content directories for our app builds.
 * Existing directories were preserved from spring boot configuration
 */
@Configuration
public class ResourcesConfig implements WebMvcConfigurer
{
    private static final String[] CLASSPATH_RESOURCE_LOCATIONS =
            {
                    "classpath:/META-INF/resources/",
                    "classpath:/resources/",
                    "classpath:/static/",
                    "classpath:/public/",
                    "classpath:/custom/",
                    "classpath:/app/out/"
            };

    /**
     * This is the function to add the new Resource Handler to the pipeline
     * https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-config/static-resources.html
     * @param registry This is registry to act on
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry)
    {
        registry.addResourceHandler("/**")
                .addResourceLocations(CLASSPATH_RESOURCE_LOCATIONS)
                .setCachePeriod(3000);
    }
}
