"use client";
import React, { useState, useEffect, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { useSession } from 'next-auth/react';
import Modal from "@/components/services/Modal";
import Calendar from "@/components/UI/calendar/Calendar";
import CreateTestWindow from "@/app/createTestWindow/pageClient";

// Import our extracted hooks and components
import { useCalendarState } from './hooks/useCalendarState';
import { useInstructorCourses, useTestWindows } from './hooks/useTestWindowData';
import { useDeleteActions } from './hooks/useDeleteActions';
import { CourseSelector } from './components/CourseSelector';
import { DeleteModal } from './components/DeleteModal';
import { TestWindowPopover } from './components/TestWindowPopover';
import { convertTestWindowsToEvents, processEventCreateData } from './utils/calendarHelpers';

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

/**
 * Test Window Page with Course Selection
 * @constructor
 */
export default function TestWindowPage() {
    // Session information
    const { data: session, status } = useSession();
    
    // Custom hooks
    const { saveCalendarState, restoreCalendarState } = useCalendarState();
    const { courses, loading: coursesLoading, error, fetchInstructorCourses } = useInstructorCourses(session, status, BACKEND_API || '');
    const { testWindows, loading: testWindowsLoading, fetchTestWindows } = useTestWindows(session, BACKEND_API || '');
    
    // State information
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [calendarApi, setCalendarApi] = useState<any>(null);
    
    // Delete actions hook
    const {
        deleteModalOpen,
        setDeleteModalOpen,
        deleteScope,
        setDeleteScope,
        activeTestWindow,
        setActiveTestWindow,
        handleConfirmDelete,
        handleDeleteTestWindow
    } = useDeleteActions(
        session,
        BACKEND_API || '',
        selectedCourseId,
        fetchTestWindows,
        restoreCalendarState,
        saveCalendarState,
        setCalendarEvents
    );

    // State for calendar time selection
    const [selectedTimeData, setSelectedTimeData] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        courseId: selectedCourseId
    });

    // Popover state
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverAnchor, setPopoverAnchor] = useState<{ x: number; y: number } | null>(null);

    // Fetch courses when session is authenticated
    useEffect(() => {
        console.log('=== SESSION DEBUG ===');
        console.log('Session status:', status);
        console.log('Full session object:', JSON.stringify(session, null, 2));
        console.log('User ID:', session?.user?.id);
        console.log('User type:', session?.user?.userType);
        console.log('Access Token:', session?.user?.accessToken ? 'Present' : 'Missing');
        console.log('Access Token length:', session?.user?.accessToken?.length || 0);
        console.log('Access Token preview:', session?.user?.accessToken?.substring(0, 20) + '...');
        console.log('===================');
        
        if (status === 'authenticated' && session?.user?.id && session?.user?.accessToken) {
            console.log('Session authenticated with accessToken, fetching courses...');
            fetchInstructorCourses();
        } else {
            console.log('Not fetching courses. Status:', status, 'User ID:', session?.user?.id, 'Access Token:', session?.user?.accessToken ? 'Present' : 'Missing');
        }
    }, [status, session?.user?.id, session?.user?.accessToken, fetchInstructorCourses]);

    // Fetch test windows when course is selected
    useEffect(() => {
        if (selectedCourseId) {
            fetchTestWindows(selectedCourseId);
        } else {
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

            // Restore saved calendar state after DOM updates
            if (calendarApi) {
                // This will be handled by the calendar state restoration logic
            }
        } else {
            console.log('No test windows, clearing calendar events');
            setCalendarEvents([]);
        }
    }, [testWindows, calendarApi]);

    /**
     * Handle course selection change
     */
    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const courseId = parseInt(e.target.value);
        setSelectedCourseId(courseId);
    };

    /**
     * Handle calendar event creation (drag and drop)
     * @param info Calendar selection info
     */
    const handleEventCreate = (info: { start: string; end: string; allDay: boolean }) => {
        // Save current calendar state before opening modal
        if (calendarApi) {
            saveCalendarState(calendarApi);
        }

        const timeData = processEventCreateData(info, selectedCourseId);

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
        // Persist current calendar position on event click to allow restoration after updates
        if (calendarApi) {
            saveCalendarState(calendarApi);
        }
        
        const event = info.event;
        const props = event.extendedProps;

        if (props?.type === 'test-window') {
            // Open context popover anchored to click
            const x = info.jsEvent?.clientX || 0;
            const y = info.jsEvent?.clientY || 0;
            setPopoverAnchor({ x, y });
            
            // Get the clicked event's date from startStr (FullCalendar provides this as a string)
            const clickedDate = event.startStr.split('T')[0];
            
            setActiveTestWindow({
                id: props.originalId,
                title: event.title,
                clickedDate: clickedDate
            });
            setIsPopoverOpen(true);
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

    const closePopover = () => {
        setIsPopoverOpen(false);
        setPopoverAnchor(null);
    };

    const handleModifySettings = () => {
        closePopover();
    };

    const handleControlAllowedTests = () => {
        closePopover();
    };

    const handleDeleteTestWindowClick = () => {
        if (calendarApi) {
            handleDeleteTestWindow(calendarApi);
        }
        closePopover();
    };

    const handleConfirmDeleteClick = () => {
        if (calendarApi) {
            handleConfirmDelete(calendarApi);
        }
    };

    // Error message page when page doesn't load as expected
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
                </div>

                {/* Course Selection */}
                <CourseSelector
                    courses={courses}
                    selectedCourseId={selectedCourseId}
                    onCourseChange={handleCourseChange}
                    testWindowsCount={testWindows.length}
                />
            </div>

            {/* Calendar */}
            <div className="flex-1 p-2 min-h-0">
                <Calendar
                    events={calendarEvents}
                    onDateClick={({ dateStr }) => {
                        // Save calendar state before opening modal
                        if (calendarApi) {
                            saveCalendarState(calendarApi);
                        }
                        setIsModalOpen(true);
                    }}
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
                    // Passes the calendar ready callback
                    onCalendarReady={setCalendarApi}
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

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                deleteScope={deleteScope}
                onDeleteScopeChange={setDeleteScope}
                onConfirmDelete={handleConfirmDeleteClick}
            />

            {/* Test Window Context Popover */}
            <TestWindowPopover
                isOpen={isPopoverOpen}
                anchor={popoverAnchor}
                onClose={closePopover}
                activeTestWindow={activeTestWindow}
                onModifySettings={handleModifySettings}
                onControlAllowedTests={handleControlAllowedTests}
                onDeleteTestWindow={handleDeleteTestWindowClick}
            />

            {/* Toast Container */}
            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}