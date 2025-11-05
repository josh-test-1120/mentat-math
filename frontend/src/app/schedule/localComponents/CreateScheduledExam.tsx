"use client";

import React, {useState, useEffect, useRef} from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { ChangeEvent, MouseEvent } from 'react';
import { apiHandler } from "@/utils/api";
import { useSession} from 'next-auth/react'
import Modal from "@/components/services/Modal";
import { Plus } from 'lucide-react';
import Course from "@/components/types/course";
import Exam from "@/components/types/exam";
import ScheduledExamDetailsComponent from "@/app/schedule/localComponents/ScheduledExamDetails";
import Grade from "@/components/types/grade";
import { allCourse } from "@/components/services/CourseSelector";
import { RingSpinner } from "@/components/UI/Spinners";

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
 * This will show the create scheduled exam
 * modal that a student can use to create
 * a new scheduled exam
 * @author Joshua Summers
 * @constructor
 */
export default function CreateScheduledExam({ studentId, courses, filteredCourse, updateAction }
                                            :CreateScheduledExamProps ) {
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

    // State information
    const [course, setCourse] = useState<Course>();
    const [exams, setExams] = useState<Exam[]>([]);
    const [currentExam, setCurrentExam] = useState<Exam>();
    const [examName, setExamName] = useState<string>();
    const [courseName, setCourseName] = useState<string>();
    const [examVersion, setExamVersion] = useState<number>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isFindingExamVersions, setIsFindingExamVersions] = useState(false);

    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);

    // Form validation - only exam name and course are required, and exam must not be expired
    // Check if the selected exam has expired by comparing expiration date to current date
    const isExamExpired = (() => {
        // If no exam is selected or no expiration date, it's not expired
        if (!currentExam?.expirationDate) {
            return false;
        }
        
        // Parse expiration date as local midnight to avoid timezone issues
        const expirationDate = new Date(currentExam.expirationDate + 'T00:00:00');
        const now = new Date();
        
        // Return true if expiration date is in the past
        return expirationDate < now;
    })();
    
    const isFormValid = !!(course && examName && examName.trim() !== '' && !isExamExpired);

    /**
     * Resets the states when the modal opens
     */
    useEffect(() => {
        if (isModalOpen) {
            // Truth testing
            const defaultCourse = (filteredCourse && filteredCourse.courseId === allCourse.courseId) ||
                (filteredCourse === undefined);
            const mismatchedCourse = !course || !filteredCourse ||
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
     * useAffects that bind the page to refreshes and updates
     */
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

    /**
     * Exam refresh useEffect
     */
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
                userSession.accessToken
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching exams:', res.error);
                setExams([]);
            } else {
                // Convert object to array
                let examsData = [];
                // Get the response data
                examsData = res?.exams || res || []; // Once grabbed, it is gone
                // Ensure it's an array
                examsData = Array.isArray(examsData) ? examsData : [examsData];
                console.log('Processed exams data:', examsData);
                // Set courses to coursesData
                setExams(examsData);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching exams:', e);
            // Set courses to empty array
            setExams([]);
        }
    }

    const handleCourseChange =
        (event: ChangeEvent<HTMLSelectElement>) => {
            // Disable default button events
            event.preventDefault();
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
        };

    const handleExamChange =
        (event: ChangeEvent<HTMLSelectElement>) => {
            // Disable default button events
            event.preventDefault();
            // Get the data option for the Id
            const selectedOption = event.target.options[event.target.selectedIndex];
            const examId = selectedOption.getAttribute('data-key');

            if (exams && exams.length > 0) {
                let current = exams.filter(exam => exam.examId.toString() === examId);

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
        };

    const handLoadTestWindows =
        (event: MouseEvent<HTMLButtonElement>) => {
            // Disable default button events
            event.preventDefault();
            // const selectedValue = event.target.value;
            const selectedValue = event.currentTarget.value;
            console.log('Loading test windows');
            setIsScheduleModalOpen(true);
        }

    const examVersionDetermination =
        async (event: MouseEvent<HTMLButtonElement>) => {
            // Disable default button events
            event.preventDefault();
            // Set the loading state
            setIsFindingExamVersions(true);
            // Last version number
            let lastVersion = 0;
            // Get the exam results for this exam and student
            try {
                // API Handler
                const res = await apiHandler(
                    undefined, // No body for GET request
                    'GET',
                    `api/exam/result/user/${userSession.id}/exam/${currentExam?.examId}`,
                    `${BACKEND_API}`,
                    userSession.accessToken
                );

                // Handle errors
                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching exam versions:', res.error);
                    lastVersion++;
                } else {
                    // Convert object to array
                    let examsData = [];
                    // Get the response data
                    examsData = res?.exams || res || []; // Once grabbed, it is gone
                    // Ensure it's an array
                    examsData = Array.isArray(examsData) ? examsData : [examsData];
                    console.log('Processed exam versions data:', examsData);

                    examsData.forEach(exam => {
                        if (exam.examVersion > lastVersion) lastVersion = exam.examVersion;
                    })
                    // Update exam version
                    lastVersion++;
                }
            } catch (e) {
                // Error fetching courses
                console.error('Error fetching exam version:', e);
            }
            finally {
                console.log(`This is the exam Version: ${lastVersion}`);
                // Update the version
                setExamVersion(lastVersion);
                // Update the current exam record
                setCurrentExam((prev) => {
                    // if undefined
                    if (!prev) { return prev;}
                    // otherwise update record
                    return {
                        ...prev,
                        examVersion: lastVersion
                    }
                });
                // Set the loading state
                setIsFindingExamVersions(false);
            }
        };

    // Get the course select text
    const getCourseSelectText = () => {
        // Check if courses prop is provided and valid
        if (!courses || courses.length === 0) {
            return <option value="">No courses available</option>;
        }

        // Local variables
        let reducedCourses: Course[] = [];
        let loadedCourse = false;
        
        // Set layout for course passed in (default selection)
        if (course) {
            reducedCourses = courses.filter((item) => item.courseId !== course.courseId);
            loadedCourse = true;
        } else {
            // Otherwise we handle all courses
            reducedCourses = courses;
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
                {reducedCourses.map((courseItem: Course) => {
                    const courseName = courseItem.courseName || 'Unknown Course';

                    return (
                        <option
                            key={courseItem.courseId}
                            data-key={courseItem.courseId}
                            value={courseItem.courseId}>
                            {courseName}
                        </option>
                    )
                })}
            </React.Fragment>
        )
    }

    // Get the exam version select text
    const getVersionSelectText = () => {
        const versionMap = new Map([
            [1, '1 - First Attempt'],
            [2, '2 - Second Attempt'],
            [3, '3 - Third Attempt'],
            [4, '4 - Fourth Attempt'],
            [5, '5 - Last Attempt'],
        ]);

        return (
            <React.Fragment>
                {Array.from(versionMap.entries()).map(([key, value]) => (
                    <option
                        key={key}
                        value={key}
                    >
                        {value}
                    </option>
                ))}
            </React.Fragment>
        );
    };

    return (
        <div className="bg-mentat-black text-mentat-gold">
            <div className="px-4 py-4 inline-flex items-center">
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
                   title="Create Exam Attempt">
                <form id="createExamForm" className="w-full space-y-4">
                    {/*First Grid Box: Course and Exam Name*/}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/*Course Selection and logic*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="examCourseId" className="text-sm">
                                Exam Course <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="examCourseId"
                                name="examCourseId"
                                onChange={handleCourseChange}
                                required={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0
                                px-3 py-2"
                            >
                                {!course && <option value="">Select a course</option>}
                                {getCourseSelectText()}
                            </select>
                        </div>
                        {/*Exam Selection and Logic*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="examName" className="text-sm">
                                Exam Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="examName"
                                name="examName"
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
                    {/*Second Grid Box: Exam Version*/}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/*Exam Version*/}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="exam_course_id" className="text-sm">Exam Version</label>
                            <select
                                id="examVersion"
                                name="examVersion"
                                value={examVersion || ""}
                                onChange={(e) => {
                                    const version = parseInt(e.target.value);
                                    setExamVersion(version);
                                    setCurrentExam((prev) => {
                                        // if undefined
                                        if (!prev) { return prev;}
                                        // otherwise update record
                                        return {
                                            ...prev,
                                            examVersion: version
                                        }
                                    });
                                }}
                                required={true}
                                disabled={true}
                                className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0
                                px-3 py-2"
                            >
                                {!examVersion && <option value="">Select a version</option>}
                                {getVersionSelectText()}
                            </select>
                        </div>
                        {/*Exam Version Determination Action*/}
                        <div className="flex flex-col gap-2 items-center justify-end">
                            <span className="text-[11px] italic text-mentat-gold/60">
                                <span className="text-red-500">* </span>
                                    This will determine if previous exam attempts exist
                            </span>
                            <button
                                type="button"
                                className={`font-semibold py-2 px-4 rounded-md shadow-sm shadow-crimson-700
                                ${
                                    isFormValid
                                        ? 'bg-mentat-gold hover:bg-mentat-gold-700 text-crimson'
                                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                }`}
                                onClick={examVersionDetermination}
                                disabled={!isFormValid || isFindingExamVersions}
                                >
                                { isFindingExamVersions ? (
                                    <div className="flex justify-center items-center">
                                        <RingSpinner size={'xs'} color={'crimson'} />
                                        <p className="ml-3 text-sm text-crimson">Finding Versions...</p>
                                    </div>
                                ) : 'Version Inspection' }
                            </button>
                        </div>

                    </div>

                    {/*Exam Details Header*/}
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
        </div>
    );
}