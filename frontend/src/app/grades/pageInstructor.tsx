'use client';

import React, {useState, useEffect, useMemo} from "react";
import { useRef } from 'react';
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { SessionProvider, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion';
import { Exam, ExamProp, Course } from "@/app/_components/types/exams";
import { getExamPropCourse, ExamCardSmall } from "@/app/_components/student/ExamCards";

// Status Counter
const statusScore = (exam: ExamProp) => {
    if (exam.exam_score == 'A') return 5;
    else if (exam.exam_score == 'B') return 4;
    else if (exam.exam_score == 'C') return 3;
    else if (exam.exam_score == 'D') return 2;
    else if (exam.exam_score == 'F') return 1;
    else return 0;
}

const avgScore = (exams: ExamProp[]) => {
    let counter = 0;
    exams.forEach((exam: ExamProp) => {
        if (exam.exam_score == 'A') counter += 5;
        else if (exam.exam_score == 'B') counter += 4;
        else if (exam.exam_score == 'C') counter += 3;
        else if (exam.exam_score == 'D') counter += 2;
        else if (exam.exam_score == 'F') counter += 1;
    });
    // Return the average
    return Math.round(counter / exams.length);
}

// Main Component
export default function ExamDashboard() {
    const { data: session, status } = useSession();
    const [exams, setExams] = useState<ExamProp[]>([]);
    const [loading, setLoading] = useState(true);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [filter, setFilter] = useState<'all' | 'MATH260' | 'MATH330'>('all');

    const filteredExams = useMemo(() => {
        // First filter by class
        let result = filter === 'all'
            ? exams
            : exams.filter(exam => getExamPropCourse(exam) === filter);
        console.log('result of filter:', result);
        console.log('length of exams:', exams.length);

        return result;
    }, [filter, exams]);

    // Fetch exams
    useEffect(() => {
        // If not authenticated, return
        if (status !== 'authenticated') return;
        // Get instructor ID
        const id = session?.user?.id?.toString();
        // If no instructor ID, return
        if (!id) return;

        // Fetch exams
        const fetchExams = async () => {
            // Try wrapper to handle async exceptions
            try {
                // API Handler
                const res = await apiHandler(
                    undefined, // No body for GET request
                    'GET',
                    `api/exams/instructor/${id}`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );

                // Handle errors
                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching exams:', res.error);
                    setExams([]);
                } else {
                    // Convert object to array
                    let examsData = [];

                    // If res is an array, set coursesData to res
                    if (Array.isArray(res)) {
                        examsData = res;
                    // If res is an object, set coursesData to the values of the object
                    } else if (res && typeof res === 'object') {
                        // Use Object.entries() to get key-value pairs, then map to values
                        examsData = Object.entries(res)
                            .filter(([key, value]) => value !== undefined && value !== null)
                            .map(([key, value]) => value);
                    // If res is not an array or object, set coursesData to an empty array
                    } else {
                        examsData = [];
                    }

                    // Filter out invalid entries
                    examsData = examsData.filter(c => c && typeof c === 'object');

                    console.log('Processed exams data:', examsData);
                    // Set courses to coursesData
                    setExams(examsData);
                    setFilter('all');
                    console.log('Length of filter:', filteredExams.length);
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
        };
        // Fetch courses
        fetchExams();
    }, [status, session, BACKEND_API, refreshTrigger]);

    if (status !== 'authenticated') return <div className="p-6">Please sign in.</div>;
    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br p-6">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Exam Listing</h1>
                    <p>Manage and view your created exams</p>
                </header>

                <div className="rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Your Exams</h2>
                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setFilter('all')}
                            >
                                All Exams
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'MATH260' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setFilter('MATH260')}
                            >
                                MATH260
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'MATH330' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setFilter('MATH330')}
                            >
                                MATH330
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredExams.map((exam) => (
                                <ExamCardSmall key={exam.exam_id} exam={exam} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredExams.length === 0 && (
                        <div className="text-center py-12">
                            No exams found for the selected filter.
                        </div>
                    )}
                </div>

                <div className="rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Exam Performance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-lg font-medium text-blue-800 mb-2">Passed Exams</h3>
                            <p className="text-3xl font-bold text-blue-600">
                                {exams.filter(exam => exam.status === 'completed').length}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <h3 className="text-lg font-medium text-green-800 mb-2">Failed Exams</h3>
                            <p className="text-3xl font-bold text-green-600">
                                {exams.filter(exam => exam.status === 'failed').length}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <h3 className="text-lg font-medium text-purple-800 mb-2">Average Score</h3>
                            <p className="text-3xl font-bold text-purple-600">
                                {exams.filter(exam => exam.status === 'completed'
                                    && exam.exam_score !== undefined).length > 0
                                    ? avgScore(exams) : 0}$

                                {/*{exams.filter(e => e.status === 'completed' && e.exam_score !== undefined).length > 0*/}
                                {/*    ? Math.round(exams.filter(e => e.status === 'completed' && e.score !== undefined)*/}
                                {/*            .reduce((acc, e) => acc + (e.score!/e.totalScore * 100), 0) /*/}
                                {/*        exams.filter(e => e.status === 'completed' && e.score !== undefined).length)*/}
                                {/*    : 0}%*/}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};