"use client";

import React, {useState, useEffect, useMemo} from "react";
import { useRef } from 'react';
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { useSession } from "next-auth/react";
import { allCourse, CourseSelector } from "@/components/services/CourseSelector";
import Course from "@/components/types/course";
import { FileText, Users } from "lucide-react";
import StudentExamSummary from "@/app/reports/localComponents/StudentExamSummary";
import InstructorExamStatistics from "@/app/reports/localComponents/InstructorExamStatistics";

/**
 * Instructor Report Page
 * @constructor
 */
export default function InstructorReport() {
    // These are the session state variables
    const { data: session, status } = useSession();
    // Session user information
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: '',
        accessToken: '',
    });
    // State management
    const [course, setCourse] = useState<Course>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState<string>('');

    // Toggle states
    const [navFilter, setNavFilter] = useState<'grades' | 'summary' | 'insights' | 'dashboard'>('summary');

    // Refresh trigger tracker
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);

    // Needed to get environment variable for Backend API
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const filteredCourses = useMemo(() => {
        if (!courses || courses.length === 0) return [];
        return courses.filter(course => course.courseName === courseFilter);
    }, [courses, courseFilter]);

    /**
     * useAffects for session hydration
     */
    // General effect: Initial session hydration
    useEffect(() => {
        let id = '';
        if (status !== 'authenticated' || !session || hasFetched.current) return;
        // Hydrate session information
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                accessToken: session?.user.accessToken || '',
            };

            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]);

    /**
     * Used to handle actions once session is ready
     */
    useEffect(() => {
        // Exit if session not ready
        if (!sessionReady) return;
        // Wrapper for async function
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                await fetchCourses();
                // avgScore(grades);
            } catch (error) {
                console.error('Error fetching report data:', error);
            }
            finally {
                setRefreshTrigger(prev => prev + 1);
            }
        };
        fetchData();
    }, [sessionReady, userSession.id, hasFetched, refreshTrigger]);

    /**
     * Fetch Courses
     * Implementation for general API handler
     */
    async function fetchCourses() {
        console.log('Fetching data for instructor report page: Course data');
        // setLoading(true);
        // Courses List
        let coursesData: Course[] = [];
        // Exception Wrapper for API handler
        try {
            // Iterate through the course Ids
            const res = await apiHandler(
                undefined,
                'GET',
                `api/course/instructor/${userSession.id}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );
            console.log('Course API response');
            console.log(res);

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching courses:', res.error);
            } else {
                // Get all the courses
                coursesData = res.courses || res || []; // Once grabbed, it is gone
                setCourses(coursesData);
            }
            console.log('This is the courses data:');
            console.log(coursesData);

        } catch (error) {
            console.error('Error fetching student courses:', error as string);
        } finally {
            if (coursesData.length !== 0) {
                // Time to update states
                // First course retried as default
                setCourseFilter(coursesData[0].courseName);
                setCourse(coursesData[0]);
                setCourses(coursesData);
            } else {
                setCourses([]);
            }
        }
    }

    // Handle Course Updates from Course Selector Components
    const updateCourseHandle = async (courseId: string) => {
        // Turn the string into an integer
        let courseIdInt = parseInt(courseId);
        // First case is the default All course
        if (courseIdInt === -1) {
            setCourseFilter('all')
            setCourse(allCourse);
        }
        // This is the
        else {
            let reduced = courses.find(course =>
                course.courseId === courseIdInt);
            console.log(reduced);
            if (reduced) {
                setCourseFilter(reduced.courseName);
                setCourse(reduced);
            }
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Navigation Bar */}
            <div className="flex justify-center mb-6 -mt-4">
                <div className="inline-flex bg-card-color border border-mentat-gold/20 rounded-lg p-1">
                    <button
                        onClick={() => setNavFilter('summary')}
                        className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                            navFilter === 'summary'
                                ? 'bg-crimson text-mentat-gold'
                                : 'text-mentat-gold/70 hover:text-mentat-gold'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Exam Summary
                    </button>
                    <button
                        onClick={() => setNavFilter('grades')}
                        className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                            navFilter === 'grades'
                                ? 'bg-crimson text-mentat-gold'
                                : 'text-mentat-gold/70 hover:text-mentat-gold'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        Student Grades
                    </button>
                    <button
                        onClick={() => setNavFilter('insights')}
                        className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                            navFilter === 'insights'
                                ? 'bg-crimson text-mentat-gold'
                                : 'text-mentat-gold/70 hover:text-mentat-gold'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        Exam Insights
                    </button>
                    <button
                        onClick={() => setNavFilter('dashboard')}
                        className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                            navFilter === 'dashboard'
                                ? 'bg-crimson text-mentat-gold'
                                : 'text-mentat-gold/70 hover:text-mentat-gold'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        Grade Dashboard
                    </button>
                </div>
            </div>

            {/* Course Selection */}
            <div className="flex justify-between items-center mb-6">
            {/*<div className="max-w-5xl mx-auto">*/}
                <h1 className="text-3xl font-bold text-center mb-1">Instructor Summary Report</h1>
                <div className="flex items-center space-x-2">
                    <CourseSelector
                        courses={courses}
                        selectedCourseId={course?.courseId}
                        onCourseChange={(e) => {
                            updateCourseHandle(e.target.value);
                            console.log(courseFilter);
                        }}
                    />
                </div>
            </div>
            {/*Navigation conditional renderer*/}
            {navFilter === 'summary' ? (
                <InstructorExamStatistics
                    courses={filteredCourses}
                    gradeStrategyNew={undefined}
                />
            ) : navFilter === 'grades' ? (
                <div className="max-w-7xl mx-auto">
                    <StudentExamSummary />
                </div>
            ) : (
                <React.Fragment/>
            )}
        </div>
    );
};