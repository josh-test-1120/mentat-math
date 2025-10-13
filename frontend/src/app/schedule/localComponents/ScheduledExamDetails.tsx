'use client'

import React, {useEffect, useState} from 'react';
import { Card, CardContent, Button } from "@/components/UI/calendar/ui"
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import Modal from "@/components/services/Modal";
import Course from "@/components/types/course";
import ExamResult from "@/components/types/exam_result";
import ErrorToast from "@/components/services/error";
import {DayFlag, DayPicker, getDefaultClassNames, UI} from "react-day-picker";
import {string} from "prop-types";

export interface ExamAction extends ExamResult {
    exam_name: string;
    exam_state: number;
    exam_difficulty: number;
    exam_required: number;
    exam_course_name: string;
    exam_duration: number;
    exam_online: number;
    status: 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending';
}

interface ScheduledExamDetailsComponentProps {
    exam: ExamAction | undefined;
    // course: Course | undefined;
    cancelAction: () => void
}

export default function ScheduledExamDetailsComponent({ exam, cancelAction } : ScheduledExamDetailsComponentProps) {
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    // const [exam, updateExam] = useState<ExamProp>();

    // Session Information
    const {data: session, status} = useSession();
    const [examData, setExamData] = useState({
        examId: exam?.exam_id,
        examName: exam?.exam_name || '',
        courseId: exam?.exam_course_id.toString() || '',
        examDifficulty: exam?.exam_difficulty.toString() || '',
        examRequired: exam?.exam_required.toString() || '',
        examDuration: exam?.exam_duration.toString() || '',
        examState: exam?.exam_state.toString() || '',
        examOnline: exam?.exam_online.toString() || ''
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [currentMonth, setCurrentMonth] = useState<Date | undefined>(undefined); // Separate state for displayed month
    const defaultClassNames = getDefaultClassNames();

    const colors = {
        'mentat-gold': '#dab05a',
        'mentat-gold-700': '#987b3e',
        'mentat-black': '#171717',
        'crimson': '#A30F32',
        'crimson-700': '#8e0d2b',
        'currentDate': '#fb8383'
    }

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
        if (exam) {
            setSelectedDate(encodeStringDate(exam.exam_scheduled_date));
            setCurrentMonth(encodeStringDate(exam.exam_scheduled_date));
        }
    }, [exam]);

    const handleUpdate = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        console.log("Modify Exam");
        console.log(exam);
        console.log(examData);
        // API Handler call
        try {
            console.log("Updating Exam");
            console.log(session);
            // API Handler
            const res = await apiHandler(
                examData,
                "PATCH",
                `api/exam/${exam?.exam_id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.message || "Failed to update the exam");
            } else {
                toast.success("Successfully updated the exam!");
                // updateExam(undefined);
                console.log("Exam Update Succeeded.");
                console.log(res.toString());
            }
        } catch (e) {
            toast.error("Exam Update Failed");
        } finally {
            // Run the cancel/close callback
            cancelAction();
        }
    }

    // Handle Delete
    const handleDelete = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        // API Handler call
        try {
            console.log("Deleting Exam");
            console.log(session);
            // API Handler
            const res = await apiHandler(
                undefined,
                "DELETE",
                `api/exam/${exam?.exam_id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.message || "Failed to delete the exam version");
            } else {
                toast.success("Successfully deleted the exam version!");
                // updateExam(undefined);
                console.log("Exam Deletion Succeeded.");
                console.log(res.toString());
            }
        } catch (e) {
            toast.error("Exam Deletion Failed");
        } finally {
            // Run the cancel/close callback
            cancelAction();
        }
    }

    const encodeStringDate = (date: string) => {
        return new Date(date + 'T00:00:00.000-08:00');
    }

    return (
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
                        {exam?.exam_name}
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
                        {exam?.exam_course_name}
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
                        {exam?.exam_scheduled_date}
                    </span>
                </div>
                <hr className="m-2 border border-mentat-gold/10" />
                <div className="flex justify-between">
                    <span className="font-semibold italic">
                        Exam Version:
                    </span>
                    <span className="">
                        {exam?.exam_version}
                    </span>
                </div>
                <hr className="m-2 border border-mentat-gold/10" />
                <div className="flex justify-between">
                    <span className="font-semibold italic">
                        Exam Difficulty:
                    </span>
                    <span className="">
                        {exam?.exam_difficulty}
                    </span>
                </div>
                <hr className="m-2 border border-mentat-gold/10" />
                <div className="flex justify-between">
                    <span className="font-semibold italic">
                        Exam Online:
                    </span>
                    <span className={`
                        ${exam?.exam_online ? 'text-green-600' : 'text-red-600'}
                    `}>
                        {exam?.exam_online ? 'True' : 'False'}
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
            <div className="flex flex-col w-1/5 h-full min-h-0 rounded-lg">

            </div>
        </div>
    );
}