'use client'

import React, {useEffect, useState} from 'react';
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import Course from "@/components/types/course";
import ExamResult from "@/components/types/exam_result";
import Grade from "@/components/types/grade";
import { DayFlag, DayPicker, getDefaultClassNames } from "react-day-picker";
import TestWindow from "@/components/types/test_window";
import { RingSpinner } from "@/components/UI/Spinners";
import TestWindowCard from "@/app/schedule/localComponents/TestWindowCard";
import ErrorToast from "@/components/services/error";

export interface ExamAction extends ExamResult {
    examName: string;
    examState: number;
    examDifficulty: number;
    examRequired: number;
    courseId: number;
    courseName: string;
    examDuration: number;
    examOnline: number;
    status: 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending';
}

interface ExamResultRequest {
    examStudentId: number,
    examId: number,
    examVersion: number,
    examScore?: string,
    examScheduledDate: Date,
    examTakenDate?: Date
}

interface ScheduledExamDetailsComponentProps {
    exam: Grade;
    course?: Course;
    // course: Course | undefined;
    cancelAction: () => void;
    updateAction: () => void;
}

export default function ScheduledExamDetailsComponent(
        { exam, course, cancelAction, updateAction } : ScheduledExamDetailsComponentProps) {
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
    // Layout states
    const [testWindows, setTestWindows] = useState<TestWindow[]>([]);
    const [testWindowsLoading, setTestWindowsLoading] = useState<boolean>(true);
    const [examData, setExamData] = useState<ExamResultRequest>();
    const [examResultData, setExamResultData] = useState<Grade>({
        examResultId: exam?.examResultId,
        examId: exam.examId,
        examVersion: exam?.examVersion,
        examName: exam.examName,
        examScore: exam?.examScore,
        examTakenDate: exam?.examTakenDate,
        examScheduledDate: exam?.examScheduledDate,
        examStudentId: exam?.examStudentId,
        examOnline: exam.examOnline,
        examRequired: exam.examRequired,
        examDuration: exam.examDuration,
        examState: exam.examState,
        examDifficulty: exam.examDifficulty,
        courseProfessorId: course?.courseProfessorId || exam.courseProfessorId,
        courseName: course?.courseName || exam.courseName,
        courseYear: course?.courseYear || exam.courseYear,
        courseQuarter: course?.courseQuarter || exam.courseQuarter,
        courseSection: course?.courseSection || exam.courseSection,
        courseId: course?.courseId || exam.courseId
    });
    // Toggle states
    const [isLoaded, setIsLoaded] = useState(false);

    // Daypicker states
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    // Separate state for displayed month
    const [currentMonth, setCurrentMonth] = useState<Date | undefined>(undefined);
    // Date Range states
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 3)));
    // Default class names
    const defaultClassNames = getDefaultClassNames();

    // Add state to track which card is showing overlay
    const [activeOverlay, setActiveOverlay] = useState<number | null>(null);
    const [isHandlerRunning, setHandlerRunning] = useState(false);

    const colors = {
        'mentat-gold': '#dab05a',
        'mentat-gold-700': '#987b3e',
        'mentat-black': '#171717',
        'crimson': '#A30F32',
        'crimson-700': '#8e0d2b',
        'currentDate': '#fb8383'
    }
    // New Schedule event (due to no date)
    const newScheduledExam = exam.examScheduledDate === undefined;
    // Backend API
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

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

    /**
     * useEffect for exam test window hydration
     * and date picker state updates
     */
    // Exam state hydration
    useEffect(() => {
        // Exit if session not ready
        if (!sessionReady) return;
        // Set default date when component mount with exam
        if (examResultData) {
            setSelectedDate(examResultData.examScheduledDate);
            setCurrentMonth(examResultData.examScheduledDate);
            fetchTestWindows();
        }
    }, [sessionReady, examResultData]);

    const handleUpdate = async (window: TestWindow) => {
        // Prevent default events
        console.log("Reschedule Exam");
        setHandlerRunning(true);
        // If the window exists
        if (window) {
            // Create data package
            const updatedData: ExamResultRequest = {
                // examStudentId: examResultData.examStudentId,
                examStudentId: parseInt(session?.user?.id || '0'),
                examId: examResultData.examId,
                examVersion: examResultData.examVersion || 1,
                examScore: examResultData?.examScore,
                examScheduledDate: selectedDate ||
                    examResultData.examScheduledDate
            }

            setExamData(updatedData);

            // Update the state directly, to update UI
            setExamResultData(prev => ({
                ...prev,
                examScheduledDate: selectedDate || examResultData.examScheduledDate
            }));

            // API Handler call
            try {
                console.log("Updating Exam Result");
                // API Handler
                const res = await apiHandler(
                    updatedData,
                    "PATCH",
                    `api/exam/result/${exam?.examResultId}`,
                    `${BACKEND_API}`,
                    userSession.accessToken
                );

                // Handle errors properly
                if (res instanceof Error || (res && res.error)) {
                    toast.error(res?.message || "Failed to update the exam result");
                } else {
                    toast.success("Successfully rescheduled the Exam!");
                    // updateExam(undefined);
                    console.log("Exam Result Update Succeeded.");
                    console.log(res.toString());
                }
            } catch (e) {
                toast.error("Exam Result Update Failed");
            } finally {
                // Run the cancel/close callback
                setActiveOverlay(null);
                setHandlerRunning(false);
                if (updateAction) updateAction();
                // cancelAction();
            }
        }
    }

    const handleCreate = async (window: TestWindow) => {
        // Prevent default events
        console.log("Schedule Exam");
        setHandlerRunning(true);
        // If the window exists
        if (window) {

            // Create data package
            const insertData: ExamResultRequest = {
                examStudentId: parseInt(session?.user?.id || '0'),
                examId: examResultData.examId,
                examVersion: examResultData.examVersion || 1,
                examScore: examResultData?.examScore,
                examScheduledDate: selectedDate ||
                    examResultData.examScheduledDate,
            }
            setExamData(insertData);

            // Update the state directly, to update UI
            setExamResultData(prev => ({
                ...prev,
                examScheduledDate: selectedDate || examResultData.examScheduledDate
            }));

            // API Handler call
            try {
                console.log("Creating Exam Result");
                // API Handler
                const res = await apiHandler(
                    insertData,
                    "POST",
                    `api/exam/result/create`,
                    `${BACKEND_API}`,
                    userSession.accessToken
                );

                // Handle errors properly
                if (res instanceof Error || (res && res.error)) {
                    toast.error(res?.message || "Failed to create the exam result");
                } else {
                    toast.success("Successfully scheduled the Exam!");
                    console.log("Exam Result Create Succeeded.");
                }
            } catch (e) {
                toast.error("Exam Result Create Failed");
            } finally {
                // Run the cancel/close callback
                setActiveOverlay(null);
                setHandlerRunning(false);
                if (updateAction) updateAction();
            }
        }
    }

    // Fetch test windows
    const fetchTestWindows = async () => {
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/test-window/course/${examResultData.courseId}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching test windows:', res.error);
            } else {
                // Convert object to array
                let testWindowsData = [];
                // Get the response data
                testWindowsData = res?.windows || res || []; // Once grabbed, it is gone
                // Ensure it's an array
                testWindowsData = Array.isArray(testWindowsData) ? testWindowsData : [testWindowsData];
                console.log('Processed test windows data:', testWindowsData);
                // Set courses to coursesData
                setTestWindows(testWindowsData);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching test windows:', e);
        } finally {
            // Set loading to false
            setTestWindowsLoading(false);
        }
    }

    const encodeStringDate = (date: string) => {
        return new Date(date + 'T00:00:00.000-08:00');
    }

    // Handle Delete
    const navigateTestWindow = async (window: TestWindow) => {
        // API Handler call
        try {
            console.log("Moving Calendar");
            // console.log(window);
            console.log(activeOverlay)
            console.log(`New Schedule: ${newScheduledExam}`);
            setActiveOverlay(window.testWindowId);

            if (window.testWindowStartDate) {
                let startDate = encodeStringDate(window.testWindowStartDate.toLocaleString('en-US',
                    { timeZone: 'America/Los_Angeles' }));
                setSelectedDate(startDate);
                setCurrentMonth(startDate);
                setStartDate(startDate);
            }
            if (window.testWindowEndDate) {
                let endDate = encodeStringDate(window.testWindowEndDate.toLocaleString('en-US',
                    { timeZone: 'America/Los_Angeles' }));
                setEndDate(endDate);
            }
        } catch (e) {
            toast.error("Test Window Move Failed");
        }
    }

    return (
        <div className="relative w-full h-full">
            <div className="relative flex w-full h-full box-border justify-center items-start overflow-hidden">
                {/*This is the left panel content*/}
                <div className="text-sm flex flex-col w-1/5 h-full min-h-0 justify-center gap-2 p-4
                rounded-lg overflow-auto">
                    <div className="flex font-semibold italic justify-between">
                        <span className="">
                            Exam Name:
                        </span>
                    </div>
                    <div className="bg-mentat-gold/10 rounded-lg">
                        <span className="p-2">
                            {examResultData.examName}
                        </span>
                    </div>
                    <hr className="m-2 border border-mentat-gold/10" />
                    <div className="flex font-semibold italic justify-between">
                        <span className="">
                            Course Name:
                        </span>
                    </div>
                    <div className="bg-mentat-gold/10 rounded-lg">
                        <span className="p-2">
                            {examResultData.courseName}
                        </span>
                    </div>
                    <hr className="m-2 border border-mentat-gold/10" />
                    <div className="flex font-semibold italic justify-between">
                        <span className="">
                            Scheduled Date:
                        </span>
                    </div>
                    <div className="bg-mentat-gold/10 rounded-lg">
                        <span className="p-2">
                            {examResultData.examScheduledDate
                                ? new Date(examResultData.examScheduledDate).toLocaleDateString('en-US',
                                    { timeZone: 'America/Los_Angeles' })
                                : new Date(Date.now()).toLocaleDateString('en-US',
                                    { timeZone: 'America/Los_Angeles' })
                            }
                        </span>
                    </div>
                    <hr className="m-2 border border-mentat-gold/10" />
                    <div className="flex justify-between">
                        <span className="font-semibold italic">
                            Exam Version:
                        </span>
                        <span className="">
                            {examResultData.examVersion || '1'}
                        </span>
                    </div>
                    <hr className="m-2 border border-mentat-gold/10" />
                    <div className="flex justify-between">
                        <span className="font-semibold italic">
                            Exam Difficulty:
                        </span>
                        <span className="">
                            {examResultData.examDifficulty}
                        </span>
                    </div>
                    <hr className="m-2 border border-mentat-gold/10" />
                    <div className="flex justify-between">
                        <span className="font-semibold italic">
                            Exam Required:
                        </span>
                        <span className={`
                            ${examResultData.examRequired ? 'text-green-600' : 'text-red-600'}
                        `}>
                            {examResultData.examRequired ? 'True' : 'False'}
                        </span>
                    </div>
                    <hr className="m-2 border border-mentat-gold/10" />
                    <div className="flex justify-between">
                        <span className="font-semibold italic">
                            Exam Online:
                        </span>
                        <span className={`
                            ${examResultData.examOnline ? 'text-green-600' : 'text-red-600'}
                        `}>
                            {examResultData.examOnline ? 'True' : 'False'}
                        </span>
                    </div>
                    <hr className="m-2 border border-mentat-gold/10" />
                    <div className="flex justify-between">
                        <span className="font-semibold italic">
                            Exam Expiration:
                        </span>
                        <span className={`
                            ${examResultData.expirationDate ? 'text-red-600' : 'text-grey-600 opacity-50'}
                        `}>
                            {examResultData.expirationDate ? examResultData.expirationDate : 'N/A'}
                        </span>
                    </div>
                </div>
                {/*This is the center panel content*/}
                <div className="flex flex-col w-3/5 h-full min-h-0 rounded-lg
                border-l border-r border-mentat-gold/10">
                    <div className="flex-grow w-full min-h-0 p-4">
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) =>
                                {setSelectedDate(date);
                            }}
                            disabled={{
                                before: startDate,
                                after: endDate,
                            }}
                            month={currentMonth} // Controls which month is displayed
                            onMonthChange={setCurrentMonth} // Update when user navigates
                            className="w-full h-full text-mentat-gold"
                            footer={
                                selectedDate
                                    ? (
                                        <div>
                                        You picked {new Date(selectedDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}.&nbsp;
                                        <span className="italic underline text-mentat-gold/40">
                                            This date will be used for scheduling exam
                                        </span>
                                    </div>
                                    ) : "Please pick a date to schedule exam"
                            }
                            classNames={{
                                root: "w-full h-full min-h-0",
                                nav: "flex justify-between text-crimson bg-mentat-gold",
                                months: "w-full h-full min-h-0 flex flex-col",
                                month: "w-full h-full min-h-0 flex flex-col",
                                month_caption: "text-lg my-1 font-bold text-center text-mentat-gold",
                                caption: "text-sm font-bold text-center text-mentat-gold",
                                month_grid: `${defaultClassNames.month_grid}, h-full min-h-0`,
                                head: "mb-2",
                                day: `${defaultClassNames.day}, text-center`,
                                [DayFlag.disabled]: "text-gray-700 cursor-not-allowed text-center",
                                footer: "text-crimson text-center text-sm -mt-4",
                            }}
                            styles={{
                                root: { height: '100%', minHeight: 0 },
                                months: { height: '100%', minHeight: 0 },
                                month: { height: '100%', minHeight: 0 },
                                table: { height: '100%', minHeight: 0 },
                            }}
                        />
                    </div>
                    {/*Because sometimes raw CSS hacking is necessary...*/}
                    <style jsx global>
                        {`
                        [data-selected="true"] {
                            background: radial-gradient(circle at center, ${colors["crimson"]} 0%,
                                ${colors["crimson"]} 50%, transparent 50%) !important;
                            background-size: 4rem 4rem !important;
                            background-position: center !important;
                            background-repeat: no-repeat !important;
                            color: ${colors["crimson"]} !important;
                            font-weight: 600 !important;
                            color: ${colors["mentat-gold"]} !important;
                        }
                
                        [data-today="true"] {
                            background: radial-gradient(circle at center, ${colors.currentDate} 0%,
                                ${colors.currentDate} 50%, transparent 50%) !important;
                            background-size: 4rem 4rem !important;
                            background-position: center !important;
                            background-repeat: no-repeat !important;
                            font-weight: 600 !important;
                            color: ${colors["mentat-black"]} !important;
                        }
                        /* Nav buttons */
                        .rdp-button_previous,
                        .rdp-button_next {
                            color: ${colors["mentat-gold"]} !important; /* Replace with your gold color */
                            background-color: transparent !important;
                            // border: 1px solid ${colors["crimson"]} !important;
                            border-radius: 0.375rem !important;
                            padding: 0.5rem !important;
                        }
        
                        .rdp-button_previous:hover,
                        .rdp-button_next:hover {
                            background-color: ${colors["crimson"]} !important;
                            color: ${colors["mentat-gold"]} !important; /* Text color on hover */
                        }
        
                        /* Nav icons (arrows) */
                        .rdp-button_previous svg,
                        .rdp-button_next svg {
                            color: ${colors["mentat-gold"]} !important;
                            width: 1.25rem !important;
                            height: 1.25rem !important;
                        }
        
                        .rdp-button_previous:hover svg,
                        .rdp-button_next:hover svg {
                            color: ${colors["crimson"]} !important;
                        }

                        /* Nav icons (arrows) - SVG only */
                        .rdp-button_previous svg,
                        .rdp-button_next svg {
                            color: ${colors["mentat-gold"]} !important;
                            width: 1.25rem !important;
                            height: 1.25rem !important;
                        }

                        .rdp-button_previous:hover svg,
                        .rdp-button_next:hover svg {
                            color: ${colors["crimson"]} !important;
                        }

                        /* SVG icons - using fill for color */
                        .rdp-button_previous svg,
                        .rdp-button_next svg {
                            width: 1.25rem !important;
                            height: 1.25rem !important;
                        }

                        .rdp-button_previous svg *,
                        .rdp-button_next svg * {
                            fill: ${colors["crimson"]} !important;
                        }

                        .rdp-button_previous:hover svg *,
                        .rdp-button_next:hover svg * {
                            fill: ${colors["mentat-gold"]} !important;
                        }

                        /* Month caption */
                        .rdp-caption {
                            color: ${colors["crimson"]} !important;
                            font-weight: 600 !important;
                        }
                    `}
                    </style>
                </div>
                {/*This is the right panel content*/}
                { testWindowsLoading ? (
                    <div className="flex justify-center items-center pt-10 pl-5">
                        <RingSpinner size={'sm'} color={'mentat-gold'} />
                        <p className="ml-3 text-md text-mentat-gold">Loading test windows...</p>
                    </div>
                ) : testWindows.length === 0 ? (
                    <div className="flex flex-col w-1/5 h-full min-h-0 p-4 rounded-lg
                        justify-center text-center">
                        No Test Windows Assigned to Course
                    </div>
                ) : (
                    <div className="flex flex-col w-1/5 h-full min-h-0">
                        <h3 className="text-center text-lg mt-1">Test Windows</h3>
                        {/* Line Divider */}
                        <hr className="border-crimson border-1 my-1"></hr>
                        <div className="p-4 rounded-lg overflow-y-auto">
                            {/*These are the test windows*/}
                            { testWindows.map((testWindow, index) => (
                                <TestWindowCard
                                    key={`${testWindow}-${index}`}
                                    testWindow={testWindow}
                                    updateAction={handleUpdate}
                                    createAction={handleCreate}
                                    cancelAction={() => {
                                        setActiveOverlay(null);
                                    }}
                                    onClickAction={() => {
                                        if (activeOverlay !== testWindow.testWindowId) {
                                            navigateTestWindow(testWindow);
                                        }
                                    }}
                                    activeOverlay={activeOverlay}
                                    newScheduled={newScheduledExam}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Loading overlay for showing status on API handler calls */}
            {isHandlerRunning && (
                <div className="absolute inset-0 bg-mentat-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex justify-center items-center pt-10">
                        <RingSpinner size={'md'} color={'mentat-gold'} />
                        <p className="ml-3 text-lg text-mentat-gold">
                            {newScheduledExam ? 'Scheduling exam...' : 'Rescheduling exam...'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}