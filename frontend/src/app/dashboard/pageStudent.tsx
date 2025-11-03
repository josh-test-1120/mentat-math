'use client';

import React, {useState, useMemo, useEffect, useRef} from 'react';
import { apiHandler } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import Course from '@/components/types/course';
import { useSession } from "next-auth/react";
import Modal from "@/components/services/Modal";
import ExamActionsComponent from "@/app/dashboard/localComponents/ExamActions";
import JoinCourseComponent from "@/app/dashboard/localComponents/JoinCourse";
import { RingSpinner } from "@/components/UI/Spinners";
import { ExamResultExtended } from "@/app/dashboard/types/shared";
import { GradeCardExtended, getExamPropStatus } from "@/app/dashboard/localComponents/GradeCard";

/**
 * This is the Dashboard page for the Students
 * This will include snapshots of upcoming exams
 * and which courses the student has joined
 * @author Joshua Summers
 */
export default function ExamsPage() {
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
    // These are the state variables used in the page
    const [exams, setExams] = useState<ExamResultExtended[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [examResult, setExamResult] = useState<ExamResultExtended>();
    // Loaders
    const [loading, setLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(true);
    // Modal state checks
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    // Refresh trigger (to re-render page)
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);
    // These are the filter states
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');
    // Valid statuses
    const validStatus = ['pending', 'upcoming', 'missing'];
    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    /**
     * This is the filtered Exams memo
     * we use this to cache the state of the array
     * This has a dependecy list that affects
     * when this is recalculated and run
     */
    const filteredExams = useMemo(() => {
        // Wait until exams data is loaded and available
        if (!exams || exams.length === 0) {
            return [];
        }
        // Filter conditions
        let result = filter === 'all'
            ? exams.filter((exam) => {
                const status = getExamPropStatus(exam);
                return validStatus.includes(status);
            }
            ) : filter === 'completed'
                ? exams.filter(exam => exam.status === filter)
                : exams.filter((exam) => {
                    const status = getExamPropStatus(exam);
                    const results = exams.filter(exam => exam.status === filter)
                    return validStatus.includes(status) && results.includes(exam);
                })
        // Return current reduced array
        return result;
    }, [exams, filter]);

    /**
     * useAffects that bind the page to refreshes and updates
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

    // Data load effect: Initial data hydration (after session hydration)
    useEffect(() => {
        console.log('Refresh useEffect');
        // Exit if session not ready
        if (!sessionReady) return;
        // Otherwise, hydration the data
        const fetchData = async () => {
            hasFetched.current = true;
            setLoading(true);
            // Try - Catch handler
            try {
                // Fetch the grades for the student
                fetchGrades(userSession.id);
                // Fetch the enrolled courses for the student
                fetchCourseEnrollments(userSession.id);
            } catch (error) {
                console.error('Error fetching grade and course data:', error);
            } finally {
                setLoading(false);
            }
        };
        // Run the async handler to fetch data
        fetchData();
    }, [sessionReady, userSession.id, hasFetched, refreshTrigger]);

    // Data change effect: Update exams and reload state fields when this state changes
    useEffect(() => {
        if (!exams) return;
        else if (exams && exams.length !== 0) {
            console.log('grades use effects')
            console.log(`use effects: ${exams}`);
        }
    }, [exams]);

    /**
     * These are the variants and settings
     * for the motion feature
     * predominately used in divs for animations
     */
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    /**
     * This will fetch all the Grades (Exam Results) from the database
     * @param id
     */
    const fetchGrades = async (id: string) => {
        // Initialize data repository
        let gradesData: ExamResultExtended[] = [];
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/exam/result/grades/${id}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching grades:', res.error);
                setExams([]);
            } else {
                // Get the response data
                gradesData = res?.grades || res || []; // Once grabbed, it is gone
                // Ensure it's an array
                gradesData = Array.isArray(gradesData) ? gradesData : [gradesData];
                // Add the status to each record
                gradesData = gradesData
                    .map(grade => ({
                        ...grade,
                        status: getExamPropStatus(grade)
                    }));

                console.log('Processed grades data:', gradesData);
                // Set courses to coursesData
                setExams(gradesData);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching grades:', e);
            // Set courses to empty array
            setExams([]);
        } finally {
            // Set loading to false
            setLoading(false);
        }
    };

    /**
     * This will fetch all the Course enrollments for the student
     * @param id
     */
    const fetchCourseEnrollments = async (id: string) => {
        // Initialize data repository
        let coursesData: Course[] = [];
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/course/enrollments/${id}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching courses:', res.error);
                setCourses([]);
            } else {
                // Get the response data
                coursesData = res?.grades || res || []; // Once grabbed, it is gone
                // Ensure it's an array
                coursesData = Array.isArray(coursesData) ? coursesData : [coursesData];
                console.log('Processed courses data:', coursesData);
                // Set courses to coursesData
                setCourses(coursesData);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching courses:', e);
            // Set courses to empty array
            setCourses([]);
        } finally {
            // Set loading to false
            setCoursesLoading(false);
        }
    };

    /**
     * Load the Exam Results for the Modal
     * @param exam
     * @param e
     */
    const loadExamResultDetails =
            async (exam: ExamResultExtended, e : any) => {
        // Prevent default event propogation
        e.preventDefault();
        // Set the current Exam result state
        setExamResult(exam);
        console.log(exam);
        // Now we can open the modal since we set the current Exam
        setIsExamModalOpen(true)
    }

    return (
        <div className="bg-gradient-to-br">
            {/*Course Listing Layout */}
            <div className="max-w-5xl mx-auto mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-semibold">My Enrolled Courses</h1>
                    <button
                        onClick={() => setIsJoinModalOpen(true)}
                        className="font-bold py-2 px-4 rounded-lg transition-all duration-200
                            hover:brightness-110 flex items-center gap-2 shadow-sm shadow-mentat-gold-700"
                        style={{ backgroundColor: '#A30F32' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Join New Course
                    </button>
                </div>

                {coursesLoading && courses.length === 0 ? (
                    <React.Fragment>
                        <p className="mb-4 text-center">Loading Courses...</p>
                    </React.Fragment>
                ) : courses.length === 0 ? (
                    <React.Fragment>
                        <p className="mb-4 text-center">You are not enrolled in any courses yet.</p>
                    </React.Fragment>
                    ) : (
                    <div className="grid gap-4 md:grid-cols-3">
                        {courses.map((c, index) => {
                            // Skip if course is undefined/null
                            if (!c || typeof c !== 'object') {
                                console.warn(`Skipping invalid course at index ${index}:`, c);
                                return null;
                            }

                            return (
                                <div key={c.courseId || index} className="border border-mentat-gold/20
                                rounded-xl p-4 shadow-sm shadow-crimson-700 bg-card-color">
                                    <div className="text-lg font-bold">
                                        {c.courseName || 'Unknown Course'}
                                    </div>
                                    <div className="text-sm mt-1">
                                        Section: {c.courseSection || 'Not specified'}
                                    </div>
                                    <div className="text-sm ">
                                        Quarter: {c.courseQuarter || 'Not specified'} {c.courseYear || ''}
                                    </div>
                                </div>
                            );
                        }).filter(Boolean)} {/* Remove null entries */}
                    </div>
                )}
            </div>
            {/*Exam Listing Layout*/}
            <div className="max-w-5xl mx-auto">
                {/* Line Divider */}
                <hr className="border-crimson border-2 my-6"></hr>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    // className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">Exam Schedule</h1>
                    {/*<p>Manage and view your exam information</p>*/}
                </motion.div>
                {/*Filter buttons*/}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold"></h2>
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                             shadow-sm shadow-mentat-gold-700 ${
                                filter === 'all'
                                    ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                    : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                onClick={() => {
                                    if (filter !== 'all') {
                                        console.log(filter);
                                    }
                                    setFilter('all');
                                }}
                        >
                            All Exams
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                             shadow-sm shadow-mentat-gold-700 ${
                                filter === 'upcoming'
                                    ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                    : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                            onClick={() => setFilter('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                             shadow-sm shadow-mentat-gold-700 ${
                                filter === 'completed'
                                    ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                    : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                             shadow-sm shadow-mentat-gold-700 ${
                                filter === 'pending'
                                    ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                    : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </button>
                    </div>
                </div>
                {/*Exam Results View*/}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl shadow-sm border border-mentat-gold/40 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">
                            {filter.charAt(0).toUpperCase() + filter.slice(1)} Exams
                        </h2>
                        <span className="text-sm">
                          {filteredExams.length} exam(s) found
                        </span>
                    </div>

                    <div className="overflow-y-auto max-h-[250px] scrollbar-hide pt-1">
                        <AnimatePresence mode="wait">
                            {!loading && filteredExams.length > 0 ? (
                                <motion.div
                                    key={`${filter}`}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4 mb-2"
                                >
                                    {filteredExams
                                        .map((exam) => (
                                            <GradeCardExtended
                                                key={exam.examId}
                                                exam={exam}
                                                index={0}
                                                onclick={validStatus.includes(exam.status ?? '')
                                                    ? (e) => loadExamResultDetails(exam, e)
                                                    : undefined}
                                            />
                                        )
                                    )}
                                </motion.div>
                            ) : loading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="flex justify-center items-center">
                                        <RingSpinner size={'sm'} color={'mentat-gold'} />
                                        <p className="ml-3 text-md text-mentat-gold">Loading exams...</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    No exams found for the selected filters
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
            {/* Exam Action Modal */}
            <Modal
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                title="Alter Scheduled Exam"
            >
                <ExamActionsComponent
                    examResult={examResult}
                    cancelAction={() => {
                        setIsExamModalOpen(false);
                        // Trigger refresh when modal closes
                        // setRefreshTrigger(prev => prev + 1);
                    }}
                    updateAction={() => {
                        setIsExamModalOpen(false);
                        // Trigger refresh when modal closes
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />
            </Modal>
            {/* Join Course Modal */}
            <Modal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                title="Join New Course"
            >
                <JoinCourseComponent
                    onJoinSuccess={() => {
                        setIsJoinModalOpen(false);
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />
            </Modal>
        </div>
    );
}