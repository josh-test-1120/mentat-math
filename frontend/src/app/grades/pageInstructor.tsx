'use client';

import React, {useState, useEffect, useMemo} from "react";
import { useRef } from 'react';
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { SessionProvider, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion';
import { Exam, ExamProp, Course } from "@/app/_components/types/exams";
import { getExamCourse, getExamStatus, getExamPropStatus, getExamPropCourse } from "@/app/_components/student/ExamCards";


// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        upcoming: { color: 'bg-blue-100 text-blue-800', icon: '📅' },
        completed: { color: 'bg-green-100 text-green-800', icon: '✅' },
        cancelled: { color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', icon: '📝' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
    );
};

// Score Display Component
const ScoreDisplay = ({ score }: { score: string }) => {
    let scoreColor = 'text-red-600';

    if (score == 'A') scoreColor = 'text-green-600';
    else if (score == 'B') scoreColor = 'text-green-500';
    else if (score == 'C') scoreColor = 'text-yellow-600';

    return (
        <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-1">Score:</span>
            <span className={`text-sm font-bold ${scoreColor}`}>
        {score}
      </span>
            <span className="text-xs text-gray-500 ml-1">({score})</span>
        </div>
    );
};

// Total Score Display Component
const TotalScoreDisplay = ({ score, totalScore }: { score: number; totalScore: number }) => {
    const percentage = (score / totalScore) * 100;
    let scoreColor = 'text-red-600';

    if (percentage >= 90) scoreColor = 'text-green-600';
    else if (percentage >= 80) scoreColor = 'text-green-500';
    else if (percentage >= 70) scoreColor = 'text-yellow-600';
    else if (percentage >= 60) scoreColor = 'text-yellow-500';

    return (
        <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-1">Score:</span>
            <span className={`text-sm font-bold ${scoreColor}`}>
        {score}/{totalScore}
      </span>
            <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
        </div>
    );
};

// Compact ExamCard Component
const ExamCardOld = ({ exam }: { exam: Exam }) => {
    return (
        <motion.div
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex items-center justify-between">
                {/* Left section: Title and subject */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{exam.name}</h3>
                        <StatusBadge status={exam.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{exam.course}</p>
                </div>

                {/* Middle section: Date and time */}
                <div className="flex flex-col items-center mx-6 px-6 border-l border-r border-gray-100">
          <span className="text-sm font-medium text-gray-900">
            {new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
                    <span className="text-xs text-gray-500 mt-1">{exam.date}</span>
                    <span className="text-xs text-gray-500">{exam.duration} mins</span>
                </div>

                {/* Right section: Location and score */}
                <div className="flex-1 flex flex-col items-end">
                    <span className="text-sm text-gray-600">{exam.location}</span>
                    {exam.status === 'completed' && exam.score !== undefined ? (
                        <ScoreDisplay score={exam.score} />
                    ) : (
                        <div className="mt-1 text-xs font-medium text-gray-500">
                            {new Date(exam.date) > new Date() ? 'Upcoming' : 'Pending results'}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Compact ExamCard Component
const ExamCardOld2 = ({ exam }: { exam: ExamProp }) => {
    // Get exam status
    exam.status = getExamPropStatus(exam);

    const getStatusColor = () => {
        switch (exam.status) {
            case 'upcoming': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = () => {
        switch (exam.status) {
            case 'upcoming': return '📅';
            case 'completed': return '✅';
            case 'canceled': return '❌';
            default: return '📝';
        }
    };

    return (
        <motion.div
            className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{exam.exam_name}</h3>
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
          <span>{getStatusIcon()}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor()}`}>
            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
          </span>
        </span>
            </div>

            <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
          {exam.course}
        </span>
                <span className="text-xs text-gray-600">
          {exam.exam_scheduled_date} min
        </span>
            </div>

            <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-700">
          {new Date(exam.exam_scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>

                {exam.status === 'completed' && exam.score !== undefined ? (
                    <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-700">
              Score:
            </span>
            <span className={`text-xs font-bold ${exam.score == 'A' ? 'text-green-600' : exam.score == 'B' ? 'text-yellow-600' : 'text-red-600'}`}>
              {exam.score}
            </span>
                    </div>
                ) : (
                    <span className="text-xs font-medium text-gray-500">
            {new Date(exam.exam_scheduled_date) > new Date() ? 'Upcoming' : 'Pending results'}
          </span>
                )}
            </div>
        </motion.div>
    );
};

// Compact ExamCard Component
const ExamCard = ({ exam }: { exam: ExamProp }) => {
    // Get exam status
    exam.status = getExamPropStatus(exam);

    const getExamStatusColor = () => {
        switch (exam.status) {
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getExamStatusIcon = () => {
        switch (exam.status) {
            case 'active': return '✅';
            case 'inactive': return '❌';
            default: return '📝';
        }
    };

    return (
        <motion.div
            className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{exam.exam_name}</h3>
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <span>{getExamStatusIcon()}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getExamStatusColor()}`}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                    </span>
                </span>
            </div>

            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  {exam.course}
                </span>
                <span className="text-xs text-gray-600">
                  {exam.exam_difficulty} Difficulty Level
                </span>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">
                  {exam.exam_required} Required
                </span>

                {/*{exam.status === 'active' && exam.score !== undefined ? (*/}
                {/*    <div className="flex items-center gap-1">*/}
                {/*        <span className="text-xs font-semibold text-gray-700">*/}
                {/*          Score:*/}
                {/*        </span>*/}
                {/*        <span className={`text-xs font-bold ${exam.score == 'A' ? 'text-green-600' : exam.score == 'B' ? 'text-yellow-600' : 'text-red-600'}`}>*/}
                {/*          {exam.score}*/}
                {/*        </span>*/}
                {/*    </div>*/}
                {/*) : (*/}
                {/*    <span className="text-xs font-medium text-gray-500">*/}
                {/*        {new Date(exam.exam_scheduled_date) > new Date() ? 'Upcoming' : 'Pending results'}*/}
                {/*    </span>*/}
                {/*)}*/}
            </div>
        </motion.div>
    );
};

// Main Component
const ExamDashboard = () => {
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
            : exams.filter(exam => exam.course === filter);
        console.log('result of filter:', result);
        console.log('length of exams:', exams.length);
        // Then filter by status
        if (filter !== 'all') {
            result = result.filter(exam => getExamPropCourse(exam) === filter);
        }

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

                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Your Exams</h2>
                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setFilter('all')}
                            >
                                All Exams
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setFilter('MATH260')}
                            >
                                MATH260
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setFilter('MATH330')}
                            >
                                MATH330
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredExams.map((exam) => (
                                <ExamCard key={exam.exam_id} exam={exam} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredExams.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No exams found for the selected filter.
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Exam Performance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-lg font-medium text-blue-800 mb-2">Passed Exams</h3>
                            <p className="text-3xl font-bold text-blue-600">
                                {exams.filter(e => e.status === 'upcoming').length}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <h3 className="text-lg font-medium text-green-800 mb-2">Failed Exams</h3>
                            <p className="text-3xl font-bold text-green-600">
                                {exams.filter(e => e.status === 'completed').length}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <h3 className="text-lg font-medium text-purple-800 mb-2">Average Score</h3>
                            <p className="text-3xl font-bold text-purple-600">
                                {exams.filter(e => e.status === 'completed' && e.score !== undefined).length > 0
                                    ? Math.round(exams.filter(e => e.status === 'completed' && e.score !== undefined)
                                            .reduce((acc, e) => acc + (e.score!/e.totalScore * 100), 0) /
                                        exams.filter(e => e.status === 'completed' && e.score !== undefined).length)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamDashboard;