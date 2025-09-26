# CreateTestWindow Component

A comprehensive React component for creating test windows in the Mentat Math application.

## Features

- **Form Validation**: Client-side validation for all required fields
- **Course/Exam Integration**: Dynamic exam filtering based on selected course
- **Date/Time Selection**: Intuitive datetime pickers for scheduling
- **Password Protection**: Optional password protection for test windows
- **Responsive Design**: Mobile-friendly layout with Tailwind CSS
- **Error Handling**: Comprehensive error handling with toast notifications
- **Loading States**: Visual feedback during form submission

## Props

```typescript
interface CreateTestWindowProps {
  isOpen: boolean;                    // Controls modal visibility
  onClose: () => void;               // Callback when modal is closed
  onTestWindowCreated?: () => void;  // Callback when test window is created
  courses?: Array<{                  // Available courses
    id: number;
    name: string;
    section: string;
  }>;
  exams?: Array<{                    // Available exams
    id: number;
    name: string;
    courseId: number;
  }>;
}
```

## Form Fields

### Required Fields
- **Test Window Name**: Unique identifier for the test window
- **Course**: Select from available courses
- **Exam**: Select from exams in the chosen course
- **Start Date & Time**: When the test window opens
- **End Date & Time**: When the test window closes
- **Duration**: Test duration in minutes (1-480)
- **Max Attempts**: Maximum number of attempts allowed (1-10)

### Optional Fields
- **Description**: Additional details about the test window
- **Password**: Optional password protection
- **Active Status**: Whether the test window is active
- **Late Submission**: Allow submissions after the end time

## Usage Examples

### Basic Usage
```tsx
import CreateTestWindow from "@/app/_components/testWindow/CreateTestWindow";

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Create Test Window
      </button>
      
      <CreateTestWindow
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTestWindowCreated={() => {
          console.log("Test window created!");
          // Refresh data, show success message, etc.
        }}
        courses={courses}
        exams={exams}
      />
    </>
  );
}
```

### With Data Loading
```tsx
import { useState, useEffect } from "react";
import CreateTestWindow from "@/app/_components/testWindow/CreateTestWindow";

function TestWindowsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    // Load courses and exams from API
    loadCourses();
    loadExams();
  }, []);

  return (
    <CreateTestWindow
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onTestWindowCreated={() => {
        // Refresh test windows list
        loadTestWindows();
      }}
      courses={courses}
      exams={exams}
    />
  );
}
```

## API Integration

The component expects the following API endpoint:

### POST `/api/testWindow/createTestWindow`

**Request Body:**
```json
{
  "windowName": "Midterm Exam Window",
  "description": "Midterm exam for Mathematics 101",
  "courseId": 1,
  "examId": 2,
  "startDateTime": "2024-01-15T09:00:00",
  "endDateTime": "2024-01-15T17:00:00",
  "durationMinutes": 120,
  "maxAttempts": 2,
  "isActive": true,
  "allowLateSubmission": false,
  "password": "exam123",
  "createdBy": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test window created successfully",
  "data": {
    "id": 1,
    "windowName": "Midterm Exam Window",
    // ... other fields
  }
}
```

## Validation Rules

1. **Test Window Name**: Required, non-empty string
2. **Course**: Must select a valid course
3. **Exam**: Must select a valid exam from the chosen course
4. **Start Time**: Required, must be a valid datetime
5. **End Time**: Required, must be after start time
6. **Duration**: Must be between 1 and 480 minutes
7. **Max Attempts**: Must be between 1 and 10

## Styling

The component uses Tailwind CSS classes and follows the Mentat Math design system:
- **Background**: `bg-mentat-black`
- **Text Color**: `text-mentat-gold`
- **Borders**: `border-mentat-gold/20`
- **Focus States**: `focus:border-mentat-gold/60`

## Dependencies

- React 18+
- Next.js 13+
- NextAuth.js
- React Toastify
- Tailwind CSS

## File Structure

```
frontend/src/app/_components/testWindow/
├── CreateTestWindow.tsx      # Main component
├── TestWindowExample.tsx     # Usage example
└── README.md                 # This documentation
```

## Error Handling

The component handles various error scenarios:
- Network errors during API calls
- Validation errors for form fields
- Authentication errors (user not logged in)
- Server-side validation errors

All errors are displayed using toast notifications for better user experience.
