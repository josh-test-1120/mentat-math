/**
 * Default Adjust Exam Grade Page
 * This will allow an instructor to add
 * a grade to an exam a student has taken
 * @author Joshua Summers
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import Course from "@/components/types/course";
import { RingSpinner } from "@/components/UI/Spinners";
import { PenLineIcon } from "lucide-react";
import Modal from "@/components/services/Modal";
import { useSessionData } from "@/hooks/useSessionData";
import { useAdjustFetchData } from "@/app/grades/hooks/useFetchData";

interface AdjustGradeProps {
    courses: Course[];
    course: Course | undefined;
    onGradeAdjusted?: () => void;
}

/**
 * Adjust Exam Grade Component
 * @param course
 * @param onExamCreated
 * @constructor
 */
export default function AdjustGrade({ courses, course, onGradeAdjusted }: AdjustGradeProps) {
    // This is the Backend API data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API ?? '';
    // Session hook
    const { userSession, sessionReady } = useSessionData();
    // Data Fetch hook
    const {
        studentResults,
        studentExams,
        studentLoading,
        examResultLoading,
        studentsFetchError,
        studentExamsError,
        setFormData,
        studentId,
        examResultId,
        examScore,
        isFormValid,
        isAdjusting,
        submitPatch,
        handleChange,
        fetchStudents
    } = useAdjustFetchData(userSession, BACKEND_API, courses, course);

    // State information
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Fetched state referenced
    const hasFetched = useRef(false);

    /**
     * Fetch courses when userSession is ready
     */
    useEffect(() => {
        // Exit if session not ready
        if (!sessionReady) return;
        // Wrapper for async function
        const fetchData = async () => {
            hasFetched.current = true;
            // Reset form data (ensures formdata useEffects run properly)
            setFormData(prev => ({
                ...prev,
                studentName: "",
                examName: "",
                studentId: null,
                examResultId: null,
                examScore: ""
            }));
            // Try-Catch handler for student data loading
            try {
                await fetchStudents();
            } catch (error) {
                console.error('Error fetching Student Exams:', error);
            }
        };
        fetchData();
    }, [sessionReady, courses, course, hasFetched]);

    /**
     * Submit button for Form
     * @param event Event from DOM
     */
    const handleSubmit = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        // Submit the patch
        submitPatch();
        // Trigger the updater callback
        onGradeAdjusted?.();
        // Update the modal state
        setIsModalOpen(false);
    }

    /**
     * Get and list the options for student
     * names and stash the student Id in the options
     */
    const getStudentNameSelectText = () => {
        if (!courses) return

        return (
            studentResults && studentResults.map((student: any) => {
                const studentName = student.firstName + ' ' +  student.lastName || 'Unknown Name';
                const studentId = student.studentId || '';

                return (
                    <option key={studentId} value={studentId}>
                        {studentName}
                    </option>
                )
            })
        )
    }

    /**
     * Get and list the options for exams
     * names and stash the exam result Id in the options
     */
    const getStudentExamSelectText = () => {
        if (!studentResults || !studentResults.length) return

        return (
            studentExams && studentExams.map((exam: any) => {
                const examName = exam.examName || ''
                const examId = exam.examResultId || '';

                return (
                    <option key={examId} value={examId}>
                        {examName}
                    </option>
                )
            })
        )
    }

    return (
        <div className="bg-mentat-black text-mentat-gold">
            {/*Button Layout*/}
            <div className="p-4 inline-flex items-center">
                <button
                    className="bg-crimson hover:bg-crimson-700 text-mentat-gold
                        font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
                        inline-flex shadow-sm shadow-mentat-gold-700"
                    onClick={() => setIsModalOpen(true)}
                >
                    <span className="inline-flex items-center mr-1">
                        <PenLineIcon className="w-5 h-5" />
                    </span>
                    <span>Adjust Grade</span>
                </button>
            </div>
            {/*Modal Layout*/}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Adjust Student Exam Grade"
            >
                <form id="adjustStudentGradeForm" className="w-full space-y-6" onSubmit={handleSubmit}>
                    {/*Initial Input fields*/}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/*Student selector*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="studentId" className="text-sm">
                                Student Exam <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="studentId"
                                    name="studentId"
                                    value={studentId ?? ''}
                                    onChange={handleChange}
                                    required={true}
                                    disabled={studentLoading}
                                    className="w-full rounded-md bg-white/5 text-mentat-gold border
                                    border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    { studentLoading ? (
                                        <option key="loading" value="">Loading students...</option>
                                    ) : studentsFetchError ? (
                                        <option key="error" value="">Error loading students</option>
                                    ) : studentResults && studentResults.length === 0 ? (
                                        <option key="no-courses" value="">No students found</option>
                                    ) : (
                                        getStudentNameSelectText()
                                    )}
                                </select>
                                {studentLoading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <RingSpinner size={'xs'} color={'crimson-700'} />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/*Exam selector*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="examResultId" className="text-sm">
                                Student Exam <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    id="examResultId"
                                    name="examResultId"
                                    value={examResultId ?? ''}
                                    onChange={handleChange}
                                    required={true}
                                    disabled={examResultLoading}
                                    className="w-full rounded-md bg-white/5 text-mentat-gold border
                                    border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    { studentLoading || examResultLoading ? (
                                        <option key="loading" value="">Loading exams...</option>
                                    ) : studentExamsError ? (
                                        <option key="error" value="">Error loading exams</option>
                                    ) : studentExams && studentExams.length === 0 ? (
                                        <option key="no-courses" value="">No exams available</option>
                                    ) : (
                                        getStudentExamSelectText()
                                    )}
                                </select>
                                {examResultLoading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <RingSpinner size={'xs'} color={'crimson-700'} />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/*Exam Score input field*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="examScore" className="text-sm">Exam Grade</label>
                            <input
                                type="text"
                                id="examScore"
                                name="examScore"
                                value={examScore}
                                onChange={handleChange}
                                className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            </input>
                        </div>
                    </div>
                    {/*Button and actions*/}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="bg-crimson hover:bg-crimson-700 text-mentat-gold
                                font-semibold py-2 px-4 rounded-md border border-mentat-gold/20
                                shadow-sm shadow-mentat-gold-700"
                        >
                            Cancel
                        </button>
                        <button
                            className={`font-bold py-2 px-4 rounded-md shadow-sm shadow-mentat-gold-700 ${
                                isFormValid
                                    ? 'bg-mentat-gold hover:bg-mentat-gold-700 text-crimson'
                                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            }`}
                            type="submit"
                            disabled={!isFormValid}
                        >
                            { isAdjusting ? (
                                <div className="flex justify-center items-center">
                                    <RingSpinner size={'xs'} color={'crimson-700'} />
                                    <p className="ml-3 text-sm text-crimson-700">Adjusting...</p>
                                </div>
                            ) : 'Adjust Grade' }
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}