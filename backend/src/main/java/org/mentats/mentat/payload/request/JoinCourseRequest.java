// src/main/java/org/mentats/mentat/payload/request/JoinCourseRequest.java
package org.mentats.mentat.payload.request;

import jakarta.validation.constraints.NotBlank;

public class JoinCourseRequest {
    @NotBlank
    private String userId;

    @NotBlank
    private String courseId;

    public String getUserId() { return userId; }
    public String getCourseId() { return courseId; }
}