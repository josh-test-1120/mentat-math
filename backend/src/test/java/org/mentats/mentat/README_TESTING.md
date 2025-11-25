# Backend Testing Guide

## Overview
This test suite provides comprehensive unit tests for the backend services, controllers, and exception handlers. The tests focus on validating information-passing pipelines, request/response transformations, and error handling.

## Test Structure

### Test Organization
Tests are organized by feature/component:
- **Services**: Business logic and data transformation (`UserServiceTest`, `AuthServiceTest`)
- **Controllers**: API endpoint request/response handling (`UserControllerTest`)
- **Exceptions**: Error handling and response formatting (`GlobalExceptionHandlerTest`)

### Testing Approach

#### 1. Service Layer Tests
- **Purpose**: Test business logic, validation, and data transformations
- **Technique**: Mock dependencies (repositories, encoders) using Mockito
- **Focus**: 
  - Input validation
  - Data transformation (Request → Entity → Response)
  - Exception handling
  - Business rule enforcement

**Example**: `UserServiceTest`
- Tests profile updates with duplicate username/email detection
- Tests password changes with current password verification
- Tests user retrieval with proper exception handling

#### 2. Controller Layer Tests
- **Purpose**: Test API endpoint behavior, HTTP status codes, and response formats
- **Technique**: Mock services and security context
- **Focus**:
  - Request/response mapping
  - HTTP status code correctness
  - Authentication/authorization checks
  - Error response formatting

**Example**: `UserControllerTest`
- Tests successful profile retrieval (200 OK)
- Tests unauthorized access (403 Forbidden)
- Tests validation errors (400 Bad Request)
- Tests not found scenarios (404 Not Found)

#### 3. Exception Handler Tests
- **Purpose**: Test centralized exception handling and response formatting
- **Technique**: Direct instantiation and method calls
- **Focus**:
  - Exception type mapping to HTTP status codes
  - Error message formatting
  - Validation error structure

**Example**: `GlobalExceptionHandlerTest`
- Tests `EntityNotFoundException` → 404
- Tests `MethodArgumentNotValidException` → 400 with validation errors
- Tests `ValidationException` → 400

## Running Tests

### Run All Tests
```bash
./gradlew test
```

### Run Specific Test Class
```bash
./gradlew test --tests "org.mentats.mentat.services.UserServiceTest"
```

### Run Specific Test Method
```bash
./gradlew test --tests "org.mentats.mentat.services.UserServiceTest.testGetUserById_Success"
```

### View Test Reports
After running tests, view the HTML report:
```
build/reports/tests/test/index.html
```

## Test Coverage Areas

### User Management
- ✅ User profile retrieval
- ✅ Profile updates with validation
- ✅ Password changes with security checks
- ✅ Duplicate username/email detection

### Authentication
- ✅ User authentication flow
- ✅ User registration with validation
- ✅ JWT token generation
- ✅ User details retrieval

### Exception Handling
- ✅ Entity not found scenarios
- ✅ Validation errors (field and global)
- ✅ Security exceptions
- ✅ Duplicate record exceptions

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Mocking**: External dependencies (repositories, services) are mocked
3. **Assertions**: Clear assertions for expected behavior
4. **Naming**: Descriptive test names using `@DisplayName`
5. **Coverage**: Test both success and failure scenarios

## Adding New Tests

When adding new features:

1. **Service Tests**: Create `*ServiceTest.java` in `services/` package
2. **Controller Tests**: Create `*ControllerTest.java` in `controllers/` package
3. **Exception Tests**: Add to `GlobalExceptionHandlerTest` if new exception types

### Test Template
```java
@ExtendWith(MockitoExtension.class)
@DisplayName("YourService Tests")
class YourServiceTest {
    @Mock
    private YourRepository repository;
    
    @InjectMocks
    private YourService service;
    
    @Test
    @DisplayName("Should successfully perform action")
    void testAction_Success() {
        // Given
        // When
        // Then
    }
}
```

## Common Patterns

### Testing Request/Response Pipeline
```java
// 1. Mock repository response
when(repository.findById(id)).thenReturn(Optional.of(entity));

// 2. Call service method
Result result = service.performAction(request);

// 3. Verify transformation
assertNotNull(result);
assertEquals(expected, result.getField());

// 4. Verify repository interaction
verify(repository, times(1)).findById(id);
```

### Testing Exception Scenarios
```java
// 1. Mock exception
when(repository.findById(id)).thenReturn(Optional.empty());

// 2. Assert exception is thrown
assertThrows(EntityNotFoundException.class, () -> {
    service.getById(id);
});
```

### Testing Validation
```java
// 1. Create invalid request
Request request = new Request();
request.setField(""); // Invalid

// 2. Assert validation error
assertThrows(IllegalArgumentException.class, () -> {
    service.validate(request);
});
```

## Notes

- Tests use JUnit 5 (Jupiter) and Mockito
- No database is required - all dependencies are mocked
- Tests focus on logic, not infrastructure
- Spring context is not loaded for unit tests (faster execution)

## Test Maintenance

See [TEST_MAINTENANCE_GUIDE.md](./TEST_MAINTENANCE_GUIDE.md) for comprehensive guidance on:
- Expanding your test suite
- Maintaining test compatibility
- Handling refactoring
- Test organization strategies

## Test Utilities

- **TestDataBuilder**: Reusable test data creation methods
- **TestConstants**: Centralized test constants

Example usage:
```java
import org.mentats.mentat.utils.TestDataBuilder;
import org.mentats.mentat.utils.TestConstants;

User user = TestDataBuilder.createTestUser(
    TestConstants.TEST_USER_ID, 
    TestConstants.TEST_USERNAME
);
```

