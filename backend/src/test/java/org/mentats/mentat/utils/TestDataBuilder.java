package org.mentats.mentat.utils;

import org.mentats.mentat.models.Course;
import org.mentats.mentat.models.Exam;
import org.mentats.mentat.models.User;
import org.mentats.mentat.payload.request.CourseRequest;
import org.mentats.mentat.payload.request.ExamRequest;
import org.mentats.mentat.payload.request.LoginRequest;
import org.mentats.mentat.payload.request.PasswordChangeRequest;
import org.mentats.mentat.payload.request.ProfileUpdateRequest;
import org.mentats.mentat.payload.request.SignupRequest;

/**
 * Test Data Builder Utility
 * Provides reusable test data creation methods to reduce duplication
 * across test files.
 * 
 * Usage:
 *   User user = TestDataBuilder.createTestUser(1L, "testuser");
 *   ProfileUpdateRequest request = TestDataBuilder.createProfileUpdateRequest();
 */
public class TestDataBuilder {

    /**
     * Create a test User entity
     * @param id User ID
     * @param username Username
     * @return User entity with default test values
     */
    public static User createTestUser(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword("$2a$10$encodedPasswordHash");
        user.setUserType("STUDENT");
        return user;
    }

    /**
     * Create a test User entity with all fields
     * @param id User ID
     * @param username Username
     * @param email Email
     * @param firstName First name
     * @param lastName Last name
     * @param userType User type
     * @return User entity
     */
    public static User createTestUser(Long id, String username, String email, 
                                     String firstName, String lastName, String userType) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPassword("$2a$10$encodedPasswordHash");
        user.setUserType(userType);
        return user;
    }

    /**
     * Create a ProfileUpdateRequest with default test values
     * @return ProfileUpdateRequest
     */
    public static ProfileUpdateRequest createProfileUpdateRequest() {
        return new ProfileUpdateRequest(
                "John",
                "Doe",
                "johndoe",
                "john@example.com"
        );
    }

    /**
     * Create a ProfileUpdateRequest with custom values
     * @param firstName First name
     * @param lastName Last name
     * @param username Username
     * @param email Email
     * @return ProfileUpdateRequest
     */
    public static ProfileUpdateRequest createProfileUpdateRequest(
            String firstName, String lastName, String username, String email) {
        return new ProfileUpdateRequest(firstName, lastName, username, email);
    }

    /**
     * Create a PasswordChangeRequest with default test values
     * @return PasswordChangeRequest
     */
    public static PasswordChangeRequest createPasswordChangeRequest() {
        return new PasswordChangeRequest(
                "currentPassword",
                "newPassword123"
        );
    }

    /**
     * Create a PasswordChangeRequest with custom values
     * @param currentPassword Current password
     * @param newPassword New password
     * @return PasswordChangeRequest
     */
    public static PasswordChangeRequest createPasswordChangeRequest(
            String currentPassword, String newPassword) {
        return new PasswordChangeRequest(currentPassword, newPassword);
    }

    /**
     * Create a SignupRequest with default test values
     * @return SignupRequest
     */
    public static SignupRequest createSignupRequest() {
        SignupRequest request = new SignupRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("password123");
        request.setFirstname("New");
        request.setLastname("User");
        request.setUserType("STUDENT");
        return request;
    }

    /**
     * Create a SignupRequest with custom values
     * @param username Username
     * @param email Email
     * @param password Password
     * @param firstname First name
     * @param lastname Last name
     * @param userType User type
     * @return SignupRequest
     */
    public static SignupRequest createSignupRequest(
            String username, String email, String password,
            String firstname, String lastname, String userType) {
        SignupRequest request = new SignupRequest();
        request.setUsername(username);
        request.setEmail(email);
        request.setPassword(password);
        request.setFirstname(firstname);
        request.setLastname(lastname);
        request.setUserType(userType);
        return request;
    }

    /**
     * Create a LoginRequest with default test values
     * @return LoginRequest
     */
    public static LoginRequest createLoginRequest() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");
        return request;
    }

    /**
     * Create a LoginRequest with custom values
     * @param username Username
     * @param password Password
     * @return LoginRequest
     */
    public static LoginRequest createLoginRequest(String username, String password) {
        LoginRequest request = new LoginRequest();
        request.setUsername(username);
        request.setPassword(password);
        return request;
    }

    /**
     * Create a CourseRequest with default test values
     * @return CourseRequest
     */
    public static CourseRequest createCourseRequest() {
        CourseRequest request = new CourseRequest();
        request.setCourseName("Test Course");
        request.setCourseProfessorId(1L);
        request.setCourseSection("A");
        request.setCourseQuarter("Fall");
        request.setCourseYear(2024);
        request.setGradeStrategy("Standard");
        return request;
    }

    /**
     * Create a CourseRequest with custom values
     * @param courseName Course name
     * @param professorId Professor ID
     * @param section Section
     * @param quarter Quarter
     * @param year Year
     * @return CourseRequest
     */
    public static CourseRequest createCourseRequest(String courseName, Long professorId,
                                                   String section, String quarter, Integer year) {
        CourseRequest request = new CourseRequest();
        request.setCourseName(courseName);
        request.setCourseProfessorId(professorId);
        request.setCourseSection(section);
        request.setCourseQuarter(quarter);
        request.setCourseYear(year);
        request.setGradeStrategy("Standard");
        return request;
    }

    /**
     * Create a Course entity with default test values
     * @param courseId Course ID
     * @param courseName Course name
     * @param instructor Instructor user
     * @return Course entity
     */
    public static Course createTestCourse(Long courseId, String courseName, User instructor) {
        Course course = new Course();
        course.setCourseId(courseId);
        course.setCourseName(courseName);
        course.setInstructor(instructor);
        course.setCourseSection("A");
        course.setCourseQuarter("Fall");
        course.setCourseYear(2024);
        course.setGradeStrategy("Standard");
        return course;
    }

    /**
     * Create an ExamRequest with default test values
     * @return ExamRequest
     */
    public static ExamRequest createExamRequest() {
        ExamRequest request = new ExamRequest();
        request.setExamName("Test Exam");
        request.setExamCourseId(1L);
        request.setExamDifficulty(2); // 0=Easy, 1=Medium, 2=Hard
        request.setExamState(0); // 0=DRAFT, 1=ACTIVE, etc.
        request.setExamRequired(1); // 1=true, 0=false
        request.setExamDuration(60.0);
        request.setExamOnline(1); // 1=true, 0=false
        return request;
    }

    /**
     * Create an ExamRequest with custom values
     * @param examName Exam name
     * @param courseId Course ID
     * @return ExamRequest
     */
    public static ExamRequest createExamRequest(String examName, Long courseId) {
        ExamRequest request = new ExamRequest();
        request.setExamName(examName);
        request.setExamCourseId(courseId);
        request.setExamDifficulty(2); // 0=Easy, 1=Medium, 2=Hard
        request.setExamState(0); // 0=DRAFT, 1=ACTIVE, etc.
        request.setExamRequired(1); // 1=true, 0=false
        request.setExamDuration(60.0);
        request.setExamOnline(1); // 1=true, 0=false
        return request;
    }

    /**
     * Create an Exam entity with default test values
     * @param examId Exam ID
     * @param examName Exam name
     * @param course Course entity
     * @return Exam entity
     */
    public static Exam createTestExam(Long examId, String examName, Course course) {
        Exam exam = new Exam(examId, course, examName, 0, 1, 2, 60.0, 1);
        return exam;
    }
}

