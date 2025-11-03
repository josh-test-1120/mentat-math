'use client'

import React, {useEffect, useState} from 'react';
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import { ExamResultExtended} from "@/app/dashboard/types/shared";
// This is needed to wire in the reschedule component from the grade application
import ScheduledExamDetailsComponent from "@/app/schedule/localComponents/ScheduledExamDetails";
import Grade from "@/components/types/grade";
import Modal from "@/components/services/Modal";
import { RingSpinner } from "@/components/UI/Spinners";

interface ExamActionsComponentProps {
    examResult: ExamResultExtended | undefined
    cancelAction: () => void
    updateAction: () => void
}

/**
 * This is the Exam action view, which will show the
 * Exam Result details, and give some actions that can be
 * taken to adjust the Exam Result entry
 * @param examResult
 * @param cancelAction
 * @param updateAction
 * @constructor
 * @author Joshua Summers
 */
export default function ExamActionsComponent({ examResult,
                                                 cancelAction, updateAction } : ExamActionsComponentProps) {
    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

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
    // Toggle states
    const [isRescheduleAction, setIsRescheduleAction] = useState(false);

    /**
     * useAffects that bind the page to refreshes and updates
     */
    // Page and Session Hydration
    useEffect(() => {
        if (status !== "authenticated") return;
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                accessToken: session?.user.accessToken || ''
            };

            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]); // Added status to dependencies

    /**
     * This is the rescheduling exam result action handler
     * @param event
     */
    const handleReschedule = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Rescheduling Exam");

        // Load in the component
        setIsRescheduleAction(true);

    }

    /**
     * This is the delete exam result action handler
     * @param event
     */
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
                `api/exam/result/${examResult?.examResultId}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.message || "Failed to delete the scheduled exam");
            } else {
                toast.success("Successfully deleted the scheduled exam!");
                console.log("Exam Result Succeeded.");
                console.log(res.toString());
            }
        } catch (e) {
            toast.error("Exam Action Failed");
        } finally {
            // Run the cancel/close callback
            updateAction();
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
                            value={examResult?.examName}
                            className="w-full rounded-md bg-white/5 text-mentat-gold
                                placeholder-mentat-gold/60 border border-mentat-gold/20
                                focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            readOnly={true}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_course_id" className="text-sm">Exam Course</label>
                        <input
                            type="text"
                            id="exam_course_id"
                            name="exam_course_id"
                            value={examResult?.courseName}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0
                                px-3 py-2"
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
                            value={examResult?.examDifficulty}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
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
                            value={examResult?.examVersion}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
                            readOnly={true}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_date_scheduled" className="text-sm">Exam Scheduled Date</label>
                        <input
                            id="exam_date_scheduled"
                            type="text"
                            name="exam_date_scheduled"
                            value={examResult?.examScheduledDate.toLocaleString('en-US',
                                { timeZone: 'America/Los_Angeles' })}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
                            readOnly={true}
                        />
                    </div>

                    <div className="flex flex-col gap-2 justify-center">
                        <div className="flex items-center gap-3">
                            <input
                                id="is_required"
                                type="checkbox"
                                name="is_required"
                                checked={examResult !== undefined
                                    ? examResult.examRequired === 1 : false}
                                className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5
                                    text-mentat-gold focus:ring-mentat-gold"
                                readOnly={true}
                            />
                            <label htmlFor="is_required" className="select-none">Is Exam Required</label>
                        </div>
                    </div>
                </div>
                {/*Buttons and Actions*/}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={cancelAction}
                        className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold
                            py-2 px-4 rounded-md border border-mentat-gold/20"
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-crimson hover:bg-crimson-700 text-mentat-gold font-bold
                            py-2 px-4 rounded-md shadow-sm shadow-mentat-gold-700"
                        type="submit"
                        onClick={handleDelete}
                    >
                        Delete Scheduled Exam
                    </button>
                    <button
                        className="bg-mentat-gold hover:bg-mentat-gold-700 text-crimson font-bold
                            py-2 px-4 rounded-md shadow-sm shadow-crimson-700"
                        type="submit"
                        onClick={handleReschedule}
                    >
                        Reschedule Exam
                    </button>
                </div>
            </form>
            {/* Reschedule Action Modal */}
            <Modal
                isOpen={isRescheduleAction}
                onClose={() => setIsRescheduleAction(false)}
                title="Reschedule Exam Options"
                isFullScreen={true}
            >
                <ScheduledExamDetailsComponent
                    exam={examResult as Grade}
                    cancelAction={() => {
                        setIsRescheduleAction(false);
                    }}
                    updateAction={() => {
                        // Handle parent updates
                        if (updateAction) updateAction();
                        setIsRescheduleAction(false)
                    }}
                />
            </Modal>
        </div>
    );
}


