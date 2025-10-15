'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { apiHandler } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProp, Class } from '@/components/types/exams';
import Course from '@/components/types/course';
import ExamResult from "@/components/types/exam_result";
import { useSession } from "next-auth/react";
import Modal from "@/components/services/Modal";
import ExamActionsComponent from "@/app/dashboard/localComponents/ExamActions";
import JoinCourseComponent from "@/app/dashboard/localComponents/JoinCourse";
import { RingSpinner } from "@/components/UI/Spinners";
import Exam from "@/components/types/exam";
import { ExamResultExtended } from "@/app/dashboard/util/types";
import { GradeCardExtended, getExamPropStatus } from "@/app/dashboard/localComponents/GradeCard";

export default function ExamsPage() {
    const { data: session, status } = useSession();
    const [exams, setExams] = useState<ExamResultExtended[]>([]);
    const [examResults, setExamResults] = useState<ExamResult[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [examResult, setExamResult] = useState<ExamResultExtended>();
    const [loading, setLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');

    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const filteredExams = useMemo(() => {
        // Wait until exams data is loaded and available
        if (!exams || exams.length === 0) {
            return [];
        }
        // First filter by class
        let result = selectedClass === 'all'
            ? exams
            : exams.filter(exam => exam.courseName === selectedClass);

        // Then filter by status
        if (filter !== 'all') {
            result = result.filter(exam => getExamPropStatus(exam) === filter);
        }

        return result;
    }, [exams, selectedClass, filter]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // Fetch exam results and enrolled courses
    useEffect(() => {
        // If not authenticated, return
        if (status !== 'authenticated') return;
        // Get student ID
        const id = session?.user?.id?.toString();
        // If no student ID, return
        if (!id) return;

        console.log('This is the status:', status);

        // // Run first time only (initial hydration)
        // console.log(exams);
        // if (exams.length === 0)
        //     if (examResults.length === 0) {
        //         fetchExamResults(id);
        //         fetchCourseEnrollments(id);
        //     }
        // For refreshes

        fetchGrades(id);
        fetchCourseEnrollments(id);

        // console.log('Refresh trigger:', refreshTrigger);
        // setExamResultsLoading(true);
        // setExamsLoading(true);
        // setCoursesExamLoading(true);
        // // Hydrate the data
        // fetchExamResults(id);
        // fetchCourseEnrollments(id);
    }, [status, session, refreshTrigger, BACKEND_API]);

    // Effects for getting exams after exam results
    useEffect(() => {
        if (!exams) return;
        else if (exams && exams.length !== 0) {
            console.log('grades use effects')
            console.log(`use effects: ${exams}`);
        }
    }, [exams]);

    // Fetch exams All
    const fetchGrades = async (id: string) => {
        // Convert object to array
        let gradesData = [];
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/exam/result/grades/${id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching grades:', res.error);
                setExams([]);
            } else {
                // If res is an array, set coursesData to res
                if (Array.isArray(res)) {
                    gradesData = res;
                    // If res is an object, set coursesData to the values of the object
                } else if (res && typeof res === 'object') {
                    // Use Object.entries() to get key-value pairs, then map to values
                    gradesData = Object.entries(res)
                        .filter(([key, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => value);
                    // If res is not an array or object, set coursesData to an empty array
                } else {
                    gradesData = [];
                }

                // Filter out invalid entries
                gradesData = gradesData.filter(c => c && typeof c === 'object');

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
            // setExamsLoading(false);
            setLoading(false);
            // return coursesData;
        }
    };

    // Fetch course enrollments
    const fetchCourseEnrollments = async (id: string) => {
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/course/enrollments?studentId=${id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching courses:', res.error);
                setCourses([]);
            } else {
                // Convert object to array
                let coursesData = [];

                // If res is an array, set coursesData to res
                if (Array.isArray(res)) {
                    coursesData = res;
                    // If res is an object, set coursesData to the values of the object
                } else if (res && typeof res === 'object') {
                    // Use Object.entries() to get key-value pairs, then map to values
                    coursesData = Object.entries(res)
                        .filter(([key, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => value);
                    // If res is not an array or object, set coursesData to an empty array
                } else {
                    coursesData = [];
                }

                // Filter out invalid entries
                coursesData = coursesData.filter(c => c && typeof c === 'object');

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
            // setLoading(false);
        }
    };

    // Load Exam Actions Modal
    const loadExamResultDetails =
            async (exam: ExamResultExtended, e : any) => {
        e.preventDefault();
        console.log('Exam event click:', e);
        console.log(exam);
        setExamResult(exam);
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
                                <div key={c.courseId || index} className="border rounded-xl p-4 shadow-md
                                 shadow-crimson-700 bg-card-color">
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

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl shadow-sm border p-6"
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
                                    key={`${selectedClass}-${filter}`}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4 mb-2"
                                >
                                    {filteredExams.map((exam) => (
                                        <GradeCardExtended
                                            key={exam.examId}
                                            exam={exam}
                                            index={0}
                                            onclick={(e) => loadExamResultDetails(exam, e)}
                                        />
                                    ))}
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