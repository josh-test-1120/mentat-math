package org.mentats.mentat.services;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mentats.mentat.components.CourseValidator;
import org.mentats.mentat.exceptions.CourseNotFoundException;
import org.mentats.mentat.exceptions.ValidationException;
import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.payload.response.CourseResponse;
import org.mentats.mentat.repositories.CourseRepository;
import org.mentats.mentat.repositories.StudentCourseRepository;
import org.mentats.mentat.repositories.UserRepository;
import org.mentats.mentat.utils.TestConstants;
import org.mentats.mentat.utils.TestDataBuilder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CourseService
 * Tests business logic for course operations
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CourseService Tests")
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private StudentCourseRepository studentCourseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseValidator validator;

    @InjectMocks
    private CourseService courseService;

    private Course testCourse;
    private User testInstructor;
    private CourseRequest courseRequest;

    @BeforeEach
    void setUp() {
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

        courseRequest = TestDataBuilder.createCourseRequest(
                TestConstants.TEST_COURSE_NAME,
                TestConstants.TEST_USER_ID,
                TestConstants.TEST_COURSE_SECTION,
                TestConstants.TEST_COURSE_QUARTER,
                TestConstants.TEST_COURSE_YEAR
        );
    }

    @Test
    @DisplayName("Should successfully create course with valid data")
    void testCreateCourse_Success() {
        // Given
        doNothing().when(validator).validateForCreation(courseRequest);
        when(userRepository.findById(TestConstants.TEST_USER_ID))
                .thenReturn(Optional.of(testInstructor));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // When
        CourseResponse response = courseService.createCourse(courseRequest);

        // Then
        assertNotNull(response);
        assertEquals(TestConstants.TEST_COURSE_ID, response.getCourseId());
        assertEquals(TestConstants.TEST_COURSE_NAME, response.getCourseName());
        verify(validator, times(1)).validateForCreation(courseRequest);
        verify(userRepository, times(1)).findById(TestConstants.TEST_USER_ID);
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    @DisplayName("Should throw ValidationException when validation fails")
    void testCreateCourse_ValidationFailure() {
        // Given
        doThrow(new ValidationException("Validation failed"))
                .when(validator).validateForCreation(courseRequest);

        // When & Then
        assertThrows(ValidationException.class, () -> {
            courseService.createCourse(courseRequest);
        });
        verify(validator, times(1)).validateForCreation(courseRequest);
        verify(userRepository, never()).findById(anyLong());
        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when instructor not found")
    void testCreateCourse_InstructorNotFound() {
        // Given
        doNothing().when(validator).validateForCreation(courseRequest);
        when(userRepository.findById(TestConstants.TEST_USER_ID))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, () -> {
            courseService.createCourse(courseRequest);
        });
        verify(validator, times(1)).validateForCreation(courseRequest);
        verify(userRepository, times(1)).findById(TestConstants.TEST_USER_ID);
        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    @DisplayName("Should successfully get course by ID")
    void testGetCourseById_Success() {
        // Given
        doNothing().when(validator).validateCourseId(TestConstants.TEST_COURSE_ID);
        when(courseRepository.findById(TestConstants.TEST_COURSE_ID))
                .thenReturn(Optional.of(testCourse));

        // When
        Course result = courseService.getCourseById(TestConstants.TEST_COURSE_ID);

        // Then
        assertNotNull(result);
        assertEquals(TestConstants.TEST_COURSE_ID, result.getCourseId());
        assertEquals(TestConstants.TEST_COURSE_NAME, result.getCourseName());
        verify(validator, times(1)).validateCourseId(TestConstants.TEST_COURSE_ID);
        verify(courseRepository, times(1)).findById(TestConstants.TEST_COURSE_ID);
    }

    @Test
    @DisplayName("Should throw CourseNotFoundException when course not found")
    void testGetCourseById_NotFound() {
        // Given
        doNothing().when(validator).validateCourseId(TestConstants.NON_EXISTENT_COURSE_ID);
        when(courseRepository.findById(TestConstants.NON_EXISTENT_COURSE_ID))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(CourseNotFoundException.class, () -> {
            courseService.getCourseById(TestConstants.NON_EXISTENT_COURSE_ID);
        });
        verify(validator, times(1)).validateCourseId(TestConstants.NON_EXISTENT_COURSE_ID);
        verify(courseRepository, times(1)).findById(TestConstants.NON_EXISTENT_COURSE_ID);
    }

    @Test
    @DisplayName("Should successfully get all courses")
    void testGetAllCourses_Success() {
        // Given
        Course course2 = TestDataBuilder.createTestCourse(
                TestConstants.TEST_COURSE_ID_2,
                "Another Course",
                testInstructor
        );
        when(courseRepository.findAll()).thenReturn(Arrays.asList(testCourse, course2));

        // When
        List<CourseResponse> result = courseService.getAllCourses();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(TestConstants.TEST_COURSE_ID, result.get(0).getCourseId());
        verify(courseRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should successfully get courses by professor ID")
    void testGetCoursesByProfessorId_Success() {
        // Given
        doNothing().when(validator).validateProfessorId(TestConstants.TEST_USER_ID);
        when(courseRepository.findByInstructor_Id(TestConstants.TEST_USER_ID))
                .thenReturn(Arrays.asList(testCourse));

        // When
        List<CourseResponse> result = courseService.getCoursesByProfessorId(TestConstants.TEST_USER_ID);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(TestConstants.TEST_COURSE_ID, result.get(0).getCourseId());
        verify(validator, times(1)).validateProfessorId(TestConstants.TEST_USER_ID);
        verify(courseRepository, times(1)).findByInstructor_Id(TestConstants.TEST_USER_ID);
    }

    @Test
    @DisplayName("Should successfully get courses by year and quarter")
    void testGetCoursesByYearAndQuarter_Success() {
        // Given
        doNothing().when(validator).validateYear(TestConstants.TEST_COURSE_YEAR);
        doNothing().when(validator).validateQuarter(TestConstants.TEST_COURSE_QUARTER);
        when(courseRepository.findByCourseYearAndCourseQuarter(
                TestConstants.TEST_COURSE_YEAR, TestConstants.TEST_COURSE_QUARTER))
                .thenReturn(Arrays.asList(testCourse));

        // When
        List<CourseResponse> result = courseService.getCoursesByYearAndQuarter(
                TestConstants.TEST_COURSE_YEAR, TestConstants.TEST_COURSE_QUARTER);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(validator, times(1)).validateYear(TestConstants.TEST_COURSE_YEAR);
        verify(validator, times(1)).validateQuarter(TestConstants.TEST_COURSE_QUARTER);
        verify(courseRepository, times(1))
                .findByCourseYearAndCourseQuarter(TestConstants.TEST_COURSE_YEAR, TestConstants.TEST_COURSE_QUARTER);
    }

    @Test
    @DisplayName("Should successfully get course by section, year, and quarter")
    void testGetCourseBySectionYearQuarter_Success() {
        // Given
        doNothing().when(validator).validateSection(TestConstants.TEST_COURSE_SECTION);
        doNothing().when(validator).validateYear(TestConstants.TEST_COURSE_YEAR);
        doNothing().when(validator).validateQuarter(TestConstants.TEST_COURSE_QUARTER);
        when(courseRepository.findByCourseSectionAndCourseYearAndCourseQuarter(
                TestConstants.TEST_COURSE_SECTION,
                TestConstants.TEST_COURSE_YEAR,
                TestConstants.TEST_COURSE_QUARTER))
                .thenReturn(Optional.of(testCourse));

        // When
        CourseResponse result = courseService.getCourseBySectionYearQuarter(
                TestConstants.TEST_COURSE_SECTION,
                TestConstants.TEST_COURSE_YEAR,
                TestConstants.TEST_COURSE_QUARTER);

        // Then
        assertNotNull(result);
        assertEquals(TestConstants.TEST_COURSE_ID, result.getCourseId());
        verify(validator, times(1)).validateSection(TestConstants.TEST_COURSE_SECTION);
        verify(validator, times(1)).validateYear(TestConstants.TEST_COURSE_YEAR);
        verify(validator, times(1)).validateQuarter(TestConstants.TEST_COURSE_QUARTER);
    }

    @Test
    @DisplayName("Should successfully update course")
    void testUpdateCourse_Success() {
        // Given
        CourseRequest updateRequest = TestDataBuilder.createCourseRequest();
        updateRequest.setCourseName("Updated Course Name");
        // updateCourse calls validateCourseId and getCourseById (which also validates and finds)
        doNothing().when(validator).validateCourseId(TestConstants.TEST_COURSE_ID);
        when(courseRepository.findById(TestConstants.TEST_COURSE_ID))
                .thenReturn(Optional.of(testCourse));
        doNothing().when(validator).validateForUpdate(testCourse, updateRequest);
        when(userRepository.findById(TestConstants.TEST_USER_ID))
                .thenReturn(Optional.of(testInstructor));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // When
        Course result = courseService.updateCourse(TestConstants.TEST_COURSE_ID, updateRequest);

        // Then
        assertNotNull(result);
        // validateCourseId is called once in updateCourse, and getCourseById also validates
        verify(validator, atLeastOnce()).validateCourseId(TestConstants.TEST_COURSE_ID);
        // findById is called once in getCourseById (which is called from updateCourse)
        verify(courseRepository, atLeastOnce()).findById(TestConstants.TEST_COURSE_ID);
        verify(validator, times(1)).validateForUpdate(testCourse, updateRequest);
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    @DisplayName("Should successfully update course grade strategy")
    void testUpdateCourseGradeStrategy_Success() {
        // Given
        String newStrategy = "Weighted";
        // updateCourseGradeStrategy calls validateCourseId and getCourseById (which also validates and finds)
        doNothing().when(validator).validateCourseId(TestConstants.TEST_COURSE_ID);
        doNothing().when(validator).validateGradeStrategy(newStrategy);
        when(courseRepository.findById(TestConstants.TEST_COURSE_ID))
                .thenReturn(Optional.of(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        // When
        Course result = courseService.updateCourseGradeStrategy(TestConstants.TEST_COURSE_ID, newStrategy);

        // Then
        assertNotNull(result);
        // validateCourseId is called once in updateCourseGradeStrategy, and getCourseById also validates
        verify(validator, atLeastOnce()).validateCourseId(TestConstants.TEST_COURSE_ID);
        verify(validator, times(1)).validateGradeStrategy(newStrategy);
        // findById is called once in getCourseById (which is called from updateCourseGradeStrategy)
        verify(courseRepository, atLeastOnce()).findById(TestConstants.TEST_COURSE_ID);
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    @DisplayName("Should successfully delete course")
    void testDeleteCourse_Success() {
        // Given
        // deleteCourse calls validateCourseId and getCourseById (which also validates and finds)
        doNothing().when(validator).validateCourseId(TestConstants.TEST_COURSE_ID);
        when(courseRepository.findById(TestConstants.TEST_COURSE_ID))
                .thenReturn(Optional.of(testCourse));
        doNothing().when(validator).validateDeleteOperation(testCourse);
        doNothing().when(courseRepository).delete(testCourse);

        // When
        assertDoesNotThrow(() -> {
            courseService.deleteCourse(TestConstants.TEST_COURSE_ID);
        });

        // Then
        // validateCourseId is called once in deleteCourse, and getCourseById also validates
        verify(validator, atLeastOnce()).validateCourseId(TestConstants.TEST_COURSE_ID);
        // findById is called once in getCourseById (which is called from deleteCourse)
        verify(courseRepository, atLeastOnce()).findById(TestConstants.TEST_COURSE_ID);
        verify(validator, times(1)).validateDeleteOperation(testCourse);
        verify(courseRepository, times(1)).delete(testCourse);
    }

    @Test
    @DisplayName("Should return true when course exists")
    void testCourseExists_True() {
        // Given
        when(courseRepository.existsById(TestConstants.TEST_COURSE_ID)).thenReturn(true);

        // When
        boolean result = courseService.courseExists(TestConstants.TEST_COURSE_ID);

        // Then
        assertTrue(result);
        verify(courseRepository, times(1)).existsById(TestConstants.TEST_COURSE_ID);
    }

    @Test
    @DisplayName("Should return false when course does not exist")
    void testCourseExists_False() {
        // Given
        when(courseRepository.existsById(TestConstants.NON_EXISTENT_COURSE_ID)).thenReturn(false);

        // When
        boolean result = courseService.courseExists(TestConstants.NON_EXISTENT_COURSE_ID);

        // Then
        assertFalse(result);
        verify(courseRepository, times(1)).existsById(TestConstants.NON_EXISTENT_COURSE_ID);
    }
}

