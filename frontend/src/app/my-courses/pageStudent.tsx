'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { apiHandler } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProp, Class } from '@/components/types/exams';
import { ExamCardExtended, getExamPropStatus } from '@/components/UI/cards/ExamCards';
import { useSession } from "next-auth/react";
import Modal from "@/components/services/Modal";
import ExamActionsComponent from "@/components/UI/exams/ExamActions";

export default function ExamsPage() {
    const { data: session, status } = useSession();
    const [exams, setExams] = useState<ExamProp[]>([]);
    const [examResult, setExamResult] = useState<ExamProp>();
    const [loading, setLoading] = useState(true);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
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
            : exams.filter(exam => exam.exam_course_name === selectedClass);

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

    // Fetch courses
    useEffect(() => {
        // If not authenticated, return
        if (status !== 'authenticated') return;
        // Get student ID
        const id = session?.user?.id?.toString();
        // If no student ID, return
        if (!id) return;
        // Fetch exams
        const fetchExams = async () => {
            // Try wrapper to handle async exceptions
            try {
                // API Handler
                const res = await apiHandler(
                    undefined, // No body for GET request
                    'GET',
                    `api/exams/${id}`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );

                // Handle errors
                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching courses:', res.error);
                    setExams([]);
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
                    setExams(coursesData);
                }
            } catch (e) {
                // Error fetching courses
                console.error('Error fetching courses:', e);
                // Set courses to empty array
                setExams([]);
            } finally {
                // Set loading to false
                setLoading(false);
            }
        };
        console.log('This is the status:', status);
        fetchExams();
    }, [status, session, refreshTrigger, BACKEND_API]);

    // Load Exam Actions Modal
    const loadExamResultDetails = async (exam: ExamProp, e : any) => {
        e.preventDefault();
        console.log('Exam event click:', e);
        setExamResult(exam);
        setIsExamModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br p-6">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold mb-2">Exam Schedule</h1>
                    <p>Manage and view your exam information</p>
                </motion.div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Exams</h2>
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                            onClick={() => setFilter('all')}
                        >
                            All Exams
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                            onClick={() => setFilter('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-crimson text-mentat-gold-700' : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
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

                    <div className="overflow-y-auto max-h-[600px] pt-1">
                        <AnimatePresence mode="wait">
                            {filteredExams.length > 0 ? (
                                <motion.div
                                    key={`${selectedClass}-${filter}`}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4 mb-2"
                                >
                                    {filteredExams.map((exam) => (
                                        <ExamCardExtended
                                            key={exam.exam_id}
                                            exam={exam}
                                            index={0}
                                            onclick={(e) => loadExamResultDetails(exam, e)}
                                        />
                                    ))}
                                </motion.div>
                            ) : loading === true ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    Loading...
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
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />
            </Modal>
        </div>
    );
}