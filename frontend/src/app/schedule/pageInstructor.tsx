"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { useSession } from 'next-auth/react'
import Modal from "@/components/UI/calendar/Modal";
import Popover from "@/components/UI/calendar/Popover";
import Calendar from "@/components/UI/calendar/Calendar";
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
    const [calendarApi, setCalendarApi] = useState<any>(null);
    const scrollPositionRef = useRef<number | null>(null);
    const savedCalendarStateRef = useRef<{
        date: Date | null;
        view: string | null;
        scrollTop: number | null;
    }>({
        date: null,
        view: null,
        scrollTop: null
    });


    // Helper to persist current calendar view and scroll position
    const saveCalendarState = useCallback(() => {
        if (!calendarApi) return;
        const currentDate = calendarApi.getDate();
        const currentView = calendarApi.view.type;
        const scroller = document.querySelector('.fc .fc-timegrid-body .fc-scroller') as HTMLElement | null;
        const currentScrollTop = scroller ? scroller.scrollTop : null;

        savedCalendarStateRef.current = {
            date: currentDate,
            view: currentView,
            scrollTop: currentScrollTop
        };

        console.log('Saved calendar state (helper):', {
            date: currentDate.toISOString(),
            view: currentView,
            scrollTop: currentScrollTop
        });
    }, [calendarApi]);

    // Helper to restore previously saved calendar view and scroll position
    const restoreCalendarState = useCallback(() => {
        if (!calendarApi) return;
        const { date, view, scrollTop } = savedCalendarStateRef.current;
        if (!date) return;

        try {
            if (view) {
                calendarApi.changeView(view, date);
                console.log('Restored calendar view:', view, date.toISOString());
            } else {
                calendarApi.gotoDate(date);
                console.log('Restored calendar date:', date.toISOString());
            }
        } catch (e) {
            console.warn('Failed to restore calendar view/date immediately, will retry scroll only.', e);
        }

        if (scrollTop !== null) {
            const attemptRestoreScroll = () => {
                const newScroller = document.querySelector('.fc .fc-timegrid-body .fc-scroller') as HTMLElement | null;
                if (newScroller) {
                    newScroller.scrollTop = scrollTop;
                    return true;
                }
                return false;
            };

            // Try immediately and then with small delays to account for DOM updates
            if (!attemptRestoreScroll()) {
                [30, 80, 150, 300, 600].forEach((delay) => {
                    setTimeout(() => {
                        attemptRestoreScroll();
                    }, delay);
                });
            }
        }
    }, [calendarApi]);


    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Session information
    const { data: session, status } = useSession()
    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteScope, setDeleteScope] = useState<'single' | 'following' | 'all'>('single');

    const handleConfirmDelete = async () => {
        if (!activeTestWindow) return;
        try {
            // Persist current calendar position before any updates
            saveCalendarState();
            if (deleteScope === 'all') {
                // Call backend to delete entire test window series
                const res = await apiHandler(
                    undefined,
                    'DELETE',
                    `api/test-window/${activeTestWindow.id}`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );

                if (res?.error) {
                    toast.error(res.message || 'Failed to delete test window');
                } else {
                    // Optimistically remove from UI to avoid full rerender
                    setCalendarEvents((prev) => prev.filter(e => e.extendedProps?.originalId !== activeTestWindow.id));
                    setTestWindows((prev) => prev.filter(tw => tw.testWindowId !== activeTestWindow.id));
                    // Show longer success toast and avoid interruption
                    toast.success('Test window deleted', { autoClose: 5000 });
                    // Restore the calendar state immediately after optimistic update
                    restoreCalendarState();
                    // Silent background refresh to ensure consistency
                    if (selectedCourseId) {
                        fetchTestWindows(selectedCourseId, { silent: true }).then(() => {
                            // Re-apply restoration after the background fetch updates events
                            restoreCalendarState();
                        });
                    }
                }
            } else if (deleteScope === 'single') {
                // Use the date from the clicked event stored earlier
                if (!activeTestWindow?.clickedDate) {
                    toast.error('Could not find the clicked event date');
                    return;
                }
                const eventDateStr = activeTestWindow.clickedDate;

                // Backend: add this date to exceptions array
                const res = await apiHandler(
                    { date: eventDateStr },
                    'PATCH',
                    `api/test-window/${activeTestWindow.id}/add-exception`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );

                if (res?.error) {
                    toast.error(res.message || 'Failed to delete this event');
                } else {
                    // Optimistically remove only this date's occurrences for this window
                    setCalendarEvents((prev) => prev.filter(e =>
                        !(e.extendedProps?.originalId === activeTestWindow.id && typeof e.start === 'string' && e.start.startsWith(eventDateStr))
                    ));
                    toast.success('Current day test window successfully deleted', { autoClose: 5000 });
                    // Restore calendar state post optimistic update
                    restoreCalendarState();

                    // Silent background refresh
                    if (selectedCourseId) {
                        fetchTestWindows(selectedCourseId, { silent: true }).then(() => {
                            restoreCalendarState();
                        });
                    }
                }
            } else if (deleteScope === 'following') {
                // Use the stored clicked date from the event click
                if (!activeTestWindow?.clickedDate) {
                    toast.error('Could not find the clicked event date');
                    return;
                }
            
                // Since endDate is inclusive, we need to set it to one day BEFORE the clicked date
                // This way the clicked date and all following dates will be deleted
                // Parse the date in local timezone to avoid UTC conversion issues
                const [year, month, day] = activeTestWindow.clickedDate.split('-').map(Number);
                const clickedDate = new Date(year, month - 1, day); // month is 0-indexed
                clickedDate.setDate(clickedDate.getDate() - 1);
                
                // Format back to YYYY-MM-DD in local timezone
                const eventYear = clickedDate.getFullYear();
                const eventMonth = String(clickedDate.getMonth() + 1).padStart(2, '0');
                const eventDay = String(clickedDate.getDate()).padStart(2, '0');
                const eventDateStr = `${eventYear}-${eventMonth}-${eventDay}`;
                
                console.log('!!!!!!Clicked date:', activeTestWindow.clickedDate);
                console.log('!!!!!!Setting endDate to (one day before):', eventDateStr);
            
                // For "This and following events", set endDate to the clicked event date
                // This will keep all events before and including the clicked event
                const res = await apiHandler(
                    { endDate: eventDateStr },
                    'PATCH',
                    `api/test-window/${activeTestWindow.id}/update-end-date`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );
            
                if (res?.error) {
                    toast.error(res.message || 'Failed to delete future events');
                } else {
                    // Optimistically remove future events from UI
                    setCalendarEvents((prev) => prev.filter(e =>
                        !(e.extendedProps?.originalId === activeTestWindow.id && 
                          e.start >= eventDateStr)
                    ));
                    toast.success('Future events deleted successfully');
                    // Restore calendar state post optimistic update
                    restoreCalendarState();
                    
                    // Silent background refresh
                    if (selectedCourseId) {
                        fetchTestWindows(selectedCourseId, { silent: true }).then(() => {
                            restoreCalendarState();
                        });
                    }
                }
            } else {
                toast.info('Only "All events" and "This event" are implemented right now.');
            }
        } catch (e) {
            toast.error('Error deleting test window');
        } finally {
            setDeleteModalOpen(false);
        }
    };


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
    const fetchTestWindows = useCallback(async (courseId: number, options?: { silent?: boolean }) => {
        if (!courseId) {
            console.log('No course ID provided, skipping fetch');
            return;
        }

        try {
            console.log('Fetching test windows for course:', courseId);
            // If not silent, set loading to true
            if (!options?.silent) {
                setLoading(true);
            }

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
            // If not silent, set loading to false
            if (!options?.silent) {
                setLoading(false);
            }
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
                // Parse weekdays pattern and exceptions
                const weekdays = JSON.parse(testWindow.weekdays || '{}');
                let exceptions: string[] = [];
                try {
                    const raw = testWindow.exceptions;
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) {
                            exceptions = parsed;
                        }
                    }
                } catch (_) {
                    // ignore malformed exceptions
                }
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

                        // Skip if date is in exceptions
                        const isException = exceptions.includes(dateStr);
                        if (weekdays[dayName] && !isException) {
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

            // Restore saved calendar state after DOM updates
            if (calendarApi && savedCalendarStateRef.current.date) {
                const { date, view, scrollTop } = savedCalendarStateRef.current;

                console.log('Restoring saved calendar state:', {
                    date: date?.toISOString(),
                    view,
                    scrollTop
                });

                // Restore date view first
                if (view) {
                    calendarApi.changeView(view, date);
                    console.log('Restored date view:', date?.toISOString(), view);
                }

                // Restore scroll position with multiple attempts
                if (scrollTop !== null) {
                    const restoreScroll = () => {
                        const newScroller = document.querySelector('.fc .fc-timegrid-body .fc-scroller') as HTMLElement | null;
                        if (newScroller) {
                            newScroller.scrollTop = scrollTop;
                            console.log('Restored scroll position:', scrollTop);
                            return true;
                        }
                        return false;
                    };

                    // Multiple restoration attempts
                    [50, 150, 300, 500, 1000].forEach(delay => {
                        setTimeout(() => {
                            restoreScroll();
                        }, delay);
                    });
                }
            }
        } else {
            console.log('No test windows, clearing calendar events');
            setCalendarEvents([]);
        }
    }, [testWindows, convertTestWindowsToEvents, calendarApi]);

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
        // Save current calendar state before opening modal
        if (calendarApi) {
            const currentDate = calendarApi.getDate();
            const currentView = calendarApi.view.type;
            const scroller = document.querySelector('.fc .fc-timegrid-body .fc-scroller') as HTMLElement | null;
            const currentScrollTop = scroller ? scroller.scrollTop : null;

            savedCalendarStateRef.current = {
                date: currentDate,
                view: currentView,
                scrollTop: currentScrollTop
            };

            console.log('Saved calendar state before modal open:', {
                date: currentDate.toISOString(),
                view: currentView,
                scrollTop: currentScrollTop
            });
        }

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
        // Persist current calendar position on event click to allow restoration after updates
        saveCalendarState();
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

    // Popover state and actions
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [popoverAnchor, setPopoverAnchor] = useState<{ x: number; y: number } | null>(null);
    const [activeTestWindow, setActiveTestWindow] = useState<{ id: number; title: string; clickedDate?: string } | null>(null);

    const closePopover = () => {
        setIsPopoverOpen(false);
        // Do not clear anchor immediately to allow close animation potential; safe to clear
        setPopoverAnchor(null);
    };

    const handleModifySettings = () => {
        if (!activeTestWindow) return;
        toast.info(`Modify settings for "${activeTestWindow.title}" (id: ${activeTestWindow.id})`);
        closePopover();
    };

    const handleDeleteTestWindow = () => {
        if (!activeTestWindow) return;
        // Persist calendar position before opening delete modal
        saveCalendarState();
        // Open delete confirmation modal with scope options
        setDeleteModalOpen(true);
        closePopover();
    };

    const handleControlAllowedTests = () => {
        if (!activeTestWindow) return;
        toast.info(`Control allowed tests for "${activeTestWindow.title}" (id: ${activeTestWindow.id})`);
        closePopover();
    };

    // Get selected course name for display
    const selectedCourse = courses.find(course => course.courseId === selectedCourseId);

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
            <div className="flex-1 p-2 min-h-0">
                <Calendar
                    events={calendarEvents}
                    onDateClick={({ dateStr }) => {
                        // Save calendar state before opening modal
                        if (calendarApi) {
                            const currentDate = calendarApi.getDate();
                            const currentView = calendarApi.view.type;
                            const scroller = document.querySelector('.fc .fc-timegrid-body .fc-scroller') as HTMLElement | null;
                            const currentScrollTop = scroller ? scroller.scrollTop : null;

                            savedCalendarStateRef.current = {
                                date: currentDate,
                                view: currentView,
                                scrollTop: currentScrollTop
                            };

                            console.log('Saved calendar state before modal open (date click):', {
                                date: currentDate.toISOString(),
                                view: currentView,
                                scrollTop: currentScrollTop
                            });
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
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete test window"
            >
                <div className="space-y-4">
                    <p className="text-sm text-mentat-gold/80">
                        Choose what to delete. This action cannot be undone.
                    </p>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-md p-2">
                            <input
                                type="radio"
                                name="delete-scope"
                                value="single"
                                checked={deleteScope === 'single'}
                                onChange={() => setDeleteScope('single')}
                                className="accent-red-500"
                            />
                            <span>This event</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-md p-2">
                            <input
                                type="radio"
                                name="delete-scope"
                                value="following"
                                checked={deleteScope === 'following'}
                                onChange={() => setDeleteScope('following')}
                                className="accent-red-500"
                            />
                            <span>This and following events</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-md p-2">
                            <input
                                type="radio"
                                name="delete-scope"
                                value="all"
                                checked={deleteScope === 'all'}
                                onChange={() => setDeleteScope('all')}
                                className="accent-red-500"
                            />
                            <span>All events</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-mentat-gold/10">
                        <button
                            className="px-4 py-2 rounded-md text-sm hover:bg-white/5"
                            onClick={() => setDeleteModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 rounded-md text-sm bg-red-600 hover:bg-red-500 text-white"
                            onClick={handleConfirmDelete}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Test Window Context Popover */}
            <Popover
                isOpen={isPopoverOpen}
                anchor={popoverAnchor}
                onClose={closePopover}
            >
                <div className="min-w-[220px] p-1">
                    <div className="px-3 py-2 text-sm font-semibold text-mentat-gold/80 border-b border-mentat-gold/10">
                        {activeTestWindow?.title || 'Test Window'}
                    </div>
                    <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                        onClick={handleModifySettings}
                    >
                        Modify settings
                    </button>
                    <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
                        onClick={handleControlAllowedTests}
                    >
                        Control allowed tests
                    </button>
                    <button
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        onClick={handleDeleteTestWindow}
                    >
                        Delete test window
                    </button>
                </div>
            </Popover>

            {/* Toast Container */}
            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}