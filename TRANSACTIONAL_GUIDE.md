# @Transactional in Spring Boot - Complete Guide

## What is @Transactional?

`@Transactional` is a Spring annotation that provides **declarative transaction management**. It tells Spring to manage database transactions automatically for you.

## How It Works

### 1. **Transaction Lifecycle**
```java
@Transactional
public void someMethod() {
    // Spring automatically:
    // 1. Begins a transaction
    // 2. Executes your method
    // 3. Commits the transaction (if no exceptions)
    // 4. Rolls back the transaction (if exceptions occur)
}
```

### 2. **ACID Properties**
- **Atomicity**: All operations succeed or all fail
- **Consistency**: Database remains in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes are permanent

## Common @Transactional Attributes

```java
@Transactional(
    propagation = Propagation.REQUIRED,    // Default: join existing or create new
    isolation = Isolation.READ_COMMITTED,  // Default: prevent dirty reads
    timeout = 30,                          // Transaction timeout in seconds
    readOnly = false,                      // Optimize for read-only operations
    rollbackFor = {Exception.class},       // Rollback for specific exceptions
    noRollbackFor = {IllegalArgumentException.class} // Don't rollback for these
)
```

## Best Practices

### ✅ DO:
1. **Use in Service Layer**: Put `@Transactional` on service methods, not controllers
2. **Use `readOnly = true`** for read-only operations
3. **Handle exceptions properly** - let Spring handle rollbacks
4. **Keep transactions short** - avoid long-running operations

### ❌ DON'T:
1. **Don't use on controllers** - Controllers handle HTTP, not business logic
2. **Don't catch and swallow exceptions** - This prevents rollbacks
3. **Don't call external services** inside transactions
4. **Don't use on private methods** - Spring can't proxy them

## Examples

### ✅ Correct Usage:
```java
@Service
public class CourseService {
    
    @Transactional
    public void createCourse(CourseRequest request) {
        // Multiple database operations
        Course course = new Course(request);
        courseRepository.save(course);
        // If any operation fails, all are rolled back
    }
    
    @Transactional(readOnly = true)
    public List<Course> getCourses() {
        // Read-only operation - optimized by Spring
        return courseRepository.findAll();
    }
}
```

### ❌ Incorrect Usage:
```java
@RestController
public class CourseController {
    
    @Transactional  // ❌ WRONG: Don't use on controllers
    public ResponseEntity<?> createCourse() {
        // Business logic should be in service layer
    }
}
```

## Transaction Propagation

```java
@Transactional(propagation = Propagation.REQUIRED)  // Default
public void methodA() {
    methodB(); // Joins existing transaction
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void methodB() {
    // Creates new transaction, suspends current one
}
```

## Common Problems and Solutions

### Problem 1: @Transactional not working
**Cause**: Method is private or not called through Spring proxy
**Solution**: Make method public and call through Spring-managed bean

### Problem 2: Unexpected rollbacks
**Cause**: Unchecked exceptions cause automatic rollback
**Solution**: Use `noRollbackFor` or handle exceptions properly

### Problem 3: Long-running transactions
**Cause**: Too much work in one transaction
**Solution**: Break into smaller transactions or use `@Async`

## Your Fixed Code

### Before (Problems):
```java
@RestController
public class CourseController {
    @PostMapping("/joinCourse")
    @Transactional  // ❌ Wrong place
    public ResponseEntity<?> joinCourse() {
        // Business logic in controller ❌
        // No proper error handling ❌
    }
}
```

### After (Fixed):
```java
@Service
public class CourseService {
    @Transactional  // ✅ Correct place
    public void joinCourse(JoinCourseRequest req) {
        // Business logic with proper error handling ✅
    }
}

@RestController
public class CourseController {
    @PostMapping("/joinCourse")
    public ResponseEntity<?> joinCourse() {
        // Delegates to service ✅
        // Proper error handling ✅
    }
}
```

## Key Takeaways

1. **Controllers**: Handle HTTP requests, delegate to services
2. **Services**: Contain business logic with `@Transactional`
3. **Repositories**: Handle data access (already transactional)
4. **Always handle exceptions** properly
5. **Use `readOnly = true`** for read operations
6. **Keep transactions short** and focused

This architecture ensures proper separation of concerns and reliable transaction management!
