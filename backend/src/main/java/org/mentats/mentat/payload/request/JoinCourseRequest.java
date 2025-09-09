// src/main/java/org/mentats/mentat/payload/request/JoinCourseRequest.java
package org.mentats.mentat.payload.request;

import jakarta.validation.constraints.NotBlank;

public class JoinCourseRequest {
    @NotBlank
    private String studentId;

    @NotBlank
    private String courseId;

    public String getStudentId() {
        System.out.println("JoinCourseRequest.getUserId() called, returning: '" + studentId + "'");
        return studentId; 
    }
    public String getCourseId() {
        System.out.println("JoinCourseRequest.getCourseId() called, returning: '" + courseId + "'");
        return courseId; 
    }

    public void setStudentId(String studentId) {
        System.out.println("JoinCourseRequest.setStudentId() called with: '" + studentId + "'");
        this.studentId = studentId; 
    }
    public void setCourseId(String courseId) { 
        System.out.println("JoinCourseRequest.setCourseId() called with: '" + courseId + "'");
        this.courseId = courseId; 
    }
}