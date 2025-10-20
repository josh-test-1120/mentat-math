"use client";

import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import {SessionProvider, useSession} from 'next-auth/react'
import Modal from "@/components/services/Modal";
import {Plus, Loader2} from 'lucide-react';


// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

/**
 * Default Schedule Page
 * @constructor
 */
interface CreateExamProps {
    onExamCreated?: () => void;
}

export default function CreateExam({ onExamCreated }: CreateExamProps) {

    // State information
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        examCourseId: "",
        examName: "",
        examDifficulty: "",
        isPublished: "",
        isRequired: "",
        hasExpiration: false,
        examExpirationDate: "",
    });

    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Course-related state
    const [courses, setCourses] = useState<any[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [coursesError, setCoursesError] = useState<string | null>(null);

    // Session information
    const { data: session } = useSession()

    // Form Mapping
    const {examCourseId, examName, examDifficulty, isPublished, isRequired, hasExpiration, examExpirationDate} = formData;

    /**
     * Fetch courses from the backend
     */
    const fetchCourses = async () => {
        if (!session?.user?.accessToken || !userSession.id) return;
        
        setCoursesLoading(true);
        setCoursesError(null);

        try {
            const response = await apiHandler(
                undefined,
                'GET',
                `api/course/listCourses?id=${userSession.id}`,
                `${BACKEND_API}`,
                session.user.accessToken
            );

            if (response?.error) {
                setCoursesError(response.message || 'Failed to fetch courses');
                return;
            }

            const coursesData = Array.isArray(response) ? response : response?.data || [];
            console.log('Courses data received:', coursesData); // Debug log
            setCourses(coursesData);
            
            // Set the first course as default if available
            if (coursesData.length > 0 && !examCourseId) {
                setFormData(prev => ({
                    ...prev,
                    examCourseId: coursesData[0].courseId?.toString() || ""
                }));
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCoursesError('Failed to fetch courses');
        } finally {
            setCoursesLoading(false);
        }
    };

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

    /**
     * Fetch courses when userSession is ready
     */
    useEffect(() => {
        if (userSession.id && session?.user?.accessToken) {
            fetchCourses();
        }
    }, [userSession.id, session?.user?.accessToken]);


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
     * Submit button for Form
     * @param event Event from DOM
     */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default events

        // Try wrapper to handle async exceptions
        try {
            console.log(`This is the session info: ${userSession}`)
            let index = 1;
            console.log(`This is the exam course id: ${examCourseId}`)
            const payload: any = {
                examName: examName,
                examState: isPublished ? 1 : 0,
                examRequired: isRequired ? 1 : 0,
                examDifficulty: parseInt(examDifficulty),
                examCourseId: parseInt(examCourseId),
                examDuration: 1.0, // Default value, as it's not in the form yet
                examOnline: 0, // Default value, as it's not in the form yet
            };
            if (hasExpiration && examExpirationDate) {
                payload.examExpirationDate = examExpirationDate; // ISO date (yyyy-mm-dd)
            }
            
            const response = await apiHandler(
                payload,
                'POST',
                'api/exam/create',
                `${BACKEND_API}`,
                session?.user?.accessToken ?? undefined
            );
            console.log(`This is the response:`);
            console.log(response);
            // Response handler
            if (response?.error) {
                toast.error(response.message || "Failed to create exam");
            } else {
                toast.success("Exam created successfully");
                setIsModalOpen(false);
                setFormData({
                    examCourseId: courses.length > 0 ? courses[0].courseId?.toString() || "" : "",
                    examName: "",
                    examDifficulty: "",
                    isPublished: "",
                    isRequired: "",
                    hasExpiration: false,
                    examExpirationDate: "",
                });
                // Trigger refresh of exam list
                onExamCreated?.();
            }
        } catch (error) {
            toast.error("Failed to create exam");
        }
    };

    return (
        <div className="bg-mentat-black text-mentat-gold">
            <div className="p-6 inline-flex items-center">
                <button
                    className="bg-crimson hover:bg-crimson-700 text-mentat-gold
                        font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
                        inline-flex shadow-sm shadow-mentat-gold-700"
                    onClick={() => setIsModalOpen(true)}
                >
                    <span className="inline-flex items-center mr-1">
                        <Plus className="w-5 h-5" />
                    </span>
                    <span>Create Exam</span>
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Exam">
                <form id="createExamForm" className="w-full space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="examName" className="text-sm">Exam Name</label>
                            <input
                                type="text"
                                id="examName"
                                name="examName"
                                value={examName}
                                onChange={data}
                                required={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                                placeholder="Enter exam name"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="examCourseId" className="text-sm">Exam Course</label>
                            <div className="relative">
                                <select
                                    id="examCourseId"
                                    name="examCourseId"
                                    value={examCourseId}
                                    onChange={data}
                                    required={true}
                                    disabled={coursesLoading}
                                    className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {coursesLoading ? (
                                        <option key="loading" value="">Loading courses...</option>
                                    ) : coursesError ? (
                                        <option key="error" value="">Error loading courses</option>
                                    ) : courses.length === 0 ? (
                                        <option key="no-courses" value="">No courses available</option>
                                    ) : (
                                        courses.map((course: any, index: number) => {
                                            // Debug log for each course - check console to see actual structure
                                            console.log('Course object:', course);
                                            
                                            // Use actual API property names (update these based on console output)
                                            const courseName = course.courseName || 'Unknown Course';
                                            const courseSection = course.courseSection || '';
                                            const courseQuarter = course.courseQuarter || '';
                                            const courseYear = course.courseYear || '';
                                            
                                            const displayText = courseSection && courseQuarter && courseYear 
                                                ? `${courseName} - ${courseSection} (${courseQuarter} ${courseYear})`
                                                : courseName;
                                            console.log("Course id is: " + course.courseId);
                                            
                                            return (
                                                <option key={course.courseId || `course-${index}`} value={course.courseId}>
                                                    {displayText}
                                                </option>
                                            );
                                        })
                                    )}
                                </select>
                                {coursesLoading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-mentat-gold/60" />
                                    </div>
                                )}
                            </div>
                            {coursesError && (
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-red-400 text-xs">{coursesError}</p>
                                    <button
                                        type="button"
                                        onClick={fetchCourses}
                                        className="text-xs text-mentat-gold hover:text-mentat-gold/80 underline"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="examDifficulty" className="text-sm">Exam Difficulty</label>
                            <select
                                id="examDifficulty"
                                name="examDifficulty"
                                value={examDifficulty}
                                onChange={data}
                                required={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 items-center">
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="isRequired"
                                            type="checkbox"
                                            name="isRequired"
                                            checked={Boolean(isRequired)}
                                            onChange={data}
                                            className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
                                        />
                                        <label htmlFor="isRequired" className="select-none">Make Exam Required</label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="isPublished"
                                            type="checkbox"
                                            name="isPublished"
                                            checked={Boolean(isPublished)}
                                            onChange={data}
                                            className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
                                        />
                                        <label htmlFor="isPublished" className="select-none">Publish Exam</label>
                                    </div>
                        </div>
                    </div>

                    {/* Full-width section outside the grid */}
                    <div className="w-full">
                        <div className="mt-2 p-3 rounded-lg border border-mentat-gold/20 bg-white/5">
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="hasExpiration"
                                            type="checkbox"
                                            name="hasExpiration"
                                            checked={Boolean(hasExpiration)}
                                            onChange={data}
                                            className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
                                        />
                                        <label htmlFor="hasExpiration" className="select-none">Set booking expiration</label>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="examExpirationDate" className="text-sm">Expiration Date</label>
                                            <input
                                                id="examExpirationDate"
                                                type="date"
                                                name="examExpirationDate"
                                                value={examExpirationDate}
                                                onChange={data}
                                                disabled={!hasExpiration}
                                                className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                            <p className="mt-2 text-xs text-mentat-gold/70">If unchecked, the exam can be booked at any time.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="bg-crimson hover:bg-crimson-700 text-mentat-gold
                                font-semibold py-2 px-4 rounded-md border border-mentat-gold/20
                                shadow-sm shadow-mentat-gold-700"
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-mentat-gold hover:bg-mentat-gold-700 text-crimson
                                font-bold py-2 px-4 rounded-md shadow-sm shadow-mentat-gold-700"
                            type="submit"
                        >
                            Create Exam
                        </button>
                    </div>
                </form>
            </Modal>

            {/*<ToastContainer autoClose={3000} hideProgressBar />*/}
        </div>
    );
}