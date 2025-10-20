'use client';

import React, {useState, useMemo, useEffect, useRef} from 'react';
import { apiHandler } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Grade } from '@/app/grades/util/types';
import { GradeCardExtended, getGradeStatus } from './localComponents/GradeCards';
import { useSession } from "next-auth/react";
import { RingSpinner } from "@/components/UI/Spinners";
import {ExamResultExtended} from "@/app/dashboard/util/types";
import Exam from "@/components/types/exam";
import ExamResult from "@/components/types/exam_result";
import Course from "@/components/types/course";

export default function GradesPage() {
    // Session states
    const [sessionReady, setSessionReady] = useState(false);
    const { data: session, status } = useSession();
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // View data states
    const [grades, setGrades] = useState<Grade[]>([]);
    const [tests, setTests] = useState([]);

    const [examResults, setExamResults] = useState<ExamResult[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [examResult, setExamResult] = useState<ExamResultExtended>();
    const [examsLoading, setExamsLoading] = useState(true);
    const [examResultsLoading, setExamResultsLoading] = useState(true);
    const [coursesExamLoading, setCoursesExamLoading] = useState(true);

    // const [finalScore, setFinalScore] = useState('');
    const [loading, setLoading] = useState(true);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);

    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');

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
                email: session?.user.email || ''
            }));
            if (userSession.id != "") { setSessionReady(true); }
        }
        // Wrapper for async function
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                // await fetchExams();
                await fetchExams();
                // avgScore(grades);
            } catch (error) {
                console.error('Error fetching Exams:', error);
            }
            finally {
                setRefreshTrigger(prev => prev + 1);
            }
        };
        fetchData();
    }, [session, status, hasFetched, refreshTrigger]);

    // // Effects for getting exams after exam results
    // useEffect(() => {
    //     if (examResultsLoading) return;
    //     else if (examResults && examResults.length !== 0) {
    //         console.log('examResults use effects')
    //         console.log(`use effects: ${examResultsLoading}`);
    //         fetchExams();
    //         // fetchCourses();
    //         console.log('Fetching exams');
    //     }
    // }, [examResults, examResultsLoading]); // Include all dependencies

    // // Effects for getting courses after exams
    // useEffect(() => {
    //     if (examsLoading) return;
    //     if (examResultsLoading) return;
    //     else if (grades && grades.length !== 0) {
    //         fetchCourses();
    //         console.log('Fetching courses')
    //     }
    //     else return;
    // }, [examsLoading, examResultsLoading]);

    /**
     * Average Grade Determination
     * Implementation for getting the average of the grades
     */
    const avgScore = (grades: Grade[]) => {
        // Variables
        let counter = 0;
        let finalGrade;
        // Process each element (async)
        grades.forEach((grade: Grade) => {
            if (grade.examScore == 'A') counter += 5;
            else if (grade.examScore == 'B') counter += 4;
            else if (grade.examScore == 'C') counter += 3;
            else if (grade.examScore == 'D') counter += 2;
            else if (grade.examScore == 'F') counter += 1;
        });

        // Get the average of the scores (filter out null scores)
        let scoredGrades = grades.filter((grade: Grade) =>
            {return grade.examScore !== null});
        const avgGrade = Math.round(counter / scoredGrades.length);
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
    /*
    This will gather the exams from the backend API
     */
    async function fetchExams() {
        console.log('Fetching data for student grades page');
        setLoading(true);
        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/exam/result/grades/${session?.user?.id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );
            console.log(res);

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching grades:', res.error);
                setGrades([]);
                setTests([]);
            } else {
                // Assuming your API returns both exams and tests
                // Adjust this based on your actual API response structure
                // Ensure all grades have a status
                setGrades(res.grades || res); // Use res.grades if nested, or res directly
                // Ensure each grade has a proper status
                setGrades(prevGrades =>
                    prevGrades.map(grade => ({
                        ...grade,
                        status: getGradeStatus(grade)
                    }))
                );
                setTests(res.tests || []); // Add logic for tests if needed
            }
        } catch (error) {
            console.error('Error fetching student grades:', error as string);
            setGrades([]);
            setTests([]);
        } finally {
            setLoading(false);
        }
    }

    // Load Grade Details Modal
    const loadGradeDetails = async (grade: Grade, e : any) => {
        e.preventDefault();
        console.log('Grade event click:', e);
        // setExamResult(grade);
        // setIsExamModalOpen(true)
    }

    return (
        <div className="min-h-screen flex flex-col px-4">
            {/*This is the header section with filters*/}
            <div className="sticky top-0 pt-8 z-10 bg-mentat-black
                max-w-5xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">Grade Summary</h1>
                </motion.div>

                <div className="flex justify-between items-center mb-2">
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
                {/* Line Divider */}
                <hr className="border-crimson border-2 mb-2"></hr>
            </div>

            {/* This becomes the primary content container */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="rounded-xl shadow-sm border p-6 pb-1"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">
                                {filter.charAt(0).toUpperCase() + filter.slice(1)} Grades
                            </h2>
                            <span className="text-sm">
                                {filteredGrades.length} grade(s) found
                            </span>
                        </div>

                        <div className="pt-1">
                            <AnimatePresence mode="wait">
                                { loading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="flex justify-center items-center">
                                        <RingSpinner size={'sm'} color={'mentat-gold'} />
                                        <p className="ml-3 text-md text-mentat-gold">Loading grades...</p>
                                    </div>
                                </motion.div>
                                ) : filteredGrades && filteredGrades.length > 0 ? (
                                    <motion.div
                                        key={`${selectedClass}-${filter}`}
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-2 mb-2"
                                    >
                                        {filteredGrades.map((grade) => (
                                            <GradeCardExtended
                                                key={grade.examId}
                                                grade={grade}
                                                index={0}
                                                onclick={(e) => loadGradeDetails(grade, e)}
                                            />
                                        ))}
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
                </div>
            </div>

            {/* Sticky footer container
            stays at bottom with black background to cover overflow */}
            <div className="sticky bottom-0 pt-2 z-10 bg-mentat-black">
                {/* Line Divider */}
                <hr className="border-crimson border-2 mb-1"></hr>
                <div className="max-w-5xl mx-auto pb-4">
                    <h2 className="text-xl font-semibold mb-4">Grade Performance Summary</h2>
                    { loading ?
                        (
                            <div className="flex justify-center items-center pt-6">
                                <RingSpinner size={'sm'} color={'mentat-gold'} />
                                <p className="ml-3 text-md text-mentat-gold">Calculating Grade Summary...</p>
                            </div>
                        )
                        : grades.length === 0 ?
                            <div className="text-center">No grades available</div> :
                            (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-lg border border-blue-100
                                bg-card-color shadow-md shadow-crimson-700">
                                        <h3 className="text-lg font-medium mb-2">Passed Exams</h3>
                                        <p className="text-3xl font-bold">
                                            {grades.filter(grade => grade.status === 'passed').length}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-lg border border-blue-100
                                bg-card-color shadow-md shadow-crimson-700">
                                        <h3 className="text-lg font-medium mb-2">Failed Exams</h3>
                                        <p className="text-3xl font-bold">
                                            {grades.filter(grade => grade.status === 'failed').length}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg border border-blue-100
                                bg-card-color shadow-md shadow-crimson-700">
                                        <h3 className="text-lg font-medium mb-2">Average Student Score</h3>
                                        <p className={`text-3xl font-bold ${
                                            avgScore(grades) === 'A' || avgScore(grades) === 'B'
                                                ? 'text-green-600'
                                                : avgScore(grades) === 'C'
                                                    ? 'text-yellow-600'
                                                    : 'text-red-600'
                                        }`}>
                                            {avgScore(grades)}
                                        </p>
                                    </div>
                                </div>
                            )
                    }
                </div>
            </div>
        </div>
    );
}