'use client'

import React, {useEffect, useState} from 'react';
import { Card, CardContent, Button } from "@/components/UI/calendar/ui"
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import Modal from "@/components/services/Modal";
import Exam from "@/components/types/exam";
import Course from "@/components/types/course";
import { ExamExtended } from "@/app/grades/util/types";
import ErrorToast from "@/components/services/error";

interface ExamDetailsComponentProps {
    exam: ExamExtended;
    cancelAction: () => void
}

export default function ExamDetailsComponent({ exam, cancelAction } : ExamDetailsComponentProps) {
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    // const [exam, updateExam] = useState<ExamProp>();

    // Session Information
    const {data: session, status} = useSession();
    const [examData, setExamData] = useState({
        examId: exam.examId,
        examName: exam.examName,
        courseId: exam.courseId.toString(),
        examDifficulty: exam.examDifficulty.toString(),
        examRequired: exam.examRequired.toString(),
        examDuration: exam.examDuration.toString(),
        examState: exam.examState.toString(),
        examOnline: exam.examOnline.toString()
    });

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
                `api/exam/${exam?.examId}`,
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
            // Run the cancel/close callback
            cancelAction();
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
                        <label htmlFor="exam_difficulty" className="text-sm">Exam Difficulty</label>
                        <input
                            id="exam_difficulty"
                            type="text"
                            name="exam_difficulty"
                            value={examData.examDifficulty}
                            onChange={(e) =>
                                setExamData({ ...examData, examDifficulty: e.target.value })}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20
                                focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                        >
                        </input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_duration" className="text-sm">Exam Duration</label>
                        <input
                            id="exam_duration"
                            type="text"
                            name="exam_duration"
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
                                    id="is_required"
                                    type="checkbox"
                                    name="is_required"
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
                                    id="exam_state"
                                    type="checkbox"
                                    name="exam_state"
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
                                    id="is_online"
                                    type="checkbox"
                                    name="is_online"
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
                        Delete
                    </button>
                    <button
                        className="bg-mentat-gold hover:bg-mentat-gold-700 text-crimson font-bold
                        py-2 px-4 rounded-md shadow-sm shadow-mentat-gold-700"
                        type="submit"
                        onClick={handleUpdate}
                    >
                        Update
                    </button>
                </div>
            </form>
        </div>
    );
}


