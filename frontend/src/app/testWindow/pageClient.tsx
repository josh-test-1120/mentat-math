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
                
                // Set first course as default if available
                if (coursesData.length > 0) {
                    setSelectedCourseId(coursesData[0].courseId);
                }
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
        
        // Store the selected time range with selected course
        setSelectedTimeData({
            startDate: startDate.toISOString().slice(0, 10),
            endDate: endDate.toISOString().slice(0, 10),
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5),
            courseId: selectedCourseId
        });
        
        // Open the modal
        setIsModalOpen(true);
    };

    /**
     * Handle calendar event click
     * @param info Event click info
     */
    const handleEventClick = (info: any) => {
        console.log('Event clicked:', info.event);
        toast.info(`Clicked on: ${info.event.title}`);
    };

    const handleTestWindowCreated = () => {
        setIsModalOpen(false);
        toast.success('Test window created successfully!');
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
            <div className="flex items-center justify-between p-4 border-b border-mentat-gold/20">
                <h1 className="text-2xl font-bold text-mentat-gold">Test Window Management</h1>
                
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
            <div className="flex-1 p-4">
                <Calendar
                    events={[]}
                    onDateClick={({ dateStr }) => setIsModalOpen(true)}
                    onEventCreate={handleEventCreate}
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
                    courses={courses}
                    selectedCourseId={selectedCourseId}
                    onTestWindowCreated={() => {
                        setIsModalOpen(false);
                        toast.success('Test window created successfully!');
                    }}
                />
            </Modal>

            {/* Toast Container */}
            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}