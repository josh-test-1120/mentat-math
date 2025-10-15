"use client";

import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import {SessionProvider, useSession} from 'next-auth/react'
import Modal from "@/components/services/Modal";
import { Plus } from 'lucide-react';
import Course from "@/components/types/course";
import Exam from "@/components/types/exam";
import {RingSpinner} from "@/components/UI/Spinners";
import ScheduledExamDetailsComponent from "@/app/schedule/localComponents/ScheduledExamDetails";
import Grade from "@/components/types/grade";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

interface CreateScheduledExamProps {
    studentId: string | undefined;
    courses: Course[] | undefined;
}

/**
 * Student Schedule Page
 * @constructor
 */
export default function CreateScheduledExam({ studentId, courses }:CreateScheduledExamProps ) {

    // State information
    const [course, setCourse] = useState<Course>();
    const [exams, setExams] = useState<Exam[]>([]);
    const [currentExam, setCurrentExam] = useState<Exam>();
    const [examName, setExamName] = useState<string>();
    const [courseName, setCourseName] = useState<string>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Session information
    const { data: session } = useSession()

    /**
     * Used to handle session hydration
     */
    useEffect(() => {
        if (session) {
            setSession(() => ({
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            }));
            setSessionReady(prev => prev || userSession.id !== "");
        }
    }, [session]);

    useEffect(() => {
        if (!currentExam) return;
        else {
            console.log('Current Exam refreshed');
        }
    }, [currentExam]);

    // Fetch exams
    const fetchExamsByCourse = async (id: string) => {
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/exam/course/${id}`,
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
                // setFilter('all');
                // console.log('Length of filter:', filteredExams.length);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching exams:', e);
            // Set courses to empty array
            setExams([]);
        } finally {
            // Set loading to false
            // setLoading(false);
        }
    }

    const handleCourseChange = (event) => {
        // Get the data option for the Id
        const selectedOption = event.target.options[event.target.selectedIndex];
        const courseId = selectedOption.getAttribute('data-key');
        console.log(`Course ID: ${courseId}`);

        if (courses && courses.length > 0) {
            let currentCourse = courses.filter(course =>
                course.courseId.toString() === courseId);
            console.log(courseId);
            console.log(currentCourse);
            setCourse(currentCourse[0]);
            setCourseName(currentCourse[0].courseName);

            // Get the exams that are available for that course
            fetchExamsByCourse(courseId);

            // Your callback logic here
            console.log('Selected course ID:', courseId);
        }

        // onCourseSelect?.(selectedValue); // Optional callback prop
    };

    const handleExamChange = (event) => {
        // Get the data option for the Id
        const selectedOption = event.target.options[event.target.selectedIndex];
        const examId = selectedOption.getAttribute('data-key');
        if (exams && exams.length > 0) {
            let current = exams.filter(exam => exam.examId.toString() === examId);
            console.log(examId);
            console.log(current);
            setCurrentExam(current[0]);
            setExamName(current[0].examName);

            // Your callback logic here
            console.log('Selected exam ID:', examId);
        }

        // onCourseSelect?.(selectedValue); // Optional callback prop
    };

    const handLoadTestWindows = (event) => {
        const selectedValue = event.target.value;
        console.log('Loading test windows');
        console.log(course);
        setIsScheduleModalOpen(true);
    }

    console.log(courses);
    console.log(studentId);

    return (
        <div className="bg-mentat-black text-mentat-gold">
            <div className="p-6 inline-flex items-center">
                <button
                    className="bg-crimson hover:bg-crimson-700 text-mentat-gold
                        font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline
                        inline-flex"
                    onClick={() => setIsModalOpen(true)}
                >
                    <span className="inline-flex items-center mr-1">
                        <Plus className="w-5 h-5" />
                    </span>
                    <span>Schedule Exam</span>
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                   title="Create Exam">
                <form id="createExamForm" className="w-full space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/*Course Selection and logic*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="exam_course_id" className="text-sm">Exam Course</label>
                            <select
                                id="exam_course_id"
                                name="exam_course_id"
                                onChange={handleCourseChange}
                                required={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            >
                                <option value="">Select a course</option>
                                {courses && courses.map(course => (
                                    <option
                                        key={course.courseId}
                                        data-key={course.courseId}
                                        value={course.courseId}>
                                        {course.courseName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/*Exam Selection and Logic*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="exam_name" className="text-sm">Exam Name</label>
                            <select
                                id="exam_name"
                                name="exam_name"
                                onChange={handleExamChange}
                                required={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            >
                                <option value="">Select an exam</option>
                                {exams && exams.map(exam => (
                                    <option
                                        key={exam.examId}
                                        data-key={exam.examId}
                                        value={exam.examId}>
                                        {exam.examName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="exam_difficulty" className="text-sm">Exam Difficulty</label>
                            <input
                                type="text"
                                id="exam_difficulty"
                                name="exam_difficulty"
                                value={currentExam?.examDifficulty}
                                readOnly
                                className="w-full rounded-md bg-white/5 text-mentat-gold border
                                 border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2
                                  cursor-not-allowed opacity-70"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <input
                                    id="is_required"
                                    type="checkbox"
                                    name="is_required"
                                    checked={Boolean(currentExam?.examRequired === 1)}
                                    readOnly
                                    className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5
                                    text-mentat-gold focus:ring-mentat-gold cursor-not-allowed"
                                />
                                <label htmlFor="is_required" className="select-none">Make Exam Required</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    id="is_published"
                                    type="checkbox"
                                    name="is_published"
                                    checked={Boolean(currentExam?.examState === 1)}
                                    readOnly
                                    className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5
                                    text-mentat-gold focus:ring-mentat-gold cursor-not-allowed"
                                />
                                <label htmlFor="is_published" className="select-none">Publish Exam</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentExam(undefined);
                                setIsModalOpen(false)
                            }}
                            className="bg-crimson hover:bg-crimson-700 text-mentat-gold
                            font-semibold py-2 px-4 rounded-md border border-mentat-gold/20"
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-mentat-gold hover:bg-mentat-gold-700 text-crimson
                            font-bold py-2 px-4 rounded-md"
                            type="button"
                            onClick={handLoadTestWindows}
                        >
                            Load Test Windows
                        </button>
                    </div>
                </form>
                {/*This is the inner Modal for Test Windows*/}
                <Modal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    title="Schedule Exam Window"
                    isFullScreen={true}
                >
                    {!currentExam ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px]">
                            <p className="mt-4 text-mentat-gold">No valid Exam details</p>
                        </div>
                    ) : (
                        <ScheduledExamDetailsComponent
                            exam={currentExam as Grade}
                            course={course}
                            cancelAction={() => {
                                setIsScheduleModalOpen(false);
                            }}
                            updateAction={() => {
                                setIsScheduleModalOpen(false);
                                setIsModalOpen(false);
                                // Handle parent updates
                                // setCurrentExam(undefined)
                                // if (updateAction) updateAction();
                            }}
                        />)}
                </Modal>

            </Modal>

            {/*<ToastContainer autoClose={3000} hideProgressBar />*/}
        </div>
    );
}