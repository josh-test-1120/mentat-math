package org.mentats.mentat.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mentats.mentat.exceptions.CourseNotFoundException;
import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.payload.request.StudentCourseRequest;
import org.mentats.mentat.payload.response.CourseResponse;
import org.mentats.mentat.payload.response.MessageResponse;
import org.mentats.mentat.payload.response.StudentCourseResponse;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.services.CourseService;
import org.mentats.mentat.services.StudentCourseService;
import org.mentats.mentat.utils.TestConstants;
import org.mentats.mentat.utils.TestDataBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CourseController
 * Tests API endpoint request/response handling for course operations
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CourseController Tests")
class CourseControllerTest {

    @Mock
    private CourseService courseService;

    @Mock
    private StudentCourseService studentCourseService;

    @Mock
    private CourseRepository courseRepository;

    private CourseController courseController;

    private Course testCourse;
    private CourseRequest courseRequest;
    private CourseResponse courseResponse;
    private User testInstructor;

    @BeforeEach
    void setUp() {
        // Manually create controller with constructor injection
        courseController = new CourseController(courseRepository);
        
        // Manually inject @Autowired fields using reflection
        try {
            // Inject courseService
            java.lang.reflect.Field courseServiceField = CourseController.class.getDeclaredField("courseService");
            // Set the field accessible
            courseServiceField.setAccessible(true);
            // Set the field to the mock courseService
            courseServiceField.set(courseController, courseService);
            
            // Inject studentCourseService
            java.lang.reflect.Field studentCourseServiceField = CourseController.class.getDeclaredField("studentCourseService");
            // Set the field accessible
            studentCourseServiceField.setAccessible(true);
            // Set the field to the mock studentCourseService
            studentCourseServiceField.set(courseController, studentCourseService);
        } catch (Exception e) {
            // Throw exception if failed to inject mocks into controller
            throw new RuntimeException("Failed to inject mocks into controller", e);
        }
        
        testInstructor = TestDataBuilder.createTestUser(
                TestConstants.TEST_USER_ID,
                "instructor",
                "instructor@example.com",
                "Instructor",
                "User",
                TestConstants.USER_TYPE_INSTRUCTOR
        );

        testCourse = TestDataBuilder.createTestCourse(
                TestConstants.TEST_COURSE_ID,
                TestConstants.TEST_COURSE_NAME,
                testInstructor
        );

        courseRequest = TestDataBuilder.createCourseRequest();

        courseResponse = new CourseResponse(testCourse);
    }

    @Test
    @DisplayName("Should successfully create course")
    void testCreateCourse_Success() {
        // Given
        when(courseService.createCourse(courseRequest)).thenReturn(courseResponse);

        // When
        ResponseEntity<?> response = courseController.createCourse(courseRequest);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertEquals("Course created successfully", messageResponse.getMessage());
        verify(courseService, times(1)).createCourse(courseRequest);
    }

    @Test
    @DisplayName("Should return 500 when course creation fails")
    void testCreateCourse_Failure() {
        // Given
        when(courseService.createCourse(courseRequest))
                .thenThrow(new RuntimeException("Database error"));

        // When
        ResponseEntity<?> response = courseController.createCourse(courseRequest);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        // ResponseEntity.internalServerError().build() returns null body
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof MessageResponse);
        // Get the message response body
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        // Check if the message contains "Error creating course"
        assertTrue(messageResponse.getMessage().contains("Error creating course"));
        // Verify that the courseService.createCourse method was called exactly once
        verify(courseService, times(1)).createCourse(courseRequest);
    }

    @Test
    @DisplayName("Should successfully get courses by professor ID")
    void testListCourses_Success() {
        // Given
        List<CourseResponse> courses = Arrays.asList(courseResponse);
        when(courseService.getCoursesByProfessorId(TestConstants.TEST_USER_ID))
                .thenReturn(courses);

        // When
        ResponseEntity<?> response = courseController.listCourses(TestConstants.TEST_USER_ID.toString());

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        verify(courseService, times(1)).getCoursesByProfessorId(TestConstants.TEST_USER_ID);
    }

    @Test
    @DisplayName("Should return 404 when no courses found for professor")
    void testListCourses_Empty() {
        // Given
        when(courseService.getCoursesByProfessorId(TestConstants.TEST_USER_ID))
                .thenReturn(Collections.emptyList());

        // When
        ResponseEntity<?> response = courseController.listCourses(TestConstants.TEST_USER_ID.toString());

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // ResponseEntity.notFound().build() returns null body
        assertNull(response.getBody());
        verify(courseService, times(1)).getCoursesByProfessorId(TestConstants.TEST_USER_ID);
    }

    @Test
    @DisplayName("Should successfully get course by ID")
    void testGetCourse_Success() {
        // Given
        when(courseService.getCourseById(TestConstants.TEST_COURSE_ID)).thenReturn(testCourse);

        // When
        ResponseEntity<CourseResponse> response = courseController.getCourse(TestConstants.TEST_COURSE_ID);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        CourseResponse result = response.getBody();
        assertEquals(TestConstants.TEST_COURSE_ID, result.getCourseId());
        assertEquals(TestConstants.TEST_COURSE_NAME, result.getCourseName());
        verify(courseService, times(1)).getCourseById(TestConstants.TEST_COURSE_ID);
    }

    // Should handle exception when getting course by ID
    @Test
    @DisplayName("Should handle exception when getting course by ID")
    void testGetCourse_NotFound() {
        // Given
        when(courseService.getCourseById(TestConstants.NON_EXISTENT_COURSE_ID))
                .thenThrow(new CourseNotFoundException("Course not found"));

        // When & Then - Controller doesn't handle exceptions, so it will throw
        assertThrows(CourseNotFoundException.class, () -> {
            courseController.getCourse(TestConstants.NON_EXISTENT_COURSE_ID);
        });
        verify(courseService, times(1)).getCourseById(TestConstants.NON_EXISTENT_COURSE_ID);
    }

    @Test
    @DisplayName("Should successfully update course")
    void testUpdateCourse_Success() {
        // Given
        CourseRequest updateRequest = TestDataBuilder.createCourseRequest();
        updateRequest.setCourseName("Updated Course");
        when(courseService.updateCourse(TestConstants.TEST_COURSE_ID, updateRequest))
                .thenReturn(testCourse);

        // When
        ResponseEntity<?> response = courseController.updateCourse(updateRequest, TestConstants.TEST_COURSE_ID);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // ResponseEntity.ok().build() has no body
        assertNotNull(response.getBody());
        // Get the course response body
        assertTrue(response.getBody() instanceof CourseResponse);
        // Get the course response body
        CourseResponse result = (CourseResponse) response.getBody();
        assertNotNull(result);
        // Verify that the courseService.updateCourse method was called exactly once
        verify(courseService, times(1)).updateCourse(TestConstants.TEST_COURSE_ID, updateRequest);
    }

    @Test
    @DisplayName("Should successfully delete course")
    void testDeleteCourse_Success() {
        // Given
        doNothing().when(courseService).deleteCourse(TestConstants.TEST_COURSE_ID);

        // When
        ResponseEntity<?> response = courseController.deleteCourse(TestConstants.TEST_COURSE_ID);

        // Then
        assertNotNull(response);
        // ResponseEntity.ok().build() has no body
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // ResponseEntity.ok().build() returns null body
        assertNull(response.getBody());
        // Verify that the courseService.deleteCourse method was called exactly once
        verify(courseService, times(1)).deleteCourse(TestConstants.TEST_COURSE_ID);
    }

    @Test
    @DisplayName("Should return 404 when deleting non-existent course")
    void testDeleteCourse_NotFound() {
        // Given
        doThrow(new CourseNotFoundException("Course not found"))
                .when(courseService).deleteCourse(TestConstants.NON_EXISTENT_COURSE_ID);

        // When
        ResponseEntity<?> response = courseController.deleteCourse(TestConstants.NON_EXISTENT_COURSE_ID);

        // Then
        assertNotNull(response);
        // ResponseEntity.notFound().build() returns null body
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // Controller returns String body, not MessageResponse
        assertTrue(response.getBody() instanceof String);
        // Get the string body
        String body = (String) response.getBody();
        assertTrue(body.contains("Course not found"));
        // Verify that the courseService.deleteCourse method was called exactly once
        verify(courseService, times(1)).deleteCourse(TestConstants.NON_EXISTENT_COURSE_ID);
    }

    @Test
    @DisplayName("Should successfully join course")
    void testJoinCourse_Success() {
        // Given
        StudentCourseRequest studentCourseRequest = new StudentCourseRequest();
        studentCourseRequest.setStudentId(TestConstants.TEST_USER_ID);
        studentCourseRequest.setCourseId(TestConstants.TEST_COURSE_ID);

        StudentCourseResponse studentCourseResponse = new StudentCourseResponse(
                TestConstants.TEST_COURSE_ID,
                TestConstants.TEST_USER_ID,
                null,
                null
        );

        when(studentCourseService.joinCourse(studentCourseRequest))
                .thenReturn(studentCourseResponse);

        // When
        ResponseEntity<?> response = courseController.joinCourse(studentCourseRequest);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof MessageResponse);
        verify(studentCourseService, times(1)).joinCourse(studentCourseRequest);
    }

    @Test
    @DisplayName("Should successfully get enrolled courses for student")
    void testGetEnrolledCourses_Success() {
        // Given
        List<CourseResponse> courses = Arrays.asList(courseResponse);
        when(studentCourseService.getEnrolledCourses(TestConstants.TEST_USER_ID))
                .thenReturn(courses);

        // When
        ResponseEntity<?> response = courseController.getEnrolledCourses(TestConstants.TEST_USER_ID);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        @SuppressWarnings("unchecked")
        List<CourseResponse> body = (List<CourseResponse>) response.getBody();
        assertEquals(1, body.size());
        verify(studentCourseService, times(1)).getEnrolledCourses(TestConstants.TEST_USER_ID);
    }

    @Test
    @DisplayName("Should return 404 when student has no enrolled courses")
    void testGetEnrolledCourses_Empty() {
        // Given
        when(studentCourseService.getEnrolledCourses(TestConstants.TEST_USER_ID))
                .thenReturn(Collections.emptyList());

        // When
        ResponseEntity<?> response = courseController.getEnrolledCourses(TestConstants.TEST_USER_ID);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        // ResponseEntity.notFound().build() returns null body
        assertNull(response.getBody());
        verify(studentCourseService, times(1)).getEnrolledCourses(TestConstants.TEST_USER_ID);
    }

    @Test
    @DisplayName("Should successfully get courses by instructor ID")
    void testGetCourseByInstructorId_Success() {
        // Given
        List<Course> courses = Arrays.asList(testCourse);
        when(courseRepository.findByInstructor_Id(TestConstants.TEST_USER_ID))
                .thenReturn(courses);

        // When
        ResponseEntity<List<Course>> response = courseController.getCourseByInstructorId(TestConstants.TEST_USER_ID);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(courseRepository, times(1)).findByInstructor_Id(TestConstants.TEST_USER_ID);
    }

    @Test
    @DisplayName("Should return 404 when no courses found for instructor")
    void testGetCourseByInstructorId_NotFound() {
        // Given
        when(courseRepository.findByInstructor_Id(TestConstants.TEST_USER_ID))
                .thenReturn(Collections.emptyList());

        // When
        ResponseEntity<List<Course>> response = courseController.getCourseByInstructorId(TestConstants.TEST_USER_ID);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(courseRepository, times(1)).findByInstructor_Id(TestConstants.TEST_USER_ID);
    }
}

