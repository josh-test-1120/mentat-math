'use client';

import { ExamExtended } from "@/app/grades/util/types";
import React, { useEffect, useRef, useState } from "react";
import { RingSpinner } from "@/components/UI/Spinners";
import ExamResult from "@/components/types/exam_result";
import { apiHandler } from "@/utils/api";
import { useSession } from "next-auth/react";

interface ExamStatisticsProps {
    exams: ExamExtended[];
    index: number;
    onclick?: (e: any) => void;
}

// Compact ExamCard Component
export function ExamStatistics({ exams, index, onclick }: ExamStatisticsProps ) {
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
    // These are the state variables for the page
    const [examResults, setExamResults] = useState<ExamResult[]>();
    const [examResultsLoading, setExamResultsLoading] = useState(true);
    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);
    // This is the backend API data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    // Status Counter
    const statusScore = (exam: ExamResult) => {
        if (exam.examScore == 'A') return 5;
        else if (exam.examScore == 'B') return 4;
        else if (exam.examScore == 'C') return 3;
        else if (exam.examScore == 'D') return 2;
        else if (exam.examScore == 'F') return 1;
        else return 0;
    }

    const avgScore = (exams: ExamResult[]) => {
        let counter = 0;
        console.log('Calculate Average of Exam Results');
        console.log(exams);
        exams.forEach((exam: ExamResult) => {
            if (exam.examScore == 'A') counter += 5;
            else if (exam.examScore == 'B') counter += 4;
            else if (exam.examScore == 'C') counter += 3;
            else if (exam.examScore == 'D') counter += 2;
            else if (exam.examScore == 'F') counter += 1;
        });
        // Get the average
        let avg = Math.round(counter / exams.length);

        // Return the letter score
        switch (avg) {
            case 5: return 'A';
            case 4: return 'B';
            case 3: return 'C';
            case 2: return 'D';
            case 1: return 'F';
        }
    }

    // Fetch exams
    const fetchExamResults = async () => {
        setExamResultsLoading(true);
        // Full exam list
        let examResults: ExamResult[] = [];
        // Iterate through the courses
        for (const exam of exams) {
            // Try wrapper to handle async exceptions
            try {
                // API Handler
                const res = await apiHandler(
                    undefined, // No body for GET request
                    'GET',
                    `api/exam/result/exam/${exam.examId}`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );

                // Handle errors
                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching exams:', res.error);
                    // setExams([]);
                } else {
                    // Convert object to array
                    let examResultsData = [];

                    // If res is an array, set coursesData to res
                    if (Array.isArray(res)) {
                        examResultsData = res;
                        // If res is an object, set coursesData to the values of the object
                    } else if (res && typeof res === 'object') {
                        // Use Object.entries() to get key-value pairs, then map to values
                        examResultsData = Object.entries(res)
                            .filter(([key, value]) =>
                                value !== undefined && value !== null)
                            .map(([key, value]) => value);
                        // If res is not an array or object, set coursesData to an empty array
                    } else {
                        examResultsData = [];
                    }

                    // Filter out invalid entries
                    examResultsData = examResultsData.filter(c => c && typeof c === 'object');

                    // examResultsData = examResultsData.map((grade: ExamExtended) => ({
                    //     ...grade,
                    //     courseName: courses.filter(course =>
                    //         course.courseId === grade.courseId)[0].courseName,
                    // }));
                    examResults.push(...examResultsData);
                    // console.log(`Processed exams data for course ${course.courseName}:`, examResultsData);
                    // Set courses to coursesData
                    // setExams(examsData);
                    // setFilter('all');
                    // console.log('Length of filter:', filteredExams.length);
                }
            } catch (e) {
                // Error fetching courses
                console.error('Error fetching exams:', e);
                // Set courses to empty array
                // setExams([]);
            } finally {
                // Set loading to false
                // setLoading(false);
                // setExamResults(examResults);
            }
        }
        console.log('Exam Result fetched');
        console.log(examResults);

        setExamResults(examResults);
        setExamResultsLoading(false);

        // setExamsLoading(false);

    }

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
        // Drop out until exams are ready
        if (exams.length === 0) return;
        // Otherwise, hydration the data
        const fetchData = async () => {
            hasFetched.current = true;
            // Try - Catch handler
            try {
                // Fetch Exams
                fetchExamResults();
            } catch (error) {
                console.error('Error fetching exam results:', error);
            } finally {
                console.error('Fetched all exams results successfully');
            }
        };
        // Run the async handler to fetch data
        fetchData();
    }, [userSession, exams]);

    return (
        examResultsLoading ? (
                <div className="flex justify-center items-center pt-10">
                    <RingSpinner size={'sm'} color={'mentat-gold'} />
                    <p className="ml-3 text-md text-mentat-gold">Generating Exam Statistics...</p>
                </div>
            ) : examResults && examResults.length > 0 ? (
                <div className="rounded-xl shadow-sm px-4 mb-1">
                    <h2 className="text-xl font-semibold mb-4">Exam Performance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border border-mentat-gold/20 bg-card-color
                                shadow-sm shadow-crimson-700">
                            <h3 className="text-lg font-medium mb-2">Passed Student Exams</h3>
                            <p className="text-3xl font-bold">
                                {examResults.filter(exam => exam.examScore === 'A'
                                    || exam.examScore === 'B'
                                    || exam.examScore === 'C').length}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-mentat-gold/20 bg-card-color
                                shadow-sm shadow-crimson-700">
                            <h3 className="text-lg font-medium mb-2">Failed Student Exams</h3>
                            <p className="text-3xl font-bold">
                                {examResults.filter(exam => exam.examScore === 'D'
                                    || exam.examScore === 'F').length}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-mentat-gold/20 bg-card-color
                                shadow-sm shadow-crimson-700">
                            <h3 className="text-lg font-medium mb-2">Average Student Score</h3>
                            <p className="text-3xl font-bold">
                                {examResults && examResults.filter(exam =>
                                    exam.examScore !== undefined).length > 0
                                    ? avgScore(examResults.filter(exam =>
                                        exam.examScore !== undefined)) : 0}
                            </p>

                            {/*{exams.filter(e => e.status === 'completed' && e.exam_score !== undefined).length > 0*/}
                            {/*    ? Math.round(exams.filter(e => e.status === 'completed' && e.score !== undefined)*/}
                            {/*            .reduce((acc, e) => acc + (e.score!/e.totalScore * 100), 0) /*/}
                            {/*        exams.filter(e => e.status === 'completed' && e.score !== undefined).length)*/}
                            {/*    : 0}%*/}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl shadow-sm px-4 mb-1">
                    <h2 className="text-xl font-semibold mb-2">Exam Performance Summary</h2>
                    <div className="text-center py-6">
                        <p className="text-mentat-gold/80 text-lg">No exam results available</p>
                        <p className="text-mentat-gold/60 text-sm mt-2">
                            Exam statistics will appear here once students start taking exams
                        </p>
                    </div>
                </div>
            )
    );
}