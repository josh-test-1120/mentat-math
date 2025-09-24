"use client";
import React, { useState, useEffect, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { useSession } from 'next-auth/react'
import Modal from "@/app/_components/UI/Modal";
import Calendar from "../_components/UI/Calendar";
import CreateTestWindow from "@/app/createTestWindow/pageClient";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

// Course type definition
type Course = {
    courseId: number;  // Changed from courseID to courseId to match backend data
    courseName: string;
    courseSection: string;
    courseYear: number;
    courseQuarter: string;
    courseProfessorId: string;
};

/**
 * Test Window Page with Course Selection
 * @constructor
 */
export default function TestWindowPage() {
    // State information
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [testWindows, setTestWindows] = useState<any[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);


    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Session information
    const { data: session, status } = useSession()


    /**
     * Fetch instructor courses
     */
    const fetchInstructorCourses = useCallback(async () => {
        if (status !== 'authenticated') return;
        if (session?.user?.id) {
            try {
                setLoading(true);
                setError(null);
                
                const res = await apiHandler(
                    undefined,
                    'GET',
                    `course/listCourses?id=${session.user.id}`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );
                
                if (res?.error) {
                    console.error('List Instructor Courses failed:', res);
                    setError(res.message || 'Failed to fetch courses');
                    return;
                }
                
                console.log('Instructor courses response:', res);
                
                // Handle different response formats
                let coursesData = [];
                
                if (Array.isArray(res)) {
                    coursesData = res;
                } else if (res && Array.isArray(res.data)) {
                    coursesData = res.data;
                } else if (res && Array.isArray(res.result)) {
                    coursesData = res.result;
                } else if (res && typeof res === 'object') {
                    coursesData = Object.values(res).filter(c => c && typeof c === 'object');
                }
                
                console.log('Processed instructor courses:', coursesData);
                setCourses(coursesData);
                
                // Don't auto-select - force user to make conscious choice
                // This prevents accidental test window creation for wrong course
            } catch (e) {
                console.error('Error fetching instructor courses:', e);
                setError('Failed to fetch courses');
                setCourses([]);
            } finally {
                setLoading(false);
            }
        }
    }, [session?.user?.id]);

    /**
     * Fetch test windows for selected course
     */
    const fetchTestWindows = useCallback(async (courseId: number) => {
        if (!courseId) {
            console.log('No course ID provided, skipping fetch');
            return;
        }
        
        try {
            console.log('Fetching test windows for course:', courseId);
            setLoading(true);
            
            const res = await apiHandler(
                undefined,
                'GET',
                `api/test-window/course/${courseId}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );
            
            if (res?.error) {
                console.error('Failed to fetch test windows:', res);
                setTestWindows([]);
                setCalendarEvents([]);
                return;
            }
            
            const testWindowsData = Array.isArray(res) ? res : [];
            console.log(`Fetched ${testWindowsData.length} test windows`);
            
            // Only update state if data has actually changed
            setTestWindows(prevTestWindows => {
                if (prevTestWindows.length !== testWindowsData.length) {
                    console.log('Test windows count changed, updating state');
                    return testWindowsData;
                }
                
                // Check if any test window data has changed
                const hasChanges = testWindowsData.some((newTw, index) => {
                    const oldTw = prevTestWindows[index];
                    return !oldTw || 
                           oldTw.testWindowId !== newTw.testWindowId ||
                           oldTw.testWindowTitle !== newTw.testWindowTitle ||
                           oldTw.testWindowStartDate !== newTw.testWindowStartDate ||
                           oldTw.testWindowEndDate !== newTw.testWindowEndDate;
                });
                
                if (hasChanges) {
                    console.log('Test windows data changed, updating state');
                    return testWindowsData;
                }
                
                console.log('No changes detected, skipping state update');
                return prevTestWindows;
            });
            
        } catch (e) {
            console.error('Error fetching test windows:', e);
            setTestWindows([]);
            setCalendarEvents([]);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.accessToken]);

    /**
     * Convert test windows to calendar events
     */
    const convertTestWindowsToEvents = useCallback((testWindows: any[]) => {
        const events: any[] = [];
        
        // Color palette for test windows (in order)
        const colorPalette = [
            { bg: '#3b82f6', border: '#1d4ed8', text: '#000000' }, // Blue
            { bg: '#10b981', border: '#059669', text: '#000000' }, // Green
            { bg: '#f97316', border: '#ea580c', text: '#000000' }, // Orange
            { bg: '#ec4899', border: '#db2777', text: '#000000' }, // Pink
            { bg: '#ffffff', border: '#d1d5db', text: '#000000' }, // White
        ];
        
        testWindows.forEach((testWindow, index) => {
            // Get color for this test window (cycle through palette)
            const colorIndex = index % colorPalette.length;
            const colors = colorPalette[colorIndex];
            
            console.log(`Test window ${index + 1}: "${testWindow.testWindowTitle}" assigned color ${colorIndex} (${colors.bg})`);
            
            try {
                // Parse weekdays pattern
                const weekdays = JSON.parse(testWindow.weekdays || '{}');
                const activeDays = Object.keys(weekdays).filter(day => weekdays[day]);
                
                console.log(`Weekdays object for "${testWindow.testWindowTitle}":`, weekdays);
                console.log(`Active days:`, activeDays);
                
                if (activeDays.length === 0) {
                    // No recurring pattern - skip this test window (don't show on calendar)
                    console.log(`Skipping test window with no weekday pattern: "${testWindow.testWindowTitle}"`);
                    console.log(`Date: ${testWindow.testWindowStartDate} to ${testWindow.testWindowEndDate}`);
                    console.log(`Reason: No active weekdays selected`);
                } else {
                    // Create recurring events for each active day
                    // Parse dates in local timezone to avoid UTC conversion issues
                    const [startYear, startMonth, startDay] = testWindow.testWindowStartDate.split('-').map(Number);
                    const [endYear, endMonth, endDay] = testWindow.testWindowEndDate.split('-').map(Number);
                    
                    const startDate = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
                    const endDate = new Date(endYear, endMonth - 1, endDay);
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    
                    console.log(`Processing recurring test window: "${testWindow.testWindowTitle}"`);
                    console.log(`Date range: ${testWindow.testWindowStartDate} to ${testWindow.testWindowEndDate}`);
                    console.log(`Active days:`, activeDays);
                    console.log(`Parsed start date:`, startDate.toDateString());
                    console.log(`Parsed end date:`, endDate.toDateString());
                    
                    // Generate events for each day in the range
                    const currentDate = new Date(startDate);
                    let eventCount = 0;
                    while (currentDate <= endDate) {
                        const dayIndex = currentDate.getDay();
                        const dayName = dayNames[dayIndex];
                        
                        // Format date as YYYY-MM-DD in local timezone
                        const year = currentDate.getFullYear();
                        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                        const day = String(currentDate.getDate()).padStart(2, '0');
                        const dateStr = `${year}-${month}-${day}`;
                        
                        console.log(`  Checking ${dayName} (${dateStr}): weekdays[${dayName}] = ${weekdays[dayName]}`);
                        
                        if (weekdays[dayName]) {
                            const startDateTime = `${dateStr}T${testWindow.testStartTime}`;
                            const endDateTime = `${dateStr}T${testWindow.testEndTime}`;
                            
                            eventCount++;
                            console.log(`  Creating event ${eventCount} for ${dayName} (${dateStr}): ${startDateTime} - ${endDateTime}`);
                            
                            events.push({
                                id: `test-window-${testWindow.testWindowId}-${dateStr}`,
                                title: testWindow.testWindowTitle,
                                start: startDateTime,
                                end: endDateTime,
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                                textColor: colors.text,
                                extendedProps: {
                                    description: testWindow.description,
                                    courseId: testWindow.courseId,
                                    isActive: testWindow.isActive,
                                    type: 'test-window',
                                    originalId: testWindow.testWindowId,
                                    colorIndex: colorIndex
                                }
                            });
                        }
                        
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                    console.log(`  Total events created for "${testWindow.testWindowTitle}": ${eventCount}`);
                }
            } catch (e) {
                console.error('Error processing test window:', testWindow, e);
            }
        });
        
        console.log('Converted test windows to events:', events);
        console.log(`Total events created: ${events.length}`);
        console.log('Events by test window:');
        events.forEach((event, index) => {
            console.log(`Event ${index + 1}:`, {
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                backgroundColor: event.backgroundColor,
                originalId: event.extendedProps?.originalId || 'single-event'
            });
        });
        return events;
    }, []);

    /**
     * Used to handle session hydration
     */
    useEffect(() => {
        if (session) {
            setSession(() => ({
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            }));
            setSessionReady(prev => prev || userSession.id !== "");
        }
    }, [session, status]);

    // Fetch courses when session is ready
    useEffect(() => {
        if (sessionReady) {
            fetchInstructorCourses();
        }
    }, [sessionReady, fetchInstructorCourses]);

    // Fetch test windows when course is selected
    useEffect(() => {
        if (selectedCourseId) {
            fetchTestWindows(selectedCourseId);
        } else {
            setTestWindows([]);
            setCalendarEvents([]);
        }
    }, [selectedCourseId, fetchTestWindows]);

    // Convert test windows to calendar events when test windows change
    useEffect(() => {
        if (testWindows.length > 0) {
            console.log('Converting test windows to events. Test windows count:', testWindows.length);
            const events = convertTestWindowsToEvents(testWindows);
            console.log('Setting calendar events:', events.length, 'events');
            
            // Only update calendar events if they've actually changed
            setCalendarEvents(prevEvents => {
                if (prevEvents.length !== events.length) {
                    console.log('Event count changed, updating calendar events');
                    return events;
                }
                
                // Check if any event has changed
                const hasChanges = events.some((newEvent, index) => {
                    const oldEvent = prevEvents[index];
                    return !oldEvent || 
                           oldEvent.id !== newEvent.id ||
                           oldEvent.title !== newEvent.title ||
                           oldEvent.start !== newEvent.start ||
                           oldEvent.end !== newEvent.end;
                });
                
                if (hasChanges) {
                    console.log('Event data changed, updating calendar events');
                    return events;
                }
                
                console.log('No event changes detected, skipping calendar update');
                return prevEvents;
            });
        } else {
            console.log('No test windows, clearing calendar events');
            setCalendarEvents([]);
        }
    }, [testWindows, convertTestWindowsToEvents]);

    // Debug calendar events when they change (reduced logging for performance)
    useEffect(() => {
        console.log('Calendar events updated:', calendarEvents.length, 'events');
    }, [calendarEvents]);

    /**
     * Handle course selection change
     */
    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const courseId = parseInt(e.target.value);
        setSelectedCourseId(courseId);
    };


    // State for calendar time selection
    const [selectedTimeData, setSelectedTimeData] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        courseId: selectedCourseId
    });

    /**
     * Handle calendar event creation (drag and drop)
     * @param info Calendar selection info
     */
    const handleEventCreate = (info: { start: string; end: string; allDay: boolean }) => {
        const startDate = new Date(info.start);
        const endDate = new Date(info.end);
        
        // Format dates in local timezone to avoid UTC conversion issues
        const formatLocalDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        const timeData = {
            startDate: formatLocalDate(startDate),
            endDate: formatLocalDate(endDate),
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5),
            courseId: selectedCourseId
        };
        
        console.log('Calendar drag detected:', info);
        console.log('Processed time data:', timeData);
        
        // Store the selected time range with selected course
        setSelectedTimeData(timeData);
        
        // Open the modal
        setIsModalOpen(true);
    };

    /**
     * Handle calendar event click
     * @param info Event click info
     */
    const handleEventClick = (info: any) => {
        console.log('Event clicked:', info.event);
        const event = info.event;
        const props = event.extendedProps;
        
        if (props?.type === 'test-window') {
            toast.info(`Test Window: ${event.title}\nDescription: ${props.description || 'No description'}\nActive: ${props.isActive ? 'Yes' : 'No'}`, {
                autoClose: 5000,
                style: {
                    whiteSpace: 'pre-line'
                }
            });
        } else {
            toast.info(`Clicked on: ${event.title}`);
        }
    };

    const handleTestWindowCreated = async () => {
        setIsModalOpen(false);
        toast.success('Test window created successfully!');
        
        // Refresh test windows for the selected course
        if (selectedCourseId) {
            console.log('Refreshing test windows after creation for course:', selectedCourseId);
            console.log('Current test windows before refresh:', testWindows.length);
            
            // Single refresh with a small delay to ensure backend processing
            setTimeout(async () => {
                console.log('Starting refresh after test window creation...');
                await fetchTestWindows(selectedCourseId);
                console.log('Refresh completed');
            }, 500); // Reduced delay to 500ms
        }
    };

    // Get selected course name for display
    const selectedCourse = courses.find(course => course.courseId === selectedCourseId);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-mentat-gold">Loading page...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-red-400">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-mentat-gold/20">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-mentat-gold">Test Window Management</h1>
                    {selectedCourseId && testWindows.length > 0 && (
                        <span className="text-xs text-mentat-gold/70">
                            {testWindows.length} test window{testWindows.length !== 1 ? 's' : ''} found
                        </span>
                    )}
                </div>
                
                {/* Course Selection */}
                <div className="flex items-center gap-3">
                    <label htmlFor="course-select" className="text-sm font-medium text-mentat-gold">
                        Select Course:
                    </label>
                    <select
                        id="course-select"
                        value={selectedCourseId || ''}
                        onChange={handleCourseChange}
                        className="px-3 py-2 bg-white/5 text-mentat-gold border border-mentat-gold/20 rounded-md focus:border-mentat-gold/60 focus:ring-0 focus:outline-none"
                    >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                            <option key={course.courseId} value={course.courseId}>
                                {course.courseName} - {course.courseSection} ({course.courseQuarter} {course.courseYear})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Calendar */}
            <div className="flex-1 p-2">
                <Calendar
                    // The key is used to force a re-render of the calendar when the selected course id changes
                    key={`calendar-${selectedCourseId}-${calendarEvents.length}`}
                    events={calendarEvents}
                    onDateClick={({ dateStr }) => setIsModalOpen(true)}
                    // Passes the function to handle event creation
                    onEventCreate={handleEventCreate}
                    // Passes the function to handle event click
                    onEventClick={handleEventClick}
                    // Passes the initial view of the calendar
                    initialView="timeGridWeek"
                    // Passes the editable state of the calendar
                    editable={true}
                    // Passes the selectable state of the calendar
                    selectable={true}
                />
            </div>

            {/* Create Test Window Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Create Test Window"
            >
                <CreateTestWindow
                    // Passes the courses to the CreateTestWindow component
                    courses={courses}
                    // Passes the selected course id to the CreateTestWindow component
                    selectedCourseId={selectedCourseId}
                    // Passes the selected time data from calendar drag
                    initialFormData={{
                        ...selectedTimeData,
                        courseId: selectedTimeData.courseId || undefined
                    }}
                    // Passes function to handle test window creation
                    onTestWindowCreated={handleTestWindowCreated}
                    // Passes function to handle cancel
                    onCancel={() => {
                        setIsModalOpen(false);
                    }}
                />
            </Modal>

            {/* Toast Container */}
            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}