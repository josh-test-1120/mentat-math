"use client";

import React, {useState, useMemo, useEffect, useRef} from 'react';
import { apiHandler } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProp, Class, ExamResult } from '@/components/types/exams';
import Course  from '@/components/types/course';
import { GradeCardExtended, getGradeStatus } from '@/components/UI/cards/GradeCards';
import { useSession } from "next-auth/react";
import Modal from "@/components/services/Modal";
import ExamActionsComponent from "@/components/UI/exams/ExamActions";
import { GradeChart } from "@/components/UI/reports/StatusChart";
import ExamProgressChart from "@/components/UI/reports/ExamProgressChart";

export interface Report extends ExamResult {
    course_name: string;
    exam_online?: number;
}

export default function StudentReport() {
    // Session states
    const [sessionReady, setSessionReady] = useState(false);
    const { data: session, status } = useSession();
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: '',
        name: ''
    });

    // View data states
    const [grades, setGrades] = useState<Report[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [tests, setTests] = useState([]);
    // const [finalScore, setFinalScore] = useState('');
    const [loading, setLoading] = useState(true);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);

    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
    const [courseFilter, setCourseFilter] = useState<'all' | string>('all');

    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const filteredGrades = useMemo(() => {
        // Wait until grades data is loaded and available
        if (!grades || grades.length === 0) {
            return [];
        }
        // First filter by class
        let result = filter === 'all'
            ? grades
            : grades.filter(grade => grade.status === filter);

        // Then filter by status
        if (filter !== 'all') {
            result = grades.filter(grade => getGradeStatus(grade) === filter);
        }

        return result;
    }, [grades, filter]);

    const filteredCourses = useMemo(() => {
        // Wait until grades data is loaded and available
        if (!courses || courses.length === 0) {
            return [];
        }
        // First filter by course
        let result = courseFilter === 'all'
            ? courses
            : courses.filter(course => course.courseName === courseFilter);

        // // Then filter by status
        // if (courseFilter !== 'all') {
        //     result = grades.filter(grade => getGradeStatus(grade) === filter);
        // }

        return result;
    }, [courses, courseFilter]);

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
     * Used to handle session hydration
     */
    useEffect(() => {
        console.log(`This is the session ready state: ${sessionReady}`)
        // If not authenticated, return
        if (status !== 'authenticated') return;

        if (session) {
            setSession(() => ({
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                name: session?.user.name || ''
            }));
            if (userSession.id != "") { setSessionReady(true); }
        }
        // Wrapper for async function
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                // Get local response to pass to next fetch
                // Since delays occur with useState synchronization
                let examsRaw = await fetchExams();
                await fetchCourses(examsRaw);
            } catch (error) {
                console.error('Error fetching API Data:', error);
            }
            finally {
                setRefreshTrigger(prev => prev + 1);
            }
        };
        fetchData();
    }, [session, status, hasFetched, refreshTrigger]);

    /**
     * Average Grade Determination
     * Implementation for getting the average of the grades
     */
    const avgScore = (grades: Report[]) => {
        // Variables
        let counter = 0;
        let finalGrade;
        // Process each element (async)
        grades.forEach((grade: Report) => {
            if (grade.exam_score == 'A') counter += 5;
            else if (grade.exam_score == 'B') counter += 4;
            else if (grade.exam_score == 'C') counter += 3;
            else if (grade.exam_score == 'D') counter += 2;
            else if (grade.exam_score == 'F') counter += 1;
        });

        // Get the average of the scores
        const avgGrade = Math.round(counter / grades.length);
        switch (avgGrade) {
            case 5:
                finalGrade = 'A';
                break;
            case 4:
                finalGrade = 'B'
                break;
            case 3:
                finalGrade = 'C';
                break;
            case 2:
                finalGrade = 'D';
                break;
            default:
                finalGrade = 'F';
        }
        // Return the average letter grade for all grades
        return finalGrade;
    }

    /**
     * Fetch Exams
     * Implementation for general API handler
     */
    async function fetchExams() {
        console.log('Fetching data for student report page: Exam data');
        setLoading(true);
        let examsRaw: Report[] = [];

        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/grades/${session?.user?.id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );
            console.log(res);

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching grades:', res.error);
                setGrades([]);
            } else {
                // Assuming your API returns both exams and tests
                // Adjust this based on your actual API response structure
                // Ensure all grades have a status
                examsRaw = res.grades || res; // Once grabbed, it is gone
                // Ensure each grade has a proper status
                examsRaw = examsRaw.map(grade => ({
                    ...grade,
                    status: getGradeStatus(grade)
                }));
                setGrades(examsRaw); // now we can store in useState and not lose it
            }
        } catch (error) {
            console.error('Error fetching student grades:', error.toString());
            setGrades([]);
        } finally {
            // setLoading(false);
            return examsRaw;
        }
    }

    /**
     * Fetch Courses
     * Implementation for general API handler
     */
    async function fetchCourses(examsRaw: Report[]) {
        console.log('Fetching data for student report page: Course data');
        // setLoading(true);
        console.log(examsRaw);
        // Determine courses based on exams
        let courseIdList = examsRaw.reduce((unique: string[], grade) => {
            const courseId = grade.exam_course_id;
            if (courseId && !unique.includes(courseId)) {
                unique.push(courseId);
            }
            return unique;
        }, []);
        console.log('Course Id List');
        console.log(courseIdList);
        // Courses List
        let coursesData: Course[] = [];
        // Exception Wrapper for API handler
        try {
            // Iterate through the course Ids
            for (const courseId of courseIdList) {
                const res = await apiHandler(
                    undefined,
                    'GET',
                    `api/course/${courseId}`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );
                console.log('Course API response');
                console.log(res);

                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching course:', res.error);
                } else {
                    // Store the course in the list
                    coursesData.push(res.course || res);
                }
            }
            // Then transform the array for status
            coursesData = coursesData.map(grade => ({
                ...grade,
                status: getGradeStatus(grade)
            }));

            console.log('This is the courses data:');
            console.log(coursesData);

        } catch (error) {
            console.error('Error fetching student courses:', error.toString());
            setCourses([]);
        } finally {
            setCourses(coursesData);
            setLoading(false);
        }
    }

    // Load Grade Details Modal
    const loadGradeDetails = async (grade: Report, e : any) => {
        e.preventDefault();
        console.log('Grade event click:', e);
        // setExamResult(grade);
        // setIsExamModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br p-6">
            {/*This is the Course Selection button*/}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">{session?.user?.name}'s Report</h2>
                <div className="flex gap-2">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${courseFilter === 'all' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                        onClick={() => setCourseFilter('all')}
                    >
                        All Courses
                    </button>
                    { loading ? ( <React.Fragment /> ) :
                        (
                            <React.Fragment>
                            {filteredCourses.map((course) => (
                                <button
                                    key={course.courseId}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${courseFilter === course.course_name ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setCourseFilter(course.courseName)}
                                >
                                    {course.courseName}
                                </button>
                            ))}
                            </React.Fragment>
                        )}
                </div>
            </div>
            {/*Main Area for details of page*/}
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-center mb-1">Student Performance Report</h1>

                    {/* Line Divider */}
                    <hr className="border-crimson mb-2"></hr>

                    <div className="overflow-y-auto max-h-[500px] pt-1
                            scrollbar-hide mb-12"
                    >
                        <div className="justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-center">Grade Overview</h2>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    { loading ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            Generating...
                                        </motion.div>
                                    ) :
                                    (
                                        <motion.div
                                            // key={`${selectedClass}-${filter}`}
                                            // variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-2 mb-2"
                                        >
                                            <GradeChart
                                                data={grades}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                <div className="w-1/2">
                                    { loading ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center py-12"
                                            >
                                                Generating...
                                            </motion.div>
                                        ) :
                                        (
                                            <motion.div
                                                // key={`${selectedClass}-${filter}`}
                                                // variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="space-y-2 mb-2"
                                            >
                                                <ExamProgressChart
                                                    exams={grades}
                                                    courses={courses}
                                                />
                                            </motion.div>
                                        )}
                                </div>
                                {/*<div className="border border-white size-1/2">Test</div>*/}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Your Grades</h2>
                            <div className="flex gap-2">
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All Grades
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'passed' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setFilter('passed')}
                                >
                                    Passed
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'failed' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setFilter('failed')}
                                >
                                    Failed
                                </button>
                                {/*<button*/}
                                {/*    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}*/}
                                {/*    onClick={() => setFilter('pending')}*/}
                                {/*>*/}
                                {/*    Pending*/}
                                {/*</button>*/}
                            </div>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="rounded-xl shadow-sm border p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)} Grades
                                </h2>
                                <span className="text-sm">
                                  {filteredGrades.length} grade(s) found
                                </span>
                            </div>

                            <div className="max-h-[600px] pt-1">
                                <AnimatePresence mode="wait">
                                    {filteredGrades.length > 0 ? (
                                        <motion.div
                                            key={`${selectedClass}-${filter}`}
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="space-y-2 mb-2"
                                        >
                                            {filteredGrades.map((grade) => (
                                                <GradeCardExtended
                                                    key={grade.exam_id}
                                                    grade={grade}
                                                    index={0}
                                                    onclick={(e) => loadGradeDetails(grade, e)}
                                                />
                                            ))}
                                        </motion.div>
                                    ) : loading === true ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            Loading Grades...
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            No grades found for the selected filters
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                        <div className="max-w-5xl mx-auto rounded-xl shadow-sm pt-6">
                            <h2 className="text-xl font-semibold mb-4">Grade Performance Summary</h2>
                            { loading ?
                                ( <div className="text-center">Calculating Grade Summary...</div> )
                                : grades.length === 0 ?
                                    <div className="text-center">No grades available</div> :
                                    (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-lg border border-blue-100">
                                                <h3 className="text-lg font-medium mb-2">Passed Exams</h3>
                                                <p className="text-3xl font-bold">
                                                    {grades.filter(grade => grade.status === 'passed').length}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg border">
                                                <h3 className="text-lg font-medium mb-2">Failed Exams</h3>
                                                <p className="text-3xl font-bold">
                                                    {grades.filter(grade => grade.status === 'failed').length}
                                                </p>
                                            </div>

                                            <div className="p-4 rounded-lg border">
                                                <h3 className="text-lg font-medium mb-2">Average Student Score</h3>
                                                <p className={`text-3xl font-bold ${
                                                    avgScore(grades) === 'A' || avgScore(grades) === 'B' ? 'text-green-600' :
                                                        avgScore(grades) === 'C' ? 'text-yellow-600' :
                                                            'text-red-600'
                                                }`}>
                                                    {avgScore(grades)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                </motion.div>
            </div>

            {/*/!* Exam Action Modal *!/*/}
            {/*<Modal*/}
            {/*    isOpen={isExamModalOpen}*/}
            {/*    onClose={() => setIsExamModalOpen(false)}*/}
            {/*    title="Alter Scheduled Exam"*/}
            {/*>*/}
            {/*    <ExamActionsComponent*/}
            {/*        examResult={examResult}*/}
            {/*        cancelAction={() => {*/}
            {/*            setIsExamModalOpen(false);*/}
            {/*            // Trigger refresh when modal closes*/}
            {/*            setRefreshTrigger(prev => prev + 1);*/}
            {/*        }}*/}
            {/*    />*/}
            {/*</Modal>*/}
        </div>
    );
}