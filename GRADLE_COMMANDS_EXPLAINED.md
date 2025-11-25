# Gradle Commands Explained

## Command Structure

```bash
./gradlew [task1] [task2] [task3] ...
```

- `./gradlew` - The Gradle Wrapper script (runs Gradle without installing it globally)
- `[task]` - A task to execute (can have multiple tasks)

## Common Tasks

### `clean`
**What it does:** Deletes the `build/` directory (removes all compiled classes, test results, etc.)

**Why use it:**
- Start fresh before building
- Remove stale/cached files
- Ensure clean compilation

**Example:**
```bash
./gradlew clean
```

### `test`
**What it does:** Compiles and runs all unit tests

**What happens:**
1. Compiles source code (`compileJava`)
2. Compiles test code (`compileTestJava`)
3. Runs all tests
4. Generates test reports in `build/reports/tests/`

**Example:**
```bash
./gradlew test
```

### `clean test` (Combined)
**What it does:** Runs `clean` first, then `test`

**Why:** Ensures you're testing against freshly compiled code

**Example:**
```bash
./gradlew clean test
```

## About "clean t"

If you saw `./gradlew clean t`, the `t` is likely:
1. **A typo** - meant to be `test`
2. **Gradle task abbreviation** - Gradle allows abbreviations if unique

### Gradle Task Abbreviations

Gradle allows you to abbreviate task names if the abbreviation is unique:

```bash
# These are equivalent:
./gradlew test
./gradlew t      # Only works if "t" uniquely identifies "test"
./gradlew te     # Only works if "te" uniquely identifies "test"
./gradlew tes    # Only works if "tes" uniquely identifies "test"
```

**However:** This is **not recommended** because:
- ❌ Hard to read
- ❌ Can break if new tasks are added
- ❌ Not clear what it does

**Better:** Use full task names for clarity:
```bash
./gradlew clean test  ✅ Clear and explicit
./gradlew clean t      ❌ Unclear abbreviation
```

## Common Gradle Commands for Your Project

### Build and Test
```bash
# Clean build directory
./gradlew clean

# Run all tests
./gradlew test

# Clean and test (most common)
./gradlew clean test

# Build the project (compile, test, package)
./gradlew build

# Clean and build
./gradlew clean build
```

### Specific Tests
```bash
# Run specific test class
./gradlew test --tests "org.mentats.mentat.services.UserServiceTest"

# Run specific test method
./gradlew test --tests "org.mentats.mentat.services.UserServiceTest.testGetUserById_Success"

# Run tests matching a pattern
./gradlew test --tests "*ServiceTest"
```

### Other Useful Commands
```bash
# Compile only (no tests)
./gradlew compileJava

# Compile tests only (no execution)
./gradlew compileTestJava

# Run application
./gradlew bootRun

# Create JAR file
./gradlew bootJar

# View all available tasks
./gradlew tasks

# View help for a task
./gradlew help --task test
```

## Task Execution Order

When you run multiple tasks, Gradle executes them in order:

```bash
./gradlew clean test
```

**Execution order:**
1. ✅ `clean` runs first (deletes `build/` directory)
2. ✅ `test` runs second (compiles and runs tests)

**Note:** Gradle is smart about dependencies:
- `test` automatically depends on `compileJava` and `compileTestJava`
- So `./gradlew test` will compile everything first

## Understanding Task Dependencies

Gradle tasks have dependencies. For example:

```
test
  ├── compileTestJava (depends on)
  │     └── compileJava (depends on)
  │           └── processResources
  └── processTestResources
```

When you run `./gradlew test`, Gradle automatically runs all dependencies first.

## Your Project's Test Task

Looking at your `build.gradle`:

```gradle
tasks.named('test') {
    useJUnitPlatform()
}
```

This configures the `test` task to use JUnit 5 (Jupiter) platform.

## Best Practices

### ✅ Do This:
```bash
# Clear and explicit
./gradlew clean test
./gradlew build
./gradlew test --tests "UserServiceTest"
```

### ❌ Avoid This:
```bash
# Unclear abbreviations
./gradlew clean t
./gradlew b
./gradlew c t
```

## Troubleshooting

### Command Not Found
```bash
# Make sure gradlew is executable
chmod +x gradlew

# Or use on Windows
gradlew.bat clean test
```

### Task Not Found
```bash
# List all available tasks
./gradlew tasks

# List tasks with descriptions
./gradlew tasks --all
```

### Build Fails
```bash
# Run with more info
./gradlew clean test --info

# Run with stacktrace
./gradlew clean test --stacktrace

# Run with debug output
./gradlew clean test --debug
```

## Summary

- **`clean`** = Delete build artifacts
- **`test`** = Run unit tests
- **`clean test`** = Clean then test (recommended)
- **`t`** = Abbreviation for `test` (not recommended)
- Always use full task names for clarity!

