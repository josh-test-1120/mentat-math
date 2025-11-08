"use client";

import React, {useState, useEffect, useMemo} from "react";
import { useRef } from 'react';
import { motion } from "framer-motion";
import { Blocks, FileText, Spotlight, Users } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { useSession } from "next-auth/react";
import { allCourse, CourseSelector } from "@/components/services/CourseSelector";
import Course from "@/components/types/course";
import StudentExamSummary from "@/app/reports/localComponents/StudentExamSummary";
import InstructorExamStatistics from "@/app/reports/localComponents/InstructorExamStatistics";
import MentatCursor from "@/components/services/MentatCursor";

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
        name: '',
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
                name: session?.user.name || '',
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
            } catch (error) {
                console.error('Error fetching report data:', error);
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
        <div>
            {/*<AnimatedPiCursor />*/}
            <MentatCursor />
            {/*Main Area for details of page*/}
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                >
                    {/* Navigation Bar */}
                    <div className="flex justify-center mb-2 -mt-4">
                        <div className="inline-flex bg-card-color border border-mentat-gold/20 rounded-lg p-1
                        shadow-sm shadow-crimson-700/40">
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
                                <Blocks className="w-4 h-4" />
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
                                <Spotlight className="w-4 h-4" />
                                Grade Dashboard
                            </button>
                        </div>
                    </div>
                    {/* Line Divider */}
                    <hr className="border-mentat-gold/20 border-1"></hr>

                    <div className="flex justify-center items-center my-2">
                        <h1 className="text-xl font-bold mb-1 h-full p-2
                        rounded-xl bg-card-color/5"
                        >
                            Instructor Performance Reports
                        </h1>
                        {/*This is the course header*/}
                        <div className="max-w-5xl mx-auto flex justify-end mb-1">
                            {/*This is the Course Selection button*/}
                            {userSession.id !== "" ?
                                (
                                    <React.Fragment>
                                        {filteredCourses.length === 0
                                            ? (
                                                <div>
                                                    <p>Student has no courses</p>
                                                </div>
                                            )
                                            : courses && courses.length > 0 && (
                                            <CourseSelector
                                                courses={courses}
                                                selectedCourseId={course?.courseId}
                                                onCourseChange={(e) => {
                                                    updateCourseHandle(e.target.value);
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                ) : (<React.Fragment/>)
                            }
                        </div>
                    </div>

                    {/* Line Divider */}
                    <hr className="border-crimson border-2 mb-2"></hr>

                    {/*Overflow wrapper container to manage scrolling*/}
                    <div className="overflow-y-auto pt-1 scrollbar-hide max-h-[70vh]">
                        {navFilter === 'summary' ? (
                            <InstructorExamStatistics
                                course={filteredCourses[0]}
                                gradeStrategyNew={undefined}
                            />
                        ) : navFilter === 'grades' ? (
                            <div className="max-w-7xl mx-auto">
                                <StudentExamSummary />
                            </div>
                        ) : navFilter === 'insights' ? (
                            <div className="max-w-7xl mx-auto text-2xl text-center mt-12">
                                Not Implemented
                            </div>
                        ) : navFilter === 'dashboard' ? (
                            <div className="max-w-7xl mx-auto text-2xl text-center mt-12">
                                Not Implemented
                            </div>
                        ) : (
                            <React.Fragment/>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};