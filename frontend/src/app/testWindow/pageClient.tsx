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
        if (!courseId) return;
        
        try {
            console.log('Fetching test windows for course:', courseId);
            
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
                return;
            }
            
            console.log('Test windows response:', res);
            setTestWindows(Array.isArray(res) ? res : []);
            
        } catch (e) {
            console.error('Error fetching test windows:', e);
            setTestWindows([]);
        }
    }, [session?.user?.accessToken]);

    /**
     * Convert test windows to calendar events
     */
    const convertTestWindowsToEvents = useCallback((testWindows: any[]) => {
        const events: any[] = [];
        
        testWindows.forEach((testWindow) => {
            try {
                // Parse weekdays pattern
                const weekdays = JSON.parse(testWindow.weekdays || '{}');
                const activeDays = Object.keys(weekdays).filter(day => weekdays[day]);
                
                if (activeDays.length === 0) {
                    // No recurring pattern, create single event
                    const startDateTime = `${testWindow.testWindowStartDate}T${testWindow.testStartTime}`;
                    const endDateTime = `${testWindow.testWindowEndDate}T${testWindow.testEndTime}`;
                    
                    events.push({
                        id: `test-window-${testWindow.testWindowId}`,
                        title: testWindow.testWindowTitle,
                        start: startDateTime,
                        end: endDateTime,
                        backgroundColor: '#3b82f6',
                        borderColor: '#1d4ed8',
                        textColor: '#000000',
                        extendedProps: {
                            description: testWindow.description,
                            courseId: testWindow.courseId,
                            isActive: testWindow.isActive,
                            type: 'test-window'
                        }
                    });
                } else {
                    // Create recurring events for each active day
                    const startDate = new Date(testWindow.testWindowStartDate);
                    const endDate = new Date(testWindow.testWindowEndDate);
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    
                    // Generate events for each day in the range
                    const currentDate = new Date(startDate);
                    while (currentDate <= endDate) {
                        const dayIndex = currentDate.getDay();
                        const dayName = dayNames[dayIndex];
                        
                        if (weekdays[dayName]) {
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const startDateTime = `${dateStr}T${testWindow.testStartTime}`;
                            const endDateTime = `${dateStr}T${testWindow.testEndTime}`;
                            
                            events.push({
                                id: `test-window-${testWindow.testWindowId}-${dateStr}`,
                                title: testWindow.testWindowTitle,
                                start: startDateTime,
                                end: endDateTime,
                                backgroundColor: '#3b82f6',
                                borderColor: '#1d4ed8',
                                textColor: '#000000',
                                extendedProps: {
                                    description: testWindow.description,
                                    courseId: testWindow.courseId,
                                    isActive: testWindow.isActive,
                                    type: 'test-window',
                                    originalId: testWindow.testWindowId
                                }
                            });
                        }
                        
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            } catch (e) {
                console.error('Error processing test window:', testWindow, e);
            }
        });
        
        console.log('Converted test windows to events:', events);
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
            const events = convertTestWindowsToEvents(testWindows);
            setCalendarEvents(events);
        } else {
            setCalendarEvents([]);
        }
    }, [testWindows, convertTestWindowsToEvents]);


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
        
        const timeData = {
            startDate: startDate.toISOString().slice(0, 10),
            endDate: endDate.toISOString().slice(0, 10),
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

    const handleTestWindowCreated = () => {
        setIsModalOpen(false);
        toast.success('Test window created successfully!');
        // Refresh test windows for the selected course
        if (selectedCourseId) {
            fetchTestWindows(selectedCourseId);
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
                    events={calendarEvents}
                    onDateClick={({ dateStr }) => setIsModalOpen(true)}
                    onEventCreate={handleEventCreate}
                    onEventClick={handleEventClick}
                    initialView="timeGridWeek"
                    editable={true}
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
                    onTestWindowCreated={() => {
                        setIsModalOpen(false);
                        toast.success('Test window created successfully!');
                    }}
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