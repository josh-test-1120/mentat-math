'use client'

import React, {useEffect, useState} from 'react';
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import { ExamExtended } from "@/app/grades/util/types";
import ErrorToast from "@/components/services/error";
import {RingSpinner} from "@/components/UI/Spinners";

interface ExamDetailsComponentProps {
    exam: ExamExtended;
    updateAction: () => void;
    cancelAction: () => void;
}

export default function ExamDetailsComponent({ exam, updateAction, cancelAction } : ExamDetailsComponentProps) {
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    // const [exam, updateExam] = useState<ExamProp>();

    // Session Information
    const {data: session, status} = useSession();
    const [examData, setExamData] = useState({
        examId: exam?.examId,
        examName: exam?.examName ?? '',
        courseId: `${exam?.courseId ?? ''}`,
        examDifficulty: `${exam?.examDifficulty ?? ''}`,
        examRequired: `${exam?.examRequired ?? 0}`,
        examDuration: `${exam?.examDuration ?? ''}`,
        examState: `${exam?.examState ?? 0}`,
        examOnline: `${exam?.examOnline ?? 0}`,
        hasExpiration: Boolean(exam?.examExpirationDate),
        examExpirationDate: exam?.examExpirationDate ?? ''
    });

    // Modify action state
    const [isModifying, setIsModifying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isLoaded, setIsLoaded] = useState(false);
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

            console.log("User session name: " + session.user.username);
            console.log("User session ID: " + newUserSession.id);
            console.log("This is the exam:");
            console.log(exam);
        }
    }, [session, status, exam]);

    const handleUpdate = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        // Set Modify state
        setIsModifying(true);

        console.log("Modify Exam");
        console.log(exam);
        console.log(examData);
        
        // Prepare the payload for the PATCH request
        const updatePayload: any = {
            examName: examData.examName,
            examDifficulty: parseInt(examData.examDifficulty),
            examRequired: parseInt(examData.examRequired),
            examDuration: parseFloat(examData.examDuration),
            examState: parseInt(examData.examState),
            examOnline: parseInt(examData.examOnline),
            examCourseId: parseInt(examData.courseId)
        };

        // Include expiration date if it's set
        if (examData.hasExpiration && examData.examExpirationDate) {
            updatePayload.examExpirationDate = examData.examExpirationDate;
        } else if (!examData.hasExpiration) {
            // If expiration is disabled, send null to clear the expiration date
            updatePayload.examExpirationDate = null;
        }

        // API Handler call
        try {
            console.log("Updating Exam");
            console.log("Update payload:", updatePayload);
            console.log(session);
            
            // API Handler
            const res = await apiHandler(
                updatePayload,
                "PATCH",
                `api/exam/${exam?.examId}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.message || "Failed to update the exam");
            } else {
                toast.success("Successfully updated the exam!");
                console.log("Exam Update Succeeded.");
                console.log(res.toString());
            }
        } catch (e) {
            toast.error("Exam Update Failed");
        } finally {
            // Set Modify state
            setIsModifying(false);
            // Run the cancel/close callback
            updateAction();
        }
    }

    // Handle Delete
    const handleDelete = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        // Set Modify state
        setIsDeleting(true);

        // API Handler call
        try {
            console.log("Deleting Exam");
            console.log(session);
            // API Handler
            const res = await apiHandler(
                undefined,
                "DELETE",
                `api/exam/${exam?.examId}`,
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
            // Set Modify state
            setIsDeleting(false);
            // Run the cancel/close callback
            updateAction();
        }
    }

    return (
        <div className="flex inset-0 justify-center items-center">
            <form id="ExamActionForm" className="w-full space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_course_name" className="text-sm">Exam Course</label>
                        <input
                            type="text"
                            id="exam_course_name"
                            name="exam_course_name"
                            value={exam.courseName}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20
                            focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            readOnly={true}
                        >
                        </input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_name" className="text-sm">Exam Name</label>
                        <input
                            type="text"
                            id="exam_name"
                            name="exam_name"
                            value={examData.examName.toString()}
                            onChange={(e) =>
                                setExamData({ ...examData, examName: e.target.value })}
                            className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60
                                border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="examDifficulty" className="text-sm">Exam Difficulty</label>
                        <select
                            id="examDifficulty"
                            name="examDifficulty"
                            value={examData.examDifficulty}
                            onChange={(e) =>
                                setExamData({ ...examData, examDifficulty: e.target.value })}
                            required={true}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                            border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                        >
                            <option value="">Select difficulty</option>
                            <option value="1">1 - Very Easy</option>
                            <option value="2">2 - Easy</option>
                            <option value="3">3 - Medium</option>
                            <option value="4">4 - Hard</option>
                            <option value="5">5 - Very Hard</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_duration" className="text-sm">Exam Duration</label>
                        <input
                            id="examDuration"
                            type="text"
                            name="examDuration"
                            value={examData.examDuration}
                            onChange={(e) =>
                                setExamData({ ...examData, examDuration: e.target.value })}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20
                                focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                        />
                    </div>

                    <div className="sm:col-span-2"> {/* Span the checkboxes across both columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <input
                                    id="examRequired"
                                    type="checkbox"
                                    name="examRequired"
                                    checked={examData.examRequired === '1'}
                                    onChange={(e) =>
                                        setExamData({ ...examData, examRequired: e.target.checked ? '1' : '0' })}
                                    className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold
                                        focus:ring-mentat-gold"
                                />
                                <label htmlFor="is_required" className="select-none">Is Exam Required</label>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="examState"
                                    type="checkbox"
                                    name="examState"
                                    checked={examData.examState === '1'}
                                    onChange={(e) =>
                                        setExamData({ ...examData, examState: e.target.checked ? '1' : '0' })}
                                    className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold
                                        focus:ring-mentat-gold"
                                />
                                <label htmlFor="exam_state" className="select-none">Is Exam Active</label>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="examOnline"
                                    type="checkbox"
                                    name="examOnline"
                                    checked={examData.examOnline === '1'}
                                    onChange={(e) =>
                                        setExamData({ ...examData, examOnline: e.target.checked ? '1' : '0' })}
                                    className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold
                                        focus:ring-mentat-gold"
                                />
                                <label htmlFor="is_online" className="select-none">Is Exam Online</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Expiration Section */}
                <div className="w-full">
                    <div className="mt-2 p-3 rounded-lg border border-mentat-gold/20 bg-white/5">
                        <div className="flex items-center gap-3">
                            <input
                                id="hasExpiration"
                                type="checkbox"
                                name="hasExpiration"
                                checked={examData.hasExpiration}
                                onChange={(e) =>
                                    setExamData({ 
                                        ...examData, 
                                        hasExpiration: e.target.checked,
                                        // Clear expiration date if unchecked
                                        examExpirationDate: e.target.checked ? examData.examExpirationDate : ''
                                    })}
                                className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
                            />
                            <label htmlFor="hasExpiration" className="select-none">Set booking expiration</label>
                        </div>
                        <div className="mt-3">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="examExpirationDate" className="text-sm">Expiration Date</label>
                                <input
                                    id="examExpirationDate"
                                    type="date"
                                    name="examExpirationDate"
                                    value={examData.examExpirationDate}
                                    onChange={(e) =>
                                        setExamData({ ...examData, examExpirationDate: e.target.value })}
                                    disabled={!examData.hasExpiration}
                                    className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-mentat-gold/70">
                            {examData.hasExpiration 
                                ? "Students cannot book this exam after the expiration date." 
                                : "If unchecked, the exam can be booked at any time."}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={cancelAction}
                        className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold
                        py-2 px-4 rounded-md border border-mentat-gold/20
                        shadow-sm shadow-mentat-gold-700"
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2
                        px-4 rounded-md shadow-sm shadow-mentat-gold-700"
                        type="submit"
                        onClick={handleDelete}
                    >
                        { isDeleting ? (
                            <div className="flex justify-center items-center">
                                <RingSpinner size={'xs'} color={'mentat-gold'} />
                                <p className="ml-3 text-sm text-mentat-gold">Deleting...</p>
                            </div>
                        ) : 'Delete Exam' }
                    </button>
                    <button
                        className="bg-mentat-gold hover:bg-mentat-gold-700 text-crimson font-bold
                        py-2 px-4 rounded-md shadow-sm shadow-mentat-gold-700"
                        type="submit"
                        onClick={handleUpdate}
                    >
                        { isModifying ? (
                            <div className="flex justify-center items-center">
                                <RingSpinner size={'xs'} color={'crimson-700'} />
                                <p className="ml-3 text-sm text-crimson-700">Modifying...</p>
                            </div>
                        ) : 'Modify Exam' }
                    </button>
                </div>
            </form>
        </div>
    );
}


