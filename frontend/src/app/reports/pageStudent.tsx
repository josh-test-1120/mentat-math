"use client";

import React, {useState, useMemo, useEffect, useRef} from 'react';
import { apiHandler } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import Course from '@/components/types/course';
import { getGradeStatus } from '@/app/grades/localComponents/GradeCards';
import { useSession } from "next-auth/react";
import Modal from "@/components/services/Modal";
import { GradeChart } from "./localComponents/StatusChart";
import ProgressChart from "./localComponents/ProgressChart";
import { GradeRequirements, GradeStrategy, GradeRequirementsJSON,
    ExamAttempt, Report } from "./types/shared"
import { ExamTable } from "@/app/reports/localComponents/GradeStrategyTable";
import { Exam, Grade } from "@/components/types/exams";
import { StrategyProgressBar } from "./localComponents/StrategyProgressBar";
import GradeDashboard from "@/app/reports/localComponents/GradeDashboard";
import { TopicBreakdown} from "@/app/reports/localComponents/TopicBreakdown";
import { PulseSpinner, RingSpinner } from "@/components/UI/Spinners";
import GradeDetermination from "@/app/reports/utils/GradeDetermination";

export function StudentReport() {
    // Session states
    const [sessionReady, setSessionReady] = useState(false);
    const {data: session, status} = useSession();
    const [userSession, setUserSession] = useState({
        id: '',
        username: '',
        email: '',
        name: ''
    });

    // View data states
    const [grades, setGrades] = useState<Report[]>([]);
    const [courseGrades, setCourseGrades] = useState<Report[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [gradeStrategy, setGradeStrategy] = useState<GradeStrategy>();
    const [currentGrade, setCurrentGrade] = useState<String>('A');
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

    // Load the specific grade strategy details
    const loadGradeStrategy = (strategy: GradeStrategy) => {
        // Define the grade letter strategy
        let newStrategy: GradeStrategy = {
            total: strategy?.total || 0,
            requiredA: strategy?.requiredA || 0,
            optional: strategy?.optional || [],
            allOptional: strategy?.allOptional || false
        }
        // Return the new Grade Strategy
        return newStrategy;
    }

    // Grade Calculation based on course strategy
    const calculateCurrentGrade = (passed: number, passedAs: number,
                                   requirements: GradeRequirements) => {
        if (passed >= requirements.A.total && passedAs >= requirements.A.requiredA) return 'A';
        if (passed >= requirements.B.total && passedAs >= requirements.B.requiredA) return 'B';
        if (passed >= requirements.C.total && passedAs >= requirements.C.requiredA) return 'C';
        if (passed >= requirements.D.total && passedAs >= requirements.D.requiredA) return 'D';
        return 'F';
    }


    // Memoized computations (IMPROVED)
    const filteredGrades = useMemo(() => {
        if (!courseGrades || courseGrades.length === 0) return [];
        if (filter === 'all') return courseGrades;
        return courseGrades.filter(grade => getGradeStatus(grade) === filter);
    }, [courseGrades, filter]);

    const filteredCourses = useMemo(() => {
        if (!courses || courses.length === 0) return [];
        return courses.filter(course => course.courseName === courseFilter);
    }, [courses, courseFilter]);

    // FIXED: More efficient grade strategy calculation
    const filteredGradeStrategy = useMemo(() => {
        if (!filteredCourses?.[0]?.gradeStrategy) return null;

        try {
            console.log('Inside the filtered grade strategy memo');
            const strategy: GradeRequirementsJSON = JSON.parse(filteredCourses[0].gradeStrategy);
            let selectedStrategy: GradeStrategy;

            switch (gradeFilter) {
                case 'A': selectedStrategy = strategy.GradeA; break;
                case 'B': selectedStrategy = strategy.GradeB; break;
                case 'C': selectedStrategy = strategy.GradeC; break;
                case 'D': selectedStrategy = strategy.GradeD; break;
                default: selectedStrategy = strategy.GradeF;
            }

            return {
                required: strategy.requiredExams,
                optional: strategy.optionalExams,
                strategy: selectedStrategy
            };
        } catch (error) {
            console.error('Error parsing grade strategy:', error);
            return null;
        }
    }, [filteredCourses, gradeFilter]);

    // FIXED: Memoized grade requirements calculation
    const gradeRequirements = useMemo(() => {
        if (!filteredCourses?.[0]?.gradeStrategy) return null;

        try {
            console.log('Inside the grade requirements memo');
            const strategyJSON: GradeRequirementsJSON = JSON.parse(filteredCourses[0].gradeStrategy);
            return {
                A: loadGradeStrategy(strategyJSON.GradeA),
                B: loadGradeStrategy(strategyJSON.GradeB),
                C: loadGradeStrategy(strategyJSON.GradeC),
                D: loadGradeStrategy(strategyJSON.GradeD),
                F: loadGradeStrategy(strategyJSON.GradeF)
            };
        } catch (error) {
            console.error('Error calculating grade requirements:', error);
            return null;
        }
    }, [filteredCourses]);

    // FIXED: Memoized current grade calculation
    const calculatedCurrentGrade = useMemo(() => {
        // If no grades requirements, return F
        if (!gradeRequirements) return 'F';
        // If we have grades to make a grade determination on
        else if (filteredGrades && filteredGrades.length > 0)
            return GradeDetermination(filteredGrades, gradeRequirements);
        // If neither of those exist, return F
        else return 'F'
    }, [filteredGrades, gradeRequirements, gradeFilter]);

    // EFFECT 1: Initial data loading (IMPROVED)
    useEffect(() => {
        if (status !== 'authenticated' || !session || hasFetched.current) return;

        const fetchData = async () => {
            hasFetched.current = true;
            setLoading(true);

            try {
                const examsRaw = await fetchGrades();
                const coursesData = await fetchCourses(examsRaw);

                if (coursesData.length > 0) {
                    // Set initial course filter
                    setCourseFilter(coursesData[0].courseName);
                    // Don't fetch exams here - let EFFECT 2 handle it
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session, status]); // Removed refreshTrigger and hasFetched from deps

    // EFFECT 2: Course-specific data (IMPROVED)
    useEffect(() => {
        if (!filteredCourses?.[0] || loading) return;

        const updateCourseData = async () => {
            // Update course grades
            const reducedGrades = grades.filter(grade =>
                grade.course_name === courseFilter);
            setCourseGrades(reducedGrades);

            // Fetch exams for this course
            await fetchExams(filteredCourses[0]);
        };

        updateCourseData();
    }, [filteredCourses?.[0]?.courseId, courseFilter, loading]); // More specific deps

    // EFFECT 3: Grade strategy updates (SIMPLIFIED)
    useEffect(() => {
        if (filteredGradeStrategy) {
            console.log('Inside the filtered grade strategy useAffect');
            setGradeStrategy(filteredGradeStrategy.strategy);
        }
    }, [filteredGradeStrategy]); // Only depend on the memoized value

    // EFFECT 4: Current grade updates (SIMPLIFIED)
    useEffect(() => {
        console.log('Calculate current grade:');
        console.log(calculatedCurrentGrade)
        setCurrentGrade(calculatedCurrentGrade);
    }, [calculatedCurrentGrade]); // Only depend on the memoized value

    // EFFECT 5: Session management (separate from data fetching)
    useEffect(() => {
        if (status === 'authenticated' && session) {
            setUserSession({
                id: session.user.id?.toString() || '',
                username: session.user.username || '',
                email: session.user.email || '',
                name: session.user.name || ''
            });
            setSessionReady(true);
        }
    }, [session, status]);

    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

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
     * Fetch Grades
     * Implementation for general API handler
     */
    async function fetchGrades() {
        console.log('Fetching data for student report page: Grade data');
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
                    status: getGradeStatus(grade as Grade)
                }));
                // setGrades(examsRaw);
                // setCourseGrades(examsRaw);
            }
        } catch (error) {
            console.error('Error fetching student grades:', error as string);
        } finally {
            if (examsRaw.length === 0) {
                setGrades([]);
            } else {
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
            if (courseId && !unique.includes(courseId.toString())) {
                unique.push(courseId.toString());
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
            } else {
                setCourses([]);
            }
            // Now we are done loading data
            // setLoading(false);
            return coursesData;
        }
    }

    /**
     * Fetch Exams
     * Implementation for general API handler
     */
    async function fetchExams(course: Course) {
        console.log('Fetching data for exams: Exam data');
        console.log(course);
        let examsRaw: Exam[] = [];

        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/exams/course/${course.courseId}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );
            console.log(res);

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching exams for course:', res.error);
                // setGrades([]);
                // setCourseGrades([]);
            } else {
                // Assuming your API returns both exams and tests
                // Adjust this based on your actual API response structure
                // Ensure all grades have a status
                examsRaw = res.exams || res; // Once grabbed, it is gone
                // setGrades(examsRaw);
                // setCourseGrades(examsRaw);
            }
        } catch (error) {
            console.error('Error fetching student grades:', error as string);
        } finally {
            if (examsRaw.length === 0) {
                setExams([]);
            } else {
                setExams(examsRaw);
            }
            // setLoading(false);
            return examsRaw;
        }
    }

    // Load Grade Details Modal
    const loadGradeDetails = async (grade: Report, e: any) => {
        e.preventDefault();
        console.log('Grade event click:', e);
        // setExamResult(grade);
        // setIsExamModalOpen(true)
    }

    return (
        <div>
            {/*{ loading ? (*/}
            {/*    <div className="flex justify-center items-center min-h-[500px]">*/}
            {/*        <RingSpinner size={'md'} color={'mentat-gold'} />*/}
            {/*        <p className="ml-3 text-2xl text-mentat-gold">Loading report details...</p>*/}
            {/*    </div>*/}
            {/*) : (*/}
                <React.Fragment>
                {/*This is the course header*/}
                <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
                    {/*This is the Course Selection button*/}
                    {session ?
                        (
                            <React.Fragment>
                                <h2 className="text-xl font-semibold">{session?.user?.name}'s Report</h2>
                                <div className="flex gap-2">
                                    {loading ? (<React.Fragment/>) : filteredCourses.length === 0
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
                        ) : (<React.Fragment/>)
                    }
                </div>
                {/*Main Area for details of page*/}
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.6}}
                    >
                        <h1 className="text-3xl font-bold text-center mb-1">Student Performance Report</h1>

                        {/* Line Divider */}
                        <hr className="border-crimson border-2 mb-2"></hr>
                        {/*Overflow wrapper container to manage scrolling*/}
                        <div className="overflow-y-auto pt-1 scrollbar-hide max-h-[70vh]">
                            {/*Grade Summary Charts Components*/}
                            <div className="justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-center mb-1">Grade Analysis Overview</h2>
                                <div className="flex gap-2">
                                    <div className="flex-1 w-1/2 min-w-[300px] min-h-[300px]">
                                        {loading ? (
                                                <div className="flex justify-center items-center pt-6">
                                                    <RingSpinner size={'sm'} color={'mentat-gold'} />
                                                    <p className="ml-3 text-md text-mentat-gold">Generating Graph...</p>
                                                </div>
                                                // <motion.div
                                                //     initial={{opacity: 0}}
                                                //     animate={{opacity: 1}}
                                                //     className="text-center py-12"
                                                // >
                                                //     Generating...
                                                // </motion.div>
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
                                                        key={`grade-chart-${courseFilter}-
                                                                    ${filteredGrades.length}`}
                                                        data={filteredGrades}
                                                    />
                                                </motion.div>
                                            )}
                                    </div>
                                    <div className="flex-1 w-1/2 min-w-[300px] min-h-[300px]">
                                        {loading ? (
                                                <div className="flex justify-center items-center pt-6">
                                                    <RingSpinner size={'sm'} color={'mentat-gold'} />
                                                    <p className="ml-3 text-md text-mentat-gold">Generating Graph...</p>
                                                </div>
                                                // <motion.div
                                                //     initial={{opacity: 0}}
                                                //     animate={{opacity: 1}}
                                                //     className="text-center py-12"
                                                // >
                                                //     Generating...
                                                // </motion.div>
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
                                                        key={`progress-chart-${courseFilter}`}
                                                        exams={filteredGrades as ExamAttempt[]}
                                                        course={filteredCourses[0]}
                                                        currentGrade={currentGrade}
                                                    />
                                                </motion.div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/*This is the grade statistics dashboard*/}
                            { !loading && filteredGrades.length != 0
                                && currentGrade && (
                                <div className="justify-between items-center mb-6">
                                    <GradeDashboard
                                        grades={filteredGrades}
                                        score={currentGrade}
                                    />
                                </div>)}

                            {/*This is the Exam Details According to Grade Strategy*/}
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Grade Selection Filter</h2>
                                <div className="flex gap-2">
                                    <button
                                        className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                                 shadow-sm shadow-mentat-gold-700 ${
                                            gradeFilter === 'A'
                                                ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                                : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                        onClick={() => setGradeFilter('A')}
                                    >
                                        A
                                    </button>
                                    <button
                                        className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                                 shadow-sm shadow-mentat-gold-700 ${
                                            gradeFilter === 'B'
                                                ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                                : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                        onClick={() => setGradeFilter('B')}
                                    >
                                        B
                                    </button>
                                    <button
                                        className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                                 shadow-sm shadow-mentat-gold-700 ${
                                            gradeFilter === 'C'
                                                ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                                : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                        onClick={() => setGradeFilter('C')}
                                    >
                                        C
                                    </button>
                                    <button
                                        className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                                 shadow-sm shadow-mentat-gold-700 ${
                                            gradeFilter === 'D'
                                                ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                                : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                        onClick={() => setGradeFilter('D')}
                                    >
                                        D
                                    </button>
                                    <button
                                        className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                                 shadow-sm shadow-mentat-gold-700 ${
                                            gradeFilter === 'F'
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
                            <hr className="border-crimson border-1 my-4"></hr>

                            {/*This is the grade progress bar*/}
                            { !loading && filteredGrades && filteredGradeStrategy && (
                                <div className="justify-between items-center mb-6">
                                    <StrategyProgressBar
                                        grades={filteredGrades}
                                        strategy={filteredGradeStrategy?.strategy}
                                        required={filteredGradeStrategy?.required}
                                        optional={filteredGradeStrategy?.optional}
                                    />
                                </div>)
                            }

                            {/*This is the revision progress bars*/}
                            { !loading && filteredGrades && (
                                <div className="justify-between items-center mb-6">
                                    <TopicBreakdown
                                        grades={filteredGrades}
                                    />
                                </div>)
                            }

                            {/*This is the Exam Table*/}
                            {loading ? (
                                <div className="flex justify-center items-center pt-6">
                                    <RingSpinner size={'sm'} color={'mentat-gold'} />
                                    <p className="ml-3 text-md text-mentat-gold">Loading Grade Strategy Details...</p>
                                </div>
                            ) : !filteredGradeStrategy ? (
                                <div className="text-center py-6
                                            rounded-xl shadow-sm border p-6"
                                >
                                    Course has no grade strategy
                                </div>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="rounded-xl shadow-sm border p-6 pb-3"
                                >
                                    <div className="flex items-center justify-between text-right">
                                        <h2 className="text-xl font-semibold">
                                            Grade {gradeFilter} Course Requirements
                                        </h2>
                                        {!filteredGradeStrategy ? (
                                            <React.Fragment/>
                                        ) : (
                                            <span className="text-sm text-mentat-gold/80 italic">
                                                  {filteredGradeStrategy.strategy.total} exams required with score greater than C <br/>
                                                {filteredGradeStrategy.strategy.requiredA} exams with an A score required
                                                </span>
                                        )}
                                    </div>
                                    {/*New Grade Strategy Chart*/}
                                    <div className="pt-1 mt-2 bg-card-color shadow-md shadow-crimson-700">
                                        {!filteredGradeStrategy && !filteredCourses
                                        && !exams && !courseGrades ? (
                                            <React.Fragment/>
                                        ) : (
                                            <AnimatePresence mode="wait">
                                                <ExamTable
                                                    grades={courseGrades}
                                                    gradeStrategy={filteredGradeStrategy.strategy}
                                                    required={filteredGradeStrategy.required}
                                                    optional={filteredGradeStrategy.optional}
                                                    exams={exams}
                                                    course={filteredCourses[0]}
                                                    currentGrade={currentGrade}
                                                />
                                            </AnimatePresence>
                                        )}
                                    </div>

                                    {/*<div className="max-h-[600px] pt-1">*/}
                                    {/*    <AnimatePresence mode="wait">*/}
                                    {/*        {filteredGrades.length > 0 ? (*/}
                                    {/*            <motion.div*/}
                                    {/*                key={`${selectedClass}-${filter}`}*/}
                                    {/*                variants={containerVariants}*/}
                                    {/*                initial="hidden"*/}
                                    {/*                animate="visible"*/}
                                    {/*                className="space-y-2 mb-2"*/}
                                    {/*            >*/}
                                    {/*                {filteredGrades.map((grade) => (*/}
                                    {/*                    <GradeCardExtended*/}
                                    {/*                        key={grade.exam_id}*/}
                                    {/*                        grade={grade}*/}
                                    {/*                        index={0}*/}
                                    {/*                        onclick={(e) => loadGradeDetails(grade, e)}*/}
                                    {/*                    />*/}
                                    {/*                ))}*/}
                                    {/*            </motion.div>*/}
                                    {/*        ) : loading === true ? (*/}
                                    {/*            <motion.div*/}
                                    {/*                variants={containerVariants}*/}
                                    {/*                initial={{ opacity: 0 }}*/}
                                    {/*                animate={{ opacity: 1 }}*/}
                                    {/*                className="text-center py-12"*/}
                                    {/*            >*/}
                                    {/*                Loading Grades...*/}
                                    {/*            </motion.div>*/}
                                    {/*        ) : (*/}
                                    {/*            <motion.div*/}
                                    {/*                variants={containerVariants}*/}
                                    {/*                initial={{ opacity: 0 }}*/}
                                    {/*                animate={{ opacity: 1 }}*/}
                                    {/*                className="text-center py-12"*/}
                                    {/*            >*/}
                                    {/*                No grades found for the selected filters*/}
                                    {/*            </motion.div>*/}
                                    {/*        )}*/}
                                    {/*    </AnimatePresence>*/}
                                    {/*</div>*/}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
                </React.Fragment>


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