'use client';

import React, {useState, useMemo, useEffect} from 'react';
import { apiHandler } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Exam, Class } from '@/app/_components/types/exams';
import { ExamCard, getExamStatus } from '@/app/_components/student/ExamCard2';
import {useSession} from "next-auth/react";

// Mock data - replace with your actual data source
const mockClasses: Class[] = [
    { id: 'MATH260', name: 'MATH260', grade: 'Junior', teacher: 'Dr. Black' },
    { id: 'MATH330', name: 'MATH330', grade: 'Junior', teacher: 'Dr. Black' },
];

const mockExams: Exam[] = [
    {
        id: '1',
        name: 'LOG1',
        course: 'MATH260',
        date: '2024-01-15',
        duration: '2 hours',
        status: 'completed',
        score: 'A',
        class: 'class-1'
    },
    {
        id: '2',
        name: 'FUN1',
        course: 'MATH260',
        date: '2025-10-20',
        duration: '3 hours',
        status: 'upcoming',
        score: '',
        class: 'class-1'
    },
    {
        id: '3',
        name: 'R1',
        course: 'MATH330',
        date: '2025-06-10',
        duration: '1 hour',
        status: 'missed',
        score: '',
        class: 'class-2'
    },
];

export default function ExamsPage() {
    const { data: session, status } = useSession();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');

    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const filteredExams = useMemo(() => {
        // First filter by class
        let result = selectedClass === 'all'
            ? mockExams
            : mockExams.filter(exam => exam.course === selectedClass);

        // Then filter by status
        if (filter !== 'all') {
            result = result.filter(exam => getExamStatus(exam) === filter);
        }

        return result;
    }, [selectedClass, filter]);

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
        const mockExamsReal = async () => {
            // Try wrapper to handle async exceptions
            try {
                // API Handler
                const res = await apiHandler(
                    undefined, // No body for GET request
                    'GET',
                    `api/exams/${id}`,
                    `${BACKEND_API}`
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
        mockExamsReal();
    }, [status, session, BACKEND_API]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Schedule</h1>
                    <p className="text-gray-600">Manage and view your exam information</p>
                </motion.div>

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
                            onClick={() => setFilter('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                    className="bg-white rounded-xl shadow-sm border p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {selectedClass === 'all' ? 'All Exams' :
                                `${mockClasses.find(c => c.id === selectedClass)?.name} Exams`}
                        </h2>
                        <span className="text-sm text-gray-500">
              {filteredExams.length} exam(s) found
            </span>
                    </div>

                    <div className="overflow-y-auto max-h-[600px] pr-4">
                        <AnimatePresence mode="wait">
                            {filteredExams.length > 0 ? (
                                <motion.div
                                    key={`${selectedClass}-${filter}`}
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    {filteredExams.map((exam) => (
                                        <ExamCard key={exam.id} exam={exam} />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 text-gray-500"
                                >
                                    No exams found for the selected filters
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
//             <div className="max-w-5xl mx-auto">
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6 }}
//                     className="mb-8"
//                 >
//                     <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Schedule</h1>
//                     <p className="text-gray-600">Manage and view your exam information</p>
//                 </motion.div>
//
//                 <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-xl font-semibold text-gray-800">Your Exams</h2>
//                     <div className="flex gap-2">
//                         <button
//                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                             onClick={() => setFilter('all')}
//                         >
//                             All Exams
//                         </button>
//                         <button
//                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                             onClick={() => setFilter('upcoming')}
//                         >
//                             Upcoming
//                         </button>
//                         <button
//                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                             onClick={() => setFilter('completed')}
//                         >
//                             Completed
//                         </button>
//                     </div>
//                 </div>
//
//                 {/*<ClassFilter*/}
//                 {/*    classes={[{ id: 'all', name: 'All Classes', grade: '', teacher: '' }, ...mockClasses]}*/}
//                 {/*    selectedClass={selectedClass}*/}
//                 {/*    onClassChange={setSelectedClass}*/}
//                 {/*/>*/}
//
//                 <motion.div
//                     variants={containerVariants}
//                     initial="hidden"
//                     animate="visible"
//                     className="bg-white rounded-xl shadow-sm border p-6"
//                 >
//                     {/*<div className="flex items-center justify-between mb-6">*/}
//                     {/*    <h2 className="text-xl font-semibold text-gray-800">*/}
//                     {/*        {selectedClass === 'all' ? 'All Exams' :*/}
//                     {/*            `${mockClasses.find(c => c.id === selectedClass)?.name} Exams`}*/}
//                     {/*    </h2>*/}
//                     {/*    <span className="text-sm text-gray-500">*/}
//                     {/*      {filteredExams.length} exam(s) found*/}
//                     {/*    </span>*/}
//                     {/*</div>*/}
//
//                     <div className="overflow-y-auto max-h-[600px] pr-4">
//                         <AnimatePresence mode="wait">
//                             {/*{filteredExams.map((exam) => (*/}
//                             {/*    <ExamCard key={exam.id} exam={exam} />*/}
//                             {/*))}*/}
//                             {filteredExams.length > 0 ? (
//                                 <motion.div
//                                     key={filter}
//                                     variants={containerVariants}
//                                     initial="hidden"
//                                     animate="visible"
//                                     className="space-y-4"
//                                 >
//                                     {/*{filteredExams.map((exam, index) => (*/}
//                                     {/*    <ExamCard key={exam.id} exam={exam} index={index} />*/}
//                                     {/*))}*/}
//                                     {filteredExams.map((exam) => (
//                                         <ExamCard key={exam.id} exam={exam} />
//                                     ))}
//                                 </motion.div>
//                             ) : (
//                                 <motion.div
//                                     initial={{ opacity: 0 }}
//                                     animate={{ opacity: 1 }}
//                                     className="text-center py-12 text-gray-500"
//                                 >
//                                     No exams found for this class
//                                 </motion.div>
//                             )}
//                         </AnimatePresence>
//                     </div>
//                 </motion.div>
//             </div>
//         </div>
//     );
// }