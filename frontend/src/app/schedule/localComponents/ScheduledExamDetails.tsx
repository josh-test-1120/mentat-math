'use client'

import React, {useEffect, useState} from 'react';
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import Modal from "@/components/services/Modal";
import Course from "@/components/types/course";
import ExamResult from "@/components/types/exam_result";
import Grade from "@/components/types/grade";
import ErrorToast from "@/components/services/error";
import {DayFlag, DayPicker, getDefaultClassNames, UI} from "react-day-picker";
import {string} from "prop-types";
import TestWindow from "@/components/types/test_window";
import {RingSpinner} from "@/components/UI/Spinners";
import {underline} from "next/dist/lib/picocolors";
import TestWindowCard from "@/app/schedule/localComponents/TestWindowCard";

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
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    // const [exam, updateExam] = useState<ExamProp>();
    console.log(exam);

    // Session Information
    const {data: session, status} = useSession();
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

    const [isLoaded, setIsLoaded] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    // Separate state for displayed month
    const [currentMonth, setCurrentMonth] = useState<Date | undefined>(undefined);
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

    // Page and Session Hydration
    useEffect(() => {
        if (status !== "authenticated") return;

        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            };

            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]);

    // Exam hydration of state
    useEffect(() => {
        // Set default date when component mount with exam
        if (examResultData) {
            setSelectedDate(examResultData.examScheduledDate);
            setCurrentMonth(examResultData.examScheduledDate);
            // setSelectedDate(encodeStringDate(examResultData.examScheduledDate.toLocaleString('en-US',
            //     { timeZone: 'America/Los_Angeles' })));
            // setCurrentMonth(encodeStringDate(examResultData.examScheduledDate.toLocaleString('en-US',
            //     { timeZone: 'America/Los_Angeles' })));
            fetchTestWindows();
        }
    }, [examResultData]);

    const handleUpdate = async (window: TestWindow) => {
        // Prevent default events
        console.log("Reschedule Exam");
        setHandlerRunning(true);
        console.log(exam);
        console.log(window);
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
                    examResultData.examScheduledDate,
                examTakenDate: examResultData?.examTakenDate
            }
            console.log('updatedData', updatedData);

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
                    session?.user?.accessToken || undefined
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
        console.log(exam);
        console.log(examResultData);
        console.log(window);
        console.log(session);
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
                examTakenDate: examResultData?.examTakenDate
            }
            console.log('New Data');
            console.log(insertData);
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
                    session?.user?.accessToken || undefined
                );

                // Handle errors properly
                if (res instanceof Error || (res && res.error)) {
                    toast.error(res?.message || "Failed to create the exam result");
                } else {
                    toast.success("Successfully scheduled the Exam!");
                    // updateExam(undefined);
                    console.log("Exam Result Create Succeeded.");
                    console.log(res.toString());
                }
            } catch (e) {
                toast.error("Exam Result Create Failed");
            } finally {
                // Run the cancel/close callback
                setActiveOverlay(null);
                setHandlerRunning(false);
                if (updateAction) updateAction();
                // cancelAction();
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
                session?.user?.accessToken || undefined
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching test windows:', res.error);
                // setTestWindows([]);
            } else {
                // Convert object to array
                let testWindowsData = [];

                // If res is an array, set coursesData to res
                if (Array.isArray(res)) {
                    testWindowsData = res;
                    // If res is an object, set coursesData to the values of the object
                } else if (res && typeof res === 'object') {
                    // Use Object.entries() to get key-value pairs, then map to values
                    testWindowsData = Object.entries(res)
                        .filter(([key, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => value);
                    // If res is not an array or object, set coursesData to an empty array
                } else {
                    testWindowsData = [];
                }

                // Filter out invalid entries
                testWindowsData = testWindowsData.filter(c => c && typeof c === 'object');

                console.log('Processed test windows data:', testWindowsData);
                // Set courses to coursesData
                setTestWindows(testWindowsData);
                // setFilter('all');
                // console.log('Length of filter:', filteredExams.length);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching test windows:', e);
            // Set courses to empty array
            // setExams([]);
        } finally {
            // Set loading to false
            // setLoading(false);
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
                let moveToDate = encodeStringDate(window.testWindowStartDate.toLocaleString('en-US',
                    { timeZone: 'America/Los_Angeles' }));
                setSelectedDate(moveToDate);
                setCurrentMonth(moveToDate);
            }
        } catch (e) {
            toast.error("Test Window Move Failed");
        } finally {
            // Run the cancel/close callback
            // cancelAction();
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
                            {setSelectedDate(date);}}
                            month={currentMonth} // Controls which month is displayed
                            onMonthChange={setCurrentMonth} // Update when user navigates
                            className="w-full h-full text-mentat-gold"
                            // footer={
                            //     selectedDate
                            //         ? `You picked ${selectedDate.toLocaleDateString()}.`
                            //         : "Please pick a date."
                            // }
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
                    <div className="flex justify-center items-center pt-10">
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
                            { testWindows.map(testWindow => (
                                <TestWindowCard
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
                                // In your map function:
                                // <div className="relative" key={testWindow.testWindowId}>
                                //     {/* Your existing card */}
                                //     <div
                                //         className="border border-mentat-gold/20 mb-2
                                // rounded-xl bg-card-color p-2 hover:bg-card-color/10"
                                //         onClick={() => {
                                //             if (activeOverlay !== testWindow.testWindowId) {
                                //                 navigateTestWindow(testWindow);
                                //             }
                                //         }}
                                //     >
                                //         <div>
                                //             <div className="flex font-semibold italic justify-between">
                                //                 <span className="">
                                //                     Description:
                                //                 </span>
                                //             </div>
                                //             <div className="rounded-lg text-sm">
                                //                 <span className="text-mentat-gold-700">
                                //                     {testWindow.description}
                                //                 </span>
                                //             </div>
                                //         </div>
                                //         <div className="my-1">
                                //             <div className="flex font-semibold italic justify-between">
                                //                 <span className="">
                                //                     Start Date/Time:
                                //                 </span>
                                //             </div>
                                //             <div className="rounded-lg text-sm">
                                //                 <span className="text-mentat-gold-700">
                                //                     {testWindow?.testWindowStartDate?.toLocaleString('en-US',
                                //                         { timeZone: 'America/Los_Angeles' })}: {testWindow?.testStartTime}
                                //                 </span>
                                //             </div>
                                //         </div>
                                //         <div className="my-1 overflow-y-auto">
                                //             <div className="flex font-semibold italic justify-between">
                                //                 <span className="">
                                //                     End Date/Time:
                                //                 </span>
                                //             </div>
                                //             <div className="rounded-lg text-sm">
                                //                 <span className="text-mentat-gold-700">
                                //                     {testWindow?.testWindowEndDate?.toLocaleString('en-US',
                                //                         { timeZone: 'America/Los_Angeles' })}: {testWindow?.testEndTime}
                                //                 </span>
                                //             </div>
                                //         </div>
                                //         <div className="my-1">
                                //             <div className="flex font-semibold italic justify-between">
                                //                 <span className="">
                                //                     Active:
                                //                 </span>
                                //                 <span className={`${ testWindow.isActive ?
                                //                     'text-green-700' : 'text-red-700'
                                //                 }`}>
                                //             <span className="not-italic">
                                //                 {testWindow.isActive.toString()}
                                //             </span>
                                //         </span>
                                //             </div>
                                //         </div>
                                //     </div>
                                //     {/* Overlay that appears when active */}
                                //     {activeOverlay === testWindow.testWindowId && (
                                //         <div className="absolute inset-0 bg-mentat-black/10 backdrop-blur-sm rounded-xl
                                //     flex items-center justify-center z-20"
                                //         >
                                //             <div className="flex flex-col gap-3 items-center">
                                //                 <button
                                //                     className="px-4 py-2 rounded-lg text-sm font-medium
                                //                     transition-colors shadow-sm shadow-mentat-gold-700
                                //                     bg-crimson text-mentat-gold hover:bg-crimson-700"
                                //                     // className="bg-crimson text-mentat-black px-6 py-3 rounded-lg
                                //                     //    font-semibold hover:bg-mentat-gold/80 transition-colors
                                //                     //    w-32"
                                //                     onClick={() => {
                                //                         if (!newScheduledExam)
                                //                             handleUpdate(testWindow);
                                //                         else
                                //                             handleCreate(testWindow);
                                //                     }}
                                //                 >
                                //                     {newScheduledExam ? 'Schedule' : 'Reschedule'}
                                //                 </button>
                                //                 <button
                                //                     className="px-4 py-2 rounded-lg text-sm bg-mentat-gold
                                //                     transform-colors hover:bg-mentat-gold-700
                                //                     text-crimson font-bold shadow-sm shadow-crimson-700"
                                //                     onClick={(e) => {
                                //                         e.stopPropagation();
                                //                         setActiveOverlay(null);
                                //                     }}
                                //                 >
                                //                     Cancel
                                //                 </button>
                                //             </div>
                                //         </div>
                                //     )}
                                // </div>
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