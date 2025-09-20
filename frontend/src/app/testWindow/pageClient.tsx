"use client";
import React, { useState, useEffect, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { useSession } from 'next-auth/react'
import Modal from "@/app/_components/UI/Modal";
import Calendar from "../_components/UI/Calendar";
import CreateTestWindow from "../_components/testWindow/CreateTestWindow";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

// Course type definition
type Course = {
    courseID: number;
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
    
    const [formData, setFormData] = useState({
        exam_course_id: 1,
        exam_name: "",
        exam_difficulty: "",
        is_published: "",
        is_required: "",
    });

    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Session information
    const { data: session } = useSession()

    // Form Mapping
    const {exam_course_id, exam_name, exam_difficulty, is_published, is_required} = formData;

    /**
     * Fetch instructor courses
     */
    const fetchInstructorCourses = useCallback(async () => {
        if (session?.user?.id) {
            try {
                setLoading(true);
                setError(null);
                
                const res = await apiHandler(
                    undefined,
                    'GET',
                    `course/listCourses?id=${session.user.id}`,
                    `${BACKEND_API}`
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
                    setSelectedCourseId(coursesData[0].courseID);
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
    }, [session]);

    // Fetch courses when session is ready
    useEffect(() => {
        if (sessionReady) {
            fetchInstructorCourses();
        }
    }, [sessionReady, fetchInstructorCourses]);

    // Setting data by name, value, type, and checked value
    const data = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            // Spread data
            ...formData,
            // Override field name's value by type checkbox for correctness
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    /**
     * Handle course selection change
     */
    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const courseId = parseInt(e.target.value);
        setSelectedCourseId(courseId);
    };

    /**
     * Submit button for Form
     * @param event Event from DOM
     */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default events

        // Try wrapper to handle async exceptions
        try {
            console.log(`This is the session info: ${userSession}`)
            let index = 1;
            console.log(`This is the exam course id: ${exam_course_id}`)
            const response = await fetch("http://localhost:8080/api/createExam", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exam_name,
                    is_published: is_published ? 1 : 0,
                    is_required: is_required ? 1 : 0,
                    exam_difficulty,
                    exam_course_id,
                })
            });
            console.log(`This is the response:`);
            console.log(response);
            // Response handler
            if (response.ok) {
                toast.success("Exam created successfully");
                setIsModalOpen(false);
                setFormData({
                    exam_course_id: 1,
                    exam_name: "",
                    exam_difficulty: "",
                    is_published: "",
                    is_required: "",
                });
            } else {
                toast.error("Failed to create exam");
            }
        } catch (error) {
            toast.error("Failed to create exam");
        }
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
    const selectedCourse = courses.find(course => course.courseID === selectedCourseId);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-mentat-gold">Loading courses...</div>
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
            <CreateTestWindow 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onTestWindowCreated={handleTestWindowCreated}
                initialFormData={{
                    ...selectedTimeData,
                    courseId: selectedCourseId || undefined
                }}
                courses={courses}
                selectedCourseId={selectedCourseId}
            />
            
            <div className="flex-1 w-full flex flex-col">
                {/* Course Selection and Instructions - fixed height at top */}
                <div className="mb-2 p-4 bg-mentat-gold/10 rounded-lg border border-mentat-gold/20 flex-shrink-0">
                    <div className="flex items-center justify-between gap-4">
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
                                {courses.map((course) => (
                                    <option key={course.courseID} value={course.courseID}>
                                        {course.courseName} - {course.courseSection} ({course.courseQuarter} {course.courseYear})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Instructions */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-mentat-gold">💡</span>
                            <span className="text-mentat-gold">
                                <strong>Tip:</strong> Click and drag on the calendar to create test windows for <strong>{selectedCourse?.courseName || 'selected course'}</strong>.
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Calendar - takes remaining space */}
                <div className="flex-1 min-h-0">
                    <Calendar
                        events={[
                            { title: 'Exam 1', start: '2025-09-20', id: '1' },
                            { title: 'Exam 2', start: '2025-09-22T14:00:00', id: '2' },
                        ].map((event, index) => ({
                            ...event,
                            key: event.id || `event-${index}` // Add explicit key
                        }))}
                        onDateClick={({ dateStr }) => setIsModalOpen(true)}
                        onEventClick={handleEventClick}
                        onEventCreate={handleEventCreate}
                        initialView="timeGridWeek"
                        editable={true}
                        selectable={true}
                    />
                </div>
            </div>

            <ToastContainer autoClose={3000} hideProgressBar />
        </div>
    );
}