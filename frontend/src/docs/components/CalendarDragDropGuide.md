# Calendar Drag-and-Drop Implementation Guide

This guide explains how to implement Google Calendar-style drag-and-drop functionality for creating test windows.

## 🎯 Features Implemented

### ✅ **Click and Drag to Create**
- Click and drag on the calendar to select a time range
- Automatically opens the CreateTestWindow modal with pre-filled data
- Minimum selection duration of 30 minutes
- Visual feedback during selection

### ✅ **Event Management**
- Drag existing events to move them
- Resize events by dragging the edges
- Click events to view details
- Visual indicators for active/inactive test windows

### ✅ **Calendar Views**
- Month view for overview
- Week view for detailed scheduling
- Day view for precise time management
- Responsive design for all screen sizes

## 🛠️ Components Created

### 1. **Enhanced Calendar Component** (`Calendar.tsx`)
```tsx
<Calendar
  events={events}
  onEventCreate={handleEventCreate}
  onEventClick={handleEventClick}
  onEventUpdate={handleEventUpdate}
  onEventDelete={handleEventDelete}
  editable={true}
  selectable={true}
  initialView="timeGridWeek"
/>
```

### 2. **Test Window Calendar** (`TestWindowCalendar.tsx`)
Specialized calendar component with:
- Custom event rendering
- Business hours highlighting
- Minimum duration validation
- Enhanced visual feedback

### 3. **Integration with CreateTestWindow**
- Pre-fills form data from calendar selection
- Maintains form state consistency
- Supports both manual and calendar creation

## 🚀 How to Use

### **Basic Implementation**

```tsx
import TestWindowCalendar from "@/app/_components/UI/TestWindowCalendar";

function MyComponent() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleEventCreate = (info) => {
    // Pre-fill form with selected time range
    setFormData({
      windowName: `Test Window - ${new Date(info.start).toLocaleDateString()}`,
      startDateTime: info.start,
      endDateTime: info.end,
      durationMinutes: Math.round((new Date(info.end) - new Date(info.start)) / (1000 * 60))
    });
    
    // Open creation modal
    setIsModalOpen(true);
  };

  return (
    <>
      <TestWindowCalendar
        events={events}
        onEventCreate={handleEventCreate}
        initialView="timeGridWeek"
        height={600}
      />
      
      <CreateTestWindow
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialFormData={formData}
        courses={courses}
        exams={exams}
      />
    </>
  );
}
```

### **Advanced Configuration**

```tsx
<TestWindowCalendar
  events={calendarEvents}
  onEventCreate={handleEventCreate}
  onEventClick={handleEventClick}
  onEventUpdate={handleEventUpdate}
  onEventDelete={handleEventDelete}
  initialView="timeGridWeek"
  height={600}
  editable={true}
  selectable={true}
/>
```

## 📋 Event Data Structure

### **Calendar Events**
```typescript
interface TestWindowEvent {
  id: string;
  title: string;
  start: string;        // ISO string
  end?: string;         // ISO string
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    courseId?: number;
    examId?: number;
    description?: string;
    maxAttempts?: number;
    isActive?: boolean;
  };
}
```

### **Event Creation Info**
```typescript
interface EventCreateInfo {
  start: string;        // ISO string
  end: string;          // ISO string
  allDay: boolean;
}
```

## 🎨 Styling and Customization

### **Color Coding**
- **Active Test Windows**: Red background (`#dc2626`)
- **Inactive Test Windows**: Gray background (`#6b7280`)
- **Selection**: Blue highlight during drag
- **Business Hours**: Light background highlight

### **Time Constraints**
- **Minimum Duration**: 30 minutes
- **Time Range**: 6:00 AM - 10:00 PM
- **Snap Duration**: 15 minutes
- **Slot Duration**: 30 minutes

### **Business Hours**
- **Days**: Monday - Friday
- **Time**: 8:00 AM - 6:00 PM
- **Visual**: Light background highlight

## 🔧 Configuration Options

### **Calendar Props**
```typescript
interface TestWindowCalendarProps {
  events?: TestWindowEvent[];
  onEventCreate?: (info: EventCreateInfo) => void;
  onEventClick?: (info: EventClickArg) => void;
  onEventUpdate?: (info: { id: string; start: string; end: string }) => void;
  onEventDelete?: (info: { id: string }) => void;
  onDateClick?: (info: { dateStr: string }) => void;
  editable?: boolean;           // Allow drag/resize
  selectable?: boolean;         // Allow click-drag selection
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  height?: string | number;     // Calendar height
}
```

### **Time Grid Settings**
```typescript
// Built-in configuration
slotMinTime="06:00:00"      // Earliest time slot
slotMaxTime="22:00:00"      // Latest time slot
slotDuration="00:30:00"     // Time slot interval
snapDuration="00:15:00"     // Snap to nearest 15 minutes
```

## 🎯 User Experience Features

### **Visual Feedback**
- **Selection Mirror**: Shows preview during drag
- **Hover Effects**: Events become semi-transparent on hover
- **Loading States**: Visual feedback during operations
- **Toast Notifications**: Success/error messages

### **Interaction Patterns**
- **Click and Drag**: Create new events
- **Click Event**: View/edit existing events
- **Drag Event**: Move events to different times
- **Resize Event**: Change event duration
- **Delete Event**: Remove events (drag outside calendar)

### **Validation**
- **Minimum Duration**: 30 minutes required
- **Time Constraints**: Only within business hours
- **Overlap Prevention**: Events cannot overlap
- **Form Validation**: Client-side validation before submission

## 🔄 Integration with Backend

### **API Endpoints Expected**
```typescript
// Create test window
POST /api/testWindow/createTestWindow
{
  windowName: string;
  startDateTime: string;
  endDateTime: string;
  durationMinutes: number;
  courseId: number;
  examId: number;
  // ... other fields
}

// Update test window
PUT /api/testWindow/updateTestWindow/:id
{
  startDateTime: string;
  endDateTime: string;
  // ... other fields
}

// Delete test window
DELETE /api/testWindow/deleteTestWindow/:id
```

### **Data Flow**
1. **User drags** on calendar
2. **Calendar triggers** `onEventCreate`
3. **Component pre-fills** form data
4. **Modal opens** with CreateTestWindow
5. **User completes** form and submits
6. **API call** creates test window
7. **Calendar refreshes** with new event

## 🐛 Troubleshooting

### **Common Issues**

1. **Events not showing**
   - Check event data format (ISO strings for dates)
   - Verify event IDs are unique
   - Check console for errors

2. **Drag not working**
   - Ensure `selectable={true}` is set
   - Check if `editable={true}` is enabled
   - Verify FullCalendar plugins are loaded

3. **Form not pre-filling**
   - Check `initialFormData` prop
   - Verify data structure matches form fields
   - Check console for errors

4. **Time zone issues**
   - Use `timeZone="local"` in calendar config
   - Convert dates to local timezone
   - Check server timezone settings

### **Debug Tips**
```typescript
// Add console logs for debugging
const handleEventCreate = (info) => {
  console.log('Event create info:', info);
  console.log('Start date:', new Date(info.start));
  console.log('End date:', new Date(info.end));
  // ... rest of handler
};
```

## 📚 Dependencies

### **Required Packages**
```json
{
  "@fullcalendar/react": "^6.1.0",
  "@fullcalendar/daygrid": "^6.1.0",
  "@fullcalendar/timegrid": "^6.1.0",
  "@fullcalendar/interaction": "^6.1.0",
  "@fullcalendar/core": "^6.1.0"
}
```

### **TypeScript Types**
```typescript
import { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
```

## 🎉 Benefits

### **For Users**
- **Intuitive**: Familiar Google Calendar interface
- **Efficient**: Quick event creation with drag-and-drop
- **Visual**: Clear time slot visualization
- **Flexible**: Multiple calendar views

### **For Developers**
- **Reusable**: Modular calendar components
- **Configurable**: Extensive customization options
- **Type-safe**: Full TypeScript support
- **Maintainable**: Clean separation of concerns

This implementation provides a professional, user-friendly calendar interface that makes test window scheduling as easy as using Google Calendar!
