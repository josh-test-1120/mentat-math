"use client";

import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { ChangeEvent, MouseEvent } from 'react';
import { apiHandler } from "@/utils/api";
import { SessionProvider , useSession} from 'next-auth/react'
import Modal from "@/components/services/Modal";
import { Plus } from 'lucide-react';
import Course from "@/components/types/course";
import Exam from "@/components/types/exam";
import ScheduledExamDetailsComponent from "@/app/schedule/localComponents/ScheduledExamDetails";
import Grade from "@/components/types/grade";
import { allCourse } from "@/components/services/CourseSelector";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

interface CreateScheduledExamProps {
    studentId: string | undefined;
    courses: Course[] | undefined;
    filteredCourse: Course | undefined;
    updateAction: () => void;
}

/**
 * Student Schedule Page
 * @constructor
 */
export default function CreateScheduledExam({ studentId, courses, filteredCourse, updateAction }
                                            :CreateScheduledExamProps ) {

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
     * Resets the states when the modal opens
     */
    useEffect(() => {
        if (isModalOpen) {
            // Truth testing
            const defaultCourse = (filteredCourse && filteredCourse.courseId === allCourse.courseId) ||
                (filteredCourse === undefined);
            const mismatchedCourse = course && filteredCourse &&
                course.courseId !== filteredCourse.courseId;

            // Reset the exams
            setExamName('');
            setCurrentExam(undefined);

            // Flush the course settings if passing in default
            if (defaultCourse) {
                setCourse(undefined);
                setCourseName(undefined);
                setExams([]);
            }
            // Recapture proper defaults if changed and closed
            else if (mismatchedCourse) {
                setCourse(filteredCourse);
                setCourseName(filteredCourse?.courseName)
                fetchExamsByCourse(filteredCourse.courseId.toString());
            }
        }
    }, [isModalOpen]);

    /**
     * Resets the states when the filtered course changes
     */
    useEffect(() => {
        if (filteredCourse) {
            if (filteredCourse.courseId !== allCourse.courseId) {
                setCourse(filteredCourse)
                setCourseName(filteredCourse.courseName);
                fetchExamsByCourse(filteredCourse.courseId.toString());
            }
            console.log('Filtered Course useEffect');
            console.log(filteredCourse);
        }
    }, [filteredCourse]);

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

    const handleCourseChange =
        (event: ChangeEvent<HTMLSelectElement>) => {
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
                if (courseId) fetchExamsByCourse(courseId);

                // Your callback logic here
                console.log('Selected course ID:', courseId);
            }

            // onCourseSelect?.(selectedValue); // Optional callback prop
        };

    const handleExamChange =
        (event: ChangeEvent<HTMLSelectElement>) => {
            // Get the data option for the Id
            const selectedOption = event.target.options[event.target.selectedIndex];
            const examId = selectedOption.getAttribute('data-key');

            if (exams && exams.length > 0) {
                let current = exams.filter(exam => exam.examId.toString() === examId);

                console.log(examId);
                console.log(current);

                // Check if exam was found
                if (current && current.length > 0) {
                    setCurrentExam(current[0]);
                    setExamName(current[0].examName);
                    console.log('Selected exam ID:', examId);
                } else {
                    // No exam found or empty selection
                    setCurrentExam(undefined);
                    setExamName(undefined);
                    console.log('No exam selected');
                }
            }

            // onCourseSelect?.(selectedValue); // Optional callback prop
        };

    const handLoadTestWindows =
        (event: MouseEvent<HTMLButtonElement>) => {
            // const selectedValue = event.target.value;
            const selectedValue = event.currentTarget.value;
            console.log('Loading test windows');
            console.log(course);
            setIsScheduleModalOpen(true);
        }

    // Get the course select text
    const getCourseSelectText = () => {
        console.log('getCourseSelectText function');
        // Local variables
        let reducedCourses: Course[] = [];
        let loadedCourse = false;
        let initialDisplayText = '';
        // Set layout for course passed in (default selection)
        if (courses && courses.length > 0) {
            if (course) {
                reducedCourses = courses.filter((item) => item.courseId !== course.courseId);
                console.log(reducedCourses);
                initialDisplayText = `${course.courseName} - ${course.courseSection} 
                (${course.courseQuarter} ${course.courseYear})`;
                loadedCourse = true;
            }
            // Otherwise we handle all courses
            else {
                reducedCourses = courses;
            }
        }

        return (
            <React.Fragment>
                {loadedCourse && course && (
                    <option
                        key={course.courseId}
                        data-key={course.courseId}
                        value={course.courseId}>
                        {course.courseName}
                    </option>
                )}
                {reducedCourses.map((course: any, index: number) => {
                    const courseName = course.courseName || 'Unknown Course';

                    return (
                        <option
                            key={course.courseId}
                            data-key={course.courseId}
                            value={course.courseId}>
                            {courseName}
                        </option>
                    )
                })}
            </React.Fragment>
        )
    }

    // Form validation - only exam name and course are required
    const isFormValid = course && examName && examName.trim() !== '' || false;

    console.log(course);
    console.log(studentId);
    console.log(isFormValid);
    console.log(filteredCourse);
    console.log(courses)

    return (
        <div className="bg-mentat-black text-mentat-gold">
            <div className="p-6 inline-flex items-center">
                <button
                    className="bg-crimson hover:bg-crimson-700 text-mentat-gold
                        font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline
                        inline-flex shadow-sm shadow-mentat-gold-700"
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
                <form id="createExamForm" className="w-full space-y-4">
                    {/*First Grid Box*/}
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
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0
                                px-3 py-2"
                            >
                                {course ? (
                                    getCourseSelectText()
                                ) : (
                                    <React.Fragment>
                                        <option value="">Select a course</option>
                                        {getCourseSelectText()}
                                    </React.Fragment>
                                )}
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
                    </div>
                    <div className="text-center mx-auto">
                        <span className="text-sm italic text-mentat-gold/80">Exam Details</span>
                    </div>
                    {/*Line Divider*/}
                    <hr className="flex flex-1 border-s mx-4 border-mentat-gold/30" />
                    {/*Second Grid Box*/}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/*Exam Difficulty and Required States*/}
                        {/* Exam Difficulty */}
                        <div className="flex flex-col gap-2 bg-white/5 border
                        border-mentat-gold/20 rounded-lg p-4 justify-center">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-mentat-gold/80">
                                    Exam Difficulty
                                </span>
                                <span className="text-sm font-semibold text-mentat-gold
                                bg-crimson/20 px-3 py-1 rounded-full">
                                    {currentExam?.examDifficulty ?? '--'}
                                </span>
                            </div>
                        </div>

                        {/* Exam Required */}
                        <div className="flex flex-col gap-2 bg-white/5 border
                        border-mentat-gold/20 rounded-lg p-4 justify-center">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-mentat-gold/80">
                                    Exam Required
                                </span>
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                    currentExam?.examRequired === 1
                                        ? 'text-green-400 bg-green-500/20'
                                        : currentExam?.examRequired === 0
                                            ? 'text-red-400 bg-red-500/20'
                                            : 'text-mentat-gold/60 bg-mentat-gold/10'
                                }`}>
                                    {currentExam?.examRequired === 1 ? 'Required' :
                                    currentExam?.examRequired === 0 ? 'Optional' : '--'}
                                </span>
                            </div>
                        </div>
                        {/* Exam Status */}
                        <div className="flex flex-col gap-2 bg-white/5 border
                        border-mentat-gold/20 rounded-lg p-4 justify-center">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-mentat-gold/80">
                                    Exam Status
                                </span>
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                    currentExam?.examState === 1
                                        ? 'text-green-400 bg-green-500/20'
                                        : currentExam?.examState === 0
                                            ? 'text-orange-400 bg-orange-500/20'
                                            : 'text-mentat-gold/60 bg-mentat-gold/10'
                                }`}>
                                    {currentExam?.examState === 1 ? 'Published' :
                                    currentExam?.examState === 0 ? 'Unpublished' : '--'}
                                </span>
                            </div>
                        </div>
                        {/* Exam Expiration Date */}
                        <div className="flex flex-col gap-2 bg-white/5 border
                        border-mentat-gold/20 rounded-lg p-4 justify-center">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-mentat-gold/80">
                                    Expiration Date
                                </span>
                                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                    currentExam?.expirationDate
                                        ? (() => {
                                            const expirationDate = new Date(currentExam.expirationDate + 'T00:00:00');
                                            const now = new Date();
                                            const isExpired = expirationDate < now;
                                            const isExpiringSoon =
                                                expirationDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) 
                                                && !isExpired;

                                            if (isExpired) return 'text-red-400 bg-red-500/20';
                                            if (isExpiringSoon) return 'text-orange-400 bg-orange-500/20';
                                            return 'text-green-400 bg-green-500/20';
                                        })()
                                        : 'text-mentat-gold/60 bg-mentat-gold/10'
                                }`}>
                                        {(() => {
                                            if (currentExam?.expirationDate) {
                                                // Parse as local date (not UTC) to avoid timezone issues
                                                const expirationDate = new Date(currentExam.expirationDate + 'T00:00:00');
                                                const now = new Date();
                                                const isExpired = expirationDate < now;
                                                const isExpiringSoon =
                                                    expirationDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                                                    && !isExpired;

                                                if (isExpired) {
                                                    return 'EXPIRED';
                                                }

                                                const dateStr = expirationDate.toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                });
                                                return dateStr;
                                            }
                                            return '--';
                                        })()}
                                    </span>
                            </div>
                        </div>

                        {/*<div className="flex flex-col gap-2">*/}
                        {/*    <label htmlFor="exam_difficulty" className="text-sm">Exam Difficulty</label>*/}
                        {/*    <input*/}
                        {/*        type="text"*/}
                        {/*        id="exam_difficulty"*/}
                        {/*        name="exam_difficulty"*/}
                        {/*        value={currentExam?.examDifficulty}*/}
                        {/*        readOnly*/}
                        {/*        className="w-full rounded-md bg-white/5 text-mentat-gold border*/}
                        {/*         border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2*/}
                        {/*          cursor-not-allowed opacity-70"*/}
                        {/*    />*/}
                        {/*</div>*/}
                        {/*<div className="grid grid-cols-2 sm:grid-cols-2 gap-4 items-center">*/}
                        {/*    <div className="flex items-center gap-3">*/}
                        {/*        <input*/}
                        {/*            id="is_required"*/}
                        {/*            type="checkbox"*/}
                        {/*            name="is_required"*/}
                        {/*            checked={Boolean(currentExam?.examRequired === 1)}*/}
                        {/*            readOnly*/}
                        {/*            className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5*/}
                        {/*            text-mentat-gold focus:ring-mentat-gold cursor-not-allowed"*/}
                        {/*        />*/}
                        {/*        <label htmlFor="is_required" className="select-none">Make Exam Required</label>*/}
                        {/*    </div>*/}
                        {/*    <div className="flex items-center gap-3">*/}
                        {/*        <input*/}
                        {/*            id="is_published"*/}
                        {/*            type="checkbox"*/}
                        {/*            name="is_published"*/}
                        {/*            checked={Boolean(currentExam?.examState === 1)}*/}
                        {/*            readOnly*/}
                        {/*            className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5*/}
                        {/*            text-mentat-gold focus:ring-mentat-gold cursor-not-allowed"*/}
                        {/*        />*/}
                        {/*        <label htmlFor="is_published" className="select-none">Publish Exam</label>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentExam(undefined);
                                setIsModalOpen(false)
                            }}
                            className="bg-crimson hover:bg-crimson-700 text-mentat-gold
                            font-semibold py-2 px-4 rounded-md border border-mentat-gold/20
                            shadow-sm shadow-mentat-gold-700"
                        >
                            Cancel
                        </button>
                        <button
                            className={`font-bold py-2 px-4 rounded-md shadow-sm shadow-crimson-700 ${
                                isFormValid
                                    ? 'bg-mentat-gold hover:bg-mentat-gold-700 text-crimson'
                                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            }`}
                            type="button"
                            onClick={handLoadTestWindows}
                            disabled={!isFormValid}
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
                                // Parent update actions
                                if (updateAction) updateAction();
                            }}
                        />)}
                </Modal>

            </Modal>

            {/*<ToastContainer autoClose={3000} hideProgressBar />*/}
        </div>
    );
}