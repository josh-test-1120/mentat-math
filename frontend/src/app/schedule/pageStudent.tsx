'use client';

import React, {useState, useEffect, useMemo, useRef} from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion';
import Course from "@/components/types/course";
import Grade from "@/components/types/grade";
import { getExamPropCourse } from "@/app/schedule/localComponents/ExamCard";
import CreateScheduledExam from "@/app/schedule/localComponents/CreateScheduledExam";
import { RingSpinner } from "@/components/UI/Spinners";
import { ExamCardMedium } from "@/app/schedule/localComponents/ExamCard";
import { CourseSelector, allCourse } from "@/components/services/CourseSelector";

/**
 * This component will render a page that shows all
 * exams that a student has attempted. This will include
 * any existing exams taken, and any upcoming exams
 * @constructor
 * @author Joshua Summers
 */
export default function StudentSchedule() {
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
    const [exams, setExams] = useState<Grade[]>([]);
    const [exam, setExam] = useState<Grade>();
    const [course, setCourse] = useState<Course>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    // Modal state checks
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    // Refresh trigger (to re-render page)
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);
    // These are the filter states
    const [filter, setFilter] = useState<'all' | 'MATH260' | 'MATH330' | string>('all');
    // This is the Backend API data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    /**
     * useAffects that bind the page to refreshes and updates
     */
    // General effect: Initial session hydration
    useEffect(() => {
        if (status !== "authenticated") return;
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
        // Exit if session not ready
        if (!sessionReady) return;
        // Otherwise, hydration the data
        const fetchData = async () => {
            hasFetched.current = true;
            setLoading(true);
            // Try - Catch handler
            try {
                // Fetch Exams
                fetchExams(userSession.id);
                // Fetch the courses
                fetchCourses();
            } catch (error) {
                console.error('Error fetching exams and course data:', error);
            } finally {
                setLoading(false);
            }
        };
        // Run the async handler to fetch data
        fetchData();
    }, [userSession, refreshTrigger]);

    /**
     * This is the Memoized list of exams
     * that are filtered based on the filter state and exams
     */
    const filteredExams = useMemo(() => {
        // First filter by class
        let result = filter === 'all'
            ? exams
            : exams.filter(exam => getExamPropCourse(exam) === filter);

        return result;
    }, [filter, exams]);

    /**
     * These is the Memoized list of courses
     * that are filtered based on the filer state and courses
     */
    const filteredCourses = useMemo(() => {
        if (!courses) return;

        let result = filter === 'all'
            ? courses
            : courses.filter(course => course.courseName === filter);

        return result;

    }, [filter, courses]);

    /**
     * This will fetch all the exams that can be scheduled
     * @param id
     */
    const fetchExams = async (id: string) => {
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/exam/result/grades/${id}`,
                `${BACKEND_API}`,
                userSession.accessToken || undefined
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching exams:', res.error);
                setExams([]);
            } else {
                // Convert object to array
                let examsData: Grade[] = [];
                // Get the response data
                examsData = res?.grades || res || [];
                // Ensure it's an array
                examsData = Array.isArray(examsData) ? examsData : [examsData];
                // Set courses to coursesData
                setExams(examsData);
                // Reset the filter to all
                setFilter('all');
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching exams:', e);
            // Set courses to empty array
            setExams([]);
        } finally {
            // Set loading to false
            setLoading(false);
        }
    }

    /**
     * Fetch Courses
     * Implementation for general API handler
     */
    const fetchCourses = async ()=> {
        console.log('Fetching data for instructor exam page: Course data');
        // Courses List
        let coursesData: Course[] = [];
        // Exception Wrapper for API handler
        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/course/enrollments/${userSession.id}`,
                `${BACKEND_API}`,
                userSession.accessToken || undefined
            );

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching courses:', res.error);
            } else {
                coursesData = [
                    ...res
                    ]
            }
        } catch (error) {
            console.error('Error fetching instructor courses:', error as string);
        } finally {
            if (coursesData.length !== 0) {
                setCourses(coursesData);
            } else {
                setCourses([]);
            }
            // Now we are done loading data
            // return the data for immediate use
            return coursesData;
        }
    }

    /**
     * Fetch Course
     * Implementation for course API handler
     * @param courseId
     */
    const fetchCourse = async (courseId: number) => {
        // API Handler call
        try {
            console.log(`Fetching course details for course: ${courseId}...`);
            // API Handler
            const res = await apiHandler(
                undefined,
                "GET",
                `api/course/${courseId}`,
                `${BACKEND_API}`,
                userSession?.accessToken || undefined
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                console.error(res?.message || "Failed to fetch the course");
                setCourse(undefined);
            } else {
                console.log("Successfully fetched the course details!");
                // updateExam(undefined);
                console.log("Course fetch succeeded");
                console.log(res.toString());

                // Convert response to Exam interface object
                const courseData: Course = {
                    courseName: res.courseName,
                    courseId: res.courseId,
                    courseProfessorId: res.courseProfessorId,
                    courseYear: res.courseYear,
                    courseQuarter: res.courseQuarter,
                    courseSection: res.courseSection
                };
                // Set courses to coursesData
                setCourse(courseData);
            }
        } catch (error) {
            console.error('Error fetching course data', error as string);
        } finally {
            // Run the cancel/close callback (if any)
        }
    }

    /**
     * This is the handler to load Scheduled Exam Data
     * @param exam
     * @param e
     */
    const loadScheduledExamData = async (exam: Grade, e: any) => {
        e.preventDefault();
        // Set the exams
        setExam(exam);
        // Adjust modal states
        setIsExamModalOpen(true); // Open modal immediately
        setIsModalLoading(true); // Show spinner inside modal
        // Let's try and fetch the course
        try {
            // Load course data while modal is open
            await fetchCourse(exam.courseId);
        } catch (error) {
            console.error('Failed to load course details:', error);
        } finally {
            setIsModalLoading(false); // Hide spinner when done
        }
    }

    /**
     * This is the handler to update the active course
     * @param courseId
     */
    const updateCourseHandle = async (courseId: string) => {
        // Turn the string into an integer
        let courseIdInt = parseInt(courseId);
        // First case is the default All course
        if (courseIdInt === -1) {
            setFilter('all')
            setCourse(allCourse);
        }
        // This is the
        else {
            let reduced = courses.find(course =>
                course.courseId === courseIdInt);
            console.log(reduced);
            if (reduced) {
                setFilter(reduced.courseName);
                setCourse(reduced);
            }
        }
    }

    return (
        <div className="w-full max-w-screen-2xl px-4 pt-8 pb-2">
            <div className="max-w-5xl mx-auto overflow-y-auto scrollbar-hide">
                {/*Create Scheduled Exam Component*/}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold mb-2">Manage Scheduled Exams</h1>
                        { session?.user?.id && filteredCourses ? (
                            < CreateScheduledExam
                                studentId={session?.user?.id}
                                courses={filteredCourses}
                                updateAction={() => {
                                    // Trigger refresh when modal closes
                                    setRefreshTrigger(prev => prev + 1);
                                }}
                            />
                        ): ( <React.Fragment /> )}

                    </div>
                </header>
                {/*This is the course selector component*/}
                <div className="rounded-xl shadow-sm p-6 pb-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Your Scheduled Exams</h2>
                        { courses && courses.length > 0 && (
                            <CourseSelector
                                courses={courses}
                                selectedCourseId={course?.courseId}
                                onCourseChange={(e) => {
                                    updateCourseHandle(e.target.value);
                                    console.log(filter);
                                }}
                                allDefault={true}
                                />
                        )}
                    </div>
                </div>
                {/* Line Divider */}
                <hr className="border-crimson border-2 mb-2"></hr>
                {/* Card Layout */}
                <div className="shadow-sm p-4 pt-2 max-h-[60vh] min-h-[200px]
                    overflow-y-auto scrollbar-hide"
                >
                    { loading ? (
                        <div className="flex justify-center items-center pt-10">
                            <RingSpinner size={'sm'} color={'mentat-gold'} />
                            <p className="ml-3 text-md text-mentat-gold">Loading scheduled exams...</p>
                        </div>
                    ) : !filteredExams ? (
                            <div className="text-center py-12">
                                No exams found for the selected filter.
                            </div>
                    ) : filteredExams && filteredExams.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            <AnimatePresence>
                                {filteredExams.map((examInst) => (
                                    <ExamCardMedium
                                        key={examInst.examId}
                                        exam={examInst}
                                        index={0}
                                        onclick={(e) => loadScheduledExamData(examInst, e)}
                                        updateAction={() => {
                                            // Trigger refresh when modal closes
                                            setRefreshTrigger(prev => prev + 1);
                                        }}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/*<div className="rounded-xl shadow-sm pt-6 mb-1">*/}
                    {/*    <h2 className="text-xl font-semibold mb-4">Exam Performance Summary</h2>*/}
                    {/*    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">*/}
                    {/*        <div className="p-4 rounded-lg border bg-card-color*/}
                    {/*            shadow-md shadow-crimson-700">*/}
                    {/*            <h3 className="text-lg font-medium mb-2">Passed Student Exams</h3>*/}
                    {/*            <p className="text-3xl font-bold">*/}
                    {/*                {exams.filter(exam => exam.status === 'active').length}*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*        <div className="p-4 rounded-lg border bg-card-color*/}
                    {/*            shadow-md shadow-crimson-700">*/}
                    {/*            <h3 className="text-lg font-medium mb-2">Failed Student Exams</h3>*/}
                    {/*            <p className="text-3xl font-bold">*/}
                    {/*                {exams.filter(exam => exam.status === 'inactive').length}*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*        <div className="p-4 rounded-lg border bg-card-color*/}
                    {/*            shadow-md shadow-crimson-700">*/}
                    {/*            <h3 className="text-lg font-medium mb-2">Average Student Score</h3>*/}
                    {/*            <p className="text-3xl font-bold">*/}
                    {/*                {exams.filter(exam => exam.status === 'active'*/}
                    {/*                    && exam.exam_score !== undefined).length > 0*/}
                    {/*                    ? avgScore(exams) : 0}*/}

                    {/*                /!*{exams.filter(e => e.status === 'completed' && e.exam_score !== undefined).length > 0*!/*/}
                    {/*                /!*    ? Math.round(exams.filter(e => e.status === 'completed' && e.score !== undefined)*!/*/}
                    {/*                /!*            .reduce((acc, e) => acc + (e.score!/e.totalScore * 100), 0) /*!/*/}
                    {/*                /!*        exams.filter(e => e.status === 'completed' && e.score !== undefined).length)*!/*/}
                    {/*                /!*    : 0}%*!/*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};