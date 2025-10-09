"use client";

import React, {useState, useMemo, useEffect, useRef} from 'react';
import { apiHandler } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProp, Class, ExamResult } from '@/components/types/exams';
import Course from '@/components/types/course';
import { GradeCardExtended, getGradeStatus } from '@/components/UI/cards/GradeCards';
import { useSession } from "next-auth/react";
import Modal from "@/components/services/Modal";
import { GradeChart } from "./localComponents/StatusChart";
import ProgressChart from "./localComponents/ProgressChart";
import { GradeRequirements, GradeStrategy, GradeRequirementsJSON, ExamAttempt} from "./types/shared"

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
    const [courseGrades, setCourseGrades] = useState<Report[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [gradeStrategy, setGradeStrategy] = useState<GradeStrategy>();
    const [tests, setTests] = useState([]);
    // const [finalScore, setFinalScore] = useState('');
    const [loading, setLoading] = useState(true);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);

    // Filter states
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
    const [courseFilter, setCourseFilter] = useState<string>('');
    const [gradeFilter, setGradeFilter] = useState<'A' | 'B' | 'C' | 'D' | 'F'>('A');

    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const filteredGrades = useMemo(() => {
        // Wait until grades data is loaded and available
        if (!courseGrades || courseGrades.length === 0) {
            return [];
        }

        // First filter by class
        let result = filter === 'all'
            ? courseGrades
            : courseGrades.filter(grade => grade.status === filter);

        // Then filter by status
        if (filter !== 'all') {
            result = courseGrades.filter(grade => getGradeStatus(grade) === filter);
        }

        return result;
    }, [courseGrades, filter]);

    const filteredCourses = useMemo(() => {
        // Wait until grades data is loaded and available
        if (!courses || courses.length === 0) {
            return [];
        }

        // Update the exams only assigned to this course
        let reducedGrades: Report[];
        // Reset the exams on course change
        if (grades.length !== courseGrades.length) {
            setCourseGrades(grades);
        }
        // Now reduce the exams by the new course
        reducedGrades = grades.filter(grade => grade.course_name === courseFilter);
        console.log('Updating the Course filter');
        console.log(reducedGrades);
        // Update the course grades
        setCourseGrades(reducedGrades);

        console.log(courses.filter(course => course.courseName === courseFilter)[0]);

        // First filter by course
        return courses.filter(course => course.courseName === courseFilter);
    }, [courses, courseFilter]);

    // Memoize the grade strategy details
    const filteredGradeStrategy = useMemo(() => {
        // Empty until data is ready
        if (!courses) return null;
        else if (!filteredCourses || filteredCourses.length === 0) {
            return null;
        }
        // Get the strategy from course
        const strategy: GradeRequirementsJSON = JSON.parse(filteredCourses[0].gradeStrategy);
        console.log('Updating grade strategy');
        console.log(strategy);

        // Check to make sure strategy exists
        if (!strategy) return null;
        else {
            // let test: GradeStrategy;
            // switch (gradeFilter) {
            //     case 'A':
            //         test =  strategy.A;
            //         break;
            //     case 'B':
            //         test =  strategy.B;
            //         break;
            //     case 'C':
            //         test =  strategy.C;
            //         break;
            //     case 'D':
            //         test =  strategy.D;
            //         break;
            //     default: test =  strategy.F;
            // }
            // console.log('New grade strategy');
            // console.log(test);
            // return test;
            switch (gradeFilter) {
                case 'A': return strategy.GradeA;
                case 'B': return strategy.GradeB;
                case 'C': return strategy.GradeC;
                case 'D': return strategy.GradeD;
                default: return strategy.GradeF;
            }
        }

    }, [filteredCourses, gradeFilter]);

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

    // Use useEffect for grade strategy updates
    useEffect(() => {
        if (gradeStrategy) {
            setGradeStrategy(gradeStrategy);
        }
    }, [gradeStrategy]);

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
                // setGrades([]);
                // setCourseGrades([]);
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
                // setGrades(examsRaw);
                // setCourseGrades(examsRaw);
            }
        } catch (error) {
            console.error('Error fetching student grades:', error as string);
        } finally {
            if (examsRaw.length === 0) {
                setGrades([]);
            }
            else {
                setGrades(examsRaw);
            }
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

            console.log('This is the courses data:');
            console.log(coursesData);

        } catch (error) {
            console.error('Error fetching student courses:', error as string);
            // setCourses([]);
        } finally {
            if (coursesData.length !== 0) {
                // Time to update states
                // First course retried as default
                setCourseFilter(coursesData[0].courseName);
                setCourses(coursesData);
            }
            else {
                setCourses([]);
            }
            // Now we are done loading data
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
        <div className="min-h-screen bg-gradient-to-br">
            {/*This is the Course Selection button*/}
            <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
                { session ?
                    (
                        <React.Fragment>
                            <h2 className="text-xl font-semibold">{session?.user?.name}'s Report</h2>
                            <div className="flex gap-2">
                                { loading ? ( <React.Fragment /> ) : filteredCourses.length === 0
                                    ? (
                                        <div>
                                            <p>Student has no courses</p>
                                        </div>
                                    )
                                    : (
                                        <React.Fragment>
                                            {courses.map((course) => (
                                                <button
                                                    key={course.courseId}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                     shadow-sm shadow-mentat-gold-700 ${
                                                        courseFilter === course.courseName 
                                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat' 
                                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}
                                                        `}
                                                    onClick={() => setCourseFilter(course.courseName)}
                                                >
                                                    {course.courseName}
                                                </button>
                                            ))}
                                        </React.Fragment>
                                    )
                                }
                            </div>
                        </React.Fragment>
                    ) : ( <React.Fragment /> )
                }
            </div>
            {/*Main Area for details of page*/}
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-center mb-1">Student Performance Report</h1>

                    {/* Line Divider */}
                    <hr className="border-crimson border-2 mb-2"></hr>

                    <div className="overflow-y-auto max-h-[550px] pt-1
                            scrollbar-hide"
                    >
                        <div className="justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-center">Grade Overview</h2>
                            <div className="flex gap-2">
                                <div className="flex-1 w-1/2 min-w-[300px] min-h-[300px]">
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
                                                data={filteredGrades}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                <div className="flex-1 w-1/2 min-w-[300px] min-h-[300px]">
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
                                                <ProgressChart
                                                    exams={filteredGrades as ExamAttempt[]}
                                                    course={filteredCourses[0]}
                                                />
                                            </motion.div>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/*This is the Exam Details According to Grade Strategy*/}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Grade Requirement Details</h2>
                            <div className="flex gap-2">
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                     shadow-sm shadow-mentat-gold-700 ${
                                        filter === 'all'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('A')}
                                >
                                    A
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                     shadow-sm shadow-mentat-gold-700 ${
                                        filter === 'passed'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('B')}
                                >
                                    B
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                     shadow-sm shadow-mentat-gold-700 ${
                                        filter === 'failed'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('C')}
                                >
                                    C
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                     shadow-sm shadow-mentat-gold-700 ${
                                        filter === 'failed'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('D')}
                                >
                                    D
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                     shadow-sm shadow-mentat-gold-700 ${
                                        filter === 'failed'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('F')}
                                >
                                    F
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
                            className="rounded-xl shadow-sm border p-6 mb-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">
                                    Grade {gradeFilter} exam requirements
                                </h2>
                                <span className="text-sm">
                                  {/*{filteredGrades.length} exams(s) found*/}
                                    { !filteredGradeStrategy ? (
                                        <React.Fragment />
                                    ) : (
                                        `${filteredGradeStrategy.total} exams required
                                        and ${filteredGradeStrategy.requiredA} As`
                                    )}
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
                                            variants={containerVariants}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            Loading Grades...
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            variants={containerVariants}
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

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Your Grades</h2>
                            <div className="flex gap-2">
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                     shadow-sm shadow-mentat-gold-700 ${
                                        filter === 'all'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All Grades
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                     shadow-sm shadow-mentat-gold-700 ${
                                        filter === 'passed'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setFilter('passed')}
                                >
                                    Passed
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                     shadow-sm shadow-mentat-gold-700 ${
                                        filter === 'failed'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
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
                                            variants={containerVariants}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            Loading Grades...
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            variants={containerVariants}
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
                        <div className="max-w-5xl mx-auto rounded-xl pt-6 mb-1">
                            <h2 className="text-xl font-semibold mb-4">Grade Performance Summary</h2>
                            { loading ?
                                ( <div className="text-center">Calculating Grade Summary...</div> )
                                : courseGrades.length === 0 ?
                                    <div className="text-center">No grades available</div> :
                                    (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-card-color p-4 rounded-lg border border-blue-100
                                                shadow-md shadow-crimson-700">
                                                <h3 className="text-lg font-medium mb-2">Passed Exams</h3>
                                                <p className="text-3xl font-bold">
                                                    {courseGrades.filter(grade => grade.status === 'passed').length}
                                                </p>
                                            </div>
                                            <div className="bg-card-color p-4 rounded-lg border border-blue-100
                                                shadow-md shadow-crimson-700">
                                                <h3 className="text-lg font-medium mb-2">Failed Exams</h3>
                                                <p className="text-3xl font-bold">
                                                    {courseGrades.filter(grade => grade.status === 'failed').length}
                                                </p>
                                            </div>

                                            <div className="bg-card-color p-4 rounded-lg border border-blue-100
                                                shadow-md shadow-crimson-700">
                                                <h3 className="text-lg font-medium mb-2">Average Student Score</h3>
                                                <p className={`text-3xl font-bold ${
                                                    avgScore(courseGrades) === 'A' || avgScore(courseGrades) === 'B' ? 'text-green-600' :
                                                        avgScore(courseGrades) === 'C' ? 'text-yellow-600' :
                                                            'text-red-600'
                                                }`}>
                                                    {avgScore(courseGrades)}
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