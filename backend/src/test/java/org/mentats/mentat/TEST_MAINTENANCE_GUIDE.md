# Test Suite Maintenance and Expansion Guide

## Philosophy: Tests as Living Documentation

**Key Principle**: Tests should evolve with your codebase, but they should also serve as documentation of expected behavior. Old tests become outdated only when the **behavior** changes, not when the **implementation** changes.

## Test Lifecycle Management

### 1. When to Update Tests

#### ✅ **Update Tests When:**
- **Behavior Changes**: The expected outcome of a feature changes
  - Example: Password validation rules change from 6 to 8 characters
  - Action: Update the test to reflect new validation rules
- **API Contract Changes**: Request/response structure changes
  - Example: `UserResponse` now includes a new `phoneNumber` field
  - Action: Update tests to verify the new field is included
- **Business Logic Changes**: New rules or constraints are added
  - Example: Users can now update their own profile AND admins can update any profile
  - Action: Add new test cases, keep old ones if they still apply

#### ❌ **Don't Update Tests When:**
- **Refactoring Only**: Internal implementation changes but behavior stays the same
  - Example: Extracting a method, renaming variables, changing code structure
  - Action: Tests should still pass without changes
- **Performance Optimizations**: Code runs faster but produces same results
  - Action: No test changes needed
- **Code Style Changes**: Formatting, comments, documentation updates
  - Action: No test changes needed

### 2. Test Evolution Patterns

#### Pattern 1: **Additive Expansion** (Recommended)
When adding new features, add new tests without modifying existing ones.

```java
// Existing test - KEEP AS IS
@Test
@DisplayName("Should successfully update profile with valid data")
void testUpdateProfile_Success() { ... }

// New feature - ADD NEW TEST
@Test
@DisplayName("Should successfully update profile with phone number")
void testUpdateProfile_WithPhoneNumber() { ... }
```

**Benefits:**
- Preserves test history
- Easier to track what changed
- Safer refactoring

#### Pattern 2: **Versioned Test Classes**
For major feature changes, create versioned test classes.

```
services/
  ├── UserServiceTest.java          (v1.0 - original)
  ├── UserServiceTestV2.java        (v2.0 - new features)
  └── UserServiceTest.java          (latest - consolidated)
```

**When to use:**
- Major API versioning
- Complete feature rewrites
- Migration periods

#### Pattern 3: **Test Inheritance**
Use test base classes for common setup.

```java
// Base test class
abstract class BaseServiceTest {
    @Mock
    protected UserRepository userRepository;
    
    protected User createTestUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        return user;
    }
}

// Specific test class
class UserServiceTest extends BaseServiceTest {
    @InjectMocks
    private UserService userService;
    
    // Tests use inherited setup
}
```

## Expanding Your Test Suite

### Step-by-Step Expansion Strategy

#### 1. **Identify Test Gaps**
Create a test coverage matrix:

| Service/Controller | Create | Read | Update | Delete | Validation | Error Handling |
|-------------------|--------|------|--------|--------|------------|----------------|
| UserService       | ✅     | ✅   | ✅     | ❌     | ✅         | ✅             |
| CourseService     | ❌     | ❌   | ❌     | ❌     | ❌         | ❌             |
| ExamService       | ❌     | ❌   | ❌     | ❌     | ❌         | ❌             |

#### 2. **Prioritize by Risk**
Test in this order:
1. **Critical Paths**: Authentication, user management
2. **Business Logic**: Complex calculations, validations
3. **Data Integrity**: Foreign key relationships, constraints
4. **Edge Cases**: Boundary conditions, error scenarios

#### 3. **Follow the Test Pyramid**

```
        /\
       /  \      E2E Tests (Few)
      /____\
     /      \    Integration Tests (Some)
    /________\
   /          \   Unit Tests (Many)
  /____________\
```

**Your Current Focus**: Unit Tests (✅ Good!)

### 4. **Test Template for New Features**

When adding a new service, use this template:

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("YourNewService Tests")
class YourNewServiceTest {
    
    @Mock
    private YourRepository repository;
    
    @Mock
    private DependencyService dependencyService;
    
    @InjectMocks
    private YourNewService service;
    
    // Test Data Builders
    private YourEntity createTestEntity() {
        // Builder pattern for test data
    }
    
    // Success Scenarios
    @Test
    @DisplayName("Should successfully [action] with valid input")
    void testAction_Success() { ... }
    
    // Validation Scenarios
    @Test
    @DisplayName("Should throw exception when [validation fails]")
    void testAction_ValidationError() { ... }
    
    // Error Scenarios
    @Test
    @DisplayName("Should handle [error condition] gracefully")
    void testAction_ErrorHandling() { ... }
    
    // Edge Cases
    @Test
    @DisplayName("Should handle [edge case] correctly")
    void testAction_EdgeCase() { ... }
}
```

## Maintaining Test Compatibility

### Strategy 1: **Backward Compatibility Tests**

When refactoring, add tests that verify old behavior still works:

```java
// Old test - verify it still passes
@Test
@DisplayName("Should maintain backward compatibility for [old feature]")
void testBackwardCompatibility_OldFeature() {
    // Test old API still works
}

// New test - test new feature
@Test
@DisplayName("Should support [new feature]")
void testNewFeature() {
    // Test new API
}
```

### Strategy 2: **Contract Tests**

Test that API contracts remain stable:

```java
@Test
@DisplayName("UserResponse should always include required fields")
void testUserResponse_Contract() {
    UserResponse response = service.getUser(1L);
    
    // Verify contract
    assertNotNull(response.getId());
    assertNotNull(response.getUsername());
    assertNotNull(response.getEmail());
    // Add new fields here as they're added
}
```

### Strategy 3: **Regression Test Suite**

Keep a separate file for regression tests:

```java
/**
 * Regression Tests
 * These tests verify that previously fixed bugs don't reoccur
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Regression Tests")
class UserServiceRegressionTest {
    
    @Test
    @DisplayName("Regression: Should not allow duplicate usernames (Bug #123)")
    void testRegression_DuplicateUsername_Bug123() {
        // Test that verifies the bug fix
    }
}
```

## Handling Refactoring

### Before Refactoring

1. **Ensure Test Coverage**: All code paths should have tests
2. **Run Full Test Suite**: `./gradlew test`
3. **Document Expected Behavior**: Update test documentation

### During Refactoring

1. **Run Tests Frequently**: After each small change
2. **Fix Broken Tests**: Update tests only if behavior changed
3. **Add New Tests**: For new code paths introduced

### After Refactoring

1. **Verify All Tests Pass**: `./gradlew test`
2. **Check Test Coverage**: Ensure no coverage loss
3. **Update Documentation**: Reflect any behavior changes

## Test Organization for Scalability

### Recommended Structure

```
backend/src/test/java/org/mentats/mentat/
├── services/
│   ├── UserServiceTest.java
│   ├── AuthServiceTest.java
│   ├── CourseServiceTest.java
│   └── ...
├── controllers/
│   ├── UserControllerTest.java
│   ├── AuthControllerTest.java
│   └── ...
├── exceptions/
│   └── GlobalExceptionHandlerTest.java
├── repositories/          (Integration tests)
│   └── UserRepositoryTest.java
├── integration/          (Integration tests)
│   └── UserIntegrationTest.java
└── utils/                (Test utilities)
    ├── TestDataBuilder.java
    └── TestConstants.java
```

### Test Utilities

Create shared test utilities to avoid duplication:

```java
// TestDataBuilder.java
public class TestDataBuilder {
    public static User createTestUser(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        return user;
    }
    
    public static ProfileUpdateRequest createProfileRequest() {
        return new ProfileUpdateRequest(
            "John", "Doe", "johndoe", "john@example.com"
        );
    }
}
```

## Test Maintenance Checklist

### Weekly
- [ ] Run full test suite: `./gradlew test`
- [ ] Review failing tests
- [ ] Check test execution time (should be fast)

### Per Feature
- [ ] Add tests for new features
- [ ] Update tests if behavior changed
- [ ] Verify backward compatibility

### Per Release
- [ ] Review test coverage report
- [ ] Remove obsolete tests (if any)
- [ ] Update test documentation
- [ ] Review test execution time

## Common Pitfalls and Solutions

### Pitfall 1: Tests Break After Refactoring
**Problem**: Tests fail after code refactoring
**Solution**: 
- If behavior unchanged: Fix test setup/mocks, not assertions
- If behavior changed: Update tests to reflect new behavior

### Pitfall 2: Tests Become Outdated
**Problem**: Tests don't reflect current requirements
**Solution**:
- Regular test reviews
- Update tests when requirements change
- Use test names that describe behavior, not implementation

### Pitfall 3: Test Duplication
**Problem**: Same test logic repeated across files
**Solution**:
- Extract common test utilities
- Use test base classes
- Create test data builders

### Pitfall 4: Slow Test Suite
**Problem**: Tests take too long to run
**Solution**:
- Use mocks instead of real dependencies
- Avoid Spring context loading in unit tests
- Run tests in parallel (Gradle does this automatically)

## Best Practices Summary

1. **Test Behavior, Not Implementation**
   - ✅ Test: "Should return 404 when user not found"
   - ❌ Test: "Should call repository.findById() once"

2. **Keep Tests Independent**
   - Each test should work in isolation
   - No shared state between tests

3. **Use Descriptive Names**
   - `testUpdateProfile_Success` ✅
   - `test1` ❌

4. **Test Both Success and Failure**
   - Happy path
   - Error scenarios
   - Edge cases

5. **Maintain Test Quality**
   - Keep tests simple and readable
   - One assertion per test (when possible)
   - Use `@DisplayName` for clarity

## Example: Expanding CourseService Tests

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("CourseService Tests")
class CourseServiceTest {
    
    @Mock
    private CourseRepository courseRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private CourseValidator validator;
    
    @InjectMocks
    private CourseService courseService;
    
    // Existing tests remain unchanged
    
    // New tests for new features
    @Test
    @DisplayName("Should successfully create course with instructor")
    void testCreateCourse_WithInstructor() {
        // New test for new feature
    }
    
    @Test
    @DisplayName("Should throw exception when instructor not found")
    void testCreateCourse_InstructorNotFound() {
        // New test for error handling
    }
}
```

## Conclusion

**Old tests become outdated only when behavior changes.** Well-written tests that focus on behavior (not implementation) will remain valid through refactoring and will serve as living documentation of your system's expected behavior.

**Key Takeaways:**
1. ✅ Tests should evolve with features
2. ✅ Focus on behavior, not implementation
3. ✅ Add new tests, don't always modify old ones
4. ✅ Use test utilities to reduce duplication
5. ✅ Regular test maintenance prevents technical debt

