'use client'

import React, {useEffect, useState} from 'react';
import { Card, CardContent, Button } from "@/components/UI/calendar/ui"
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import Modal from "@/components/services/Modal";
import { ExamProp } from "@/components/types/exams";
import ErrorToast from "@/components/services/error";

// interface JoinCourseComponentProps {
//   onJoinSuccess?: () => void;
// }

interface ExamActionsComponentProps {
    examResult: ExamProp | undefined
    cancelAction: () => void
}

export default function ExamActionsComponent({ examResult, cancelAction } : ExamActionsComponentProps) {
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    // const [exam, updateExam] = useState<ExamProp>();

    // Session Information
    const {data: session, status} = useSession();

    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

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

            console.log("User session NAME: " + session.user.username);
            console.log("User session ID: " + newUserSession.id);
            console.log("This is the exam result:");
            console.log(examResult);
        }
    }, [session, status]); // Added status to dependencies

    const handleReschedule = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Rescheduling Exam");
    }

    // Handle Delete
    const handleDelete = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        // API Handler call
        try {
            console.log("Deleting Scheduled Exam");
            console.log(session);
            // API Handler
            const res = await apiHandler(
                undefined,
                "DELETE",
                `api/exam/result/${examResult?.exam_result_id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.message || "Failed to delete the scheduled exam");
            } else {
                toast.success("Successfully deleted the scheduled exam!");
                // updateExam(undefined);
                console.log("Exam Result Succeeded.");
                console.log(res.toString());
            }
        } catch (e) {
            toast.error("Exam Action Failed");
        } finally {
            // Run the cancel/close callback
            cancelAction();
        }
    }

    return (
        <div className="flex inset-0 justify-center items-center">
            <form id="ExamActionForm" className="w-full space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_name" className="text-sm">Exam Name</label>
                        <input
                            type="text"
                            id="exam_name"
                            name="exam_name"
                            value={examResult?.exam_name}
                            className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            readOnly={true}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_course_id" className="text-sm">Exam Course</label>
                        <input
                            type="text"
                            id="exam_course_id"
                            name="exam_course_id"
                            value={examResult?.exam_course_id}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            readOnly={true}
                        >
                        </input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_difficulty" className="text-sm">Exam Difficulty</label>
                        <input
                            id="exam_difficulty"
                            type="text"
                            name="exam_difficulty"
                            value={examResult?.exam_difficulty}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            readOnly={true}
                        >
                        </input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_version" className="text-sm">Exam Version</label>
                        <input
                            id="exam_version"
                            type="text"
                            name="exam_version"
                            value={examResult?.exam_version}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            readOnly={true}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_date_scheduled" className="text-sm">Exam Version</label>
                        <input
                            id="exam_date_scheduled"
                            type="text"
                            name="exam_date_scheduled"
                            value={examResult?.exam_scheduled_date}
                            // onChange={data}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            readOnly={true}
                        />
                    </div>

                    <div className="flex flex-col gap-2 justify-center">
                        <div className="flex items-center gap-3">
                            <input
                                id="is_required"
                                type="checkbox"
                                name="is_required"
                                checked={Boolean(examResult?.exam_required)}
                                // onChange={data}
                                className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
                                readOnly={true}
                            />
                            <label htmlFor="is_required" className="select-none">Is Exam Required</label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={cancelAction}
                        className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold py-2 px-4 rounded-md border border-mentat-gold/20"
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-md"
                        type="submit"
                        onClick={handleDelete}
                    >
                        Delete Scheduled Exam
                    </button>
                    <button
                        className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-md"
                        type="submit"
                        onClick={handleReschedule}
                    >
                        Reschedule Exam
                    </button>
                </div>
            </form>
        </div>
    );
}


