'use client';

import { motion } from 'framer-motion';
import { MouseEvent } from 'react';
import { ExamOld, ExamProp, Course, ExamResultProper } from '@/components/types/exams';
import Grade from "@/components/types/grade";
import ExamResult from "@/components/types/exam_result";
import { Calendar, Award, AlertCircle, LucideCircleCheck, CircleX } from 'lucide-react';
import React, {useEffect, useRef, useState} from "react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import Modal from "@/components/services/Modal";
import {RingSpinner} from "@/components/UI/Spinners";
import ScheduledExamDetailsComponent, {ExamAction} from "@/app/schedule/localComponents/ScheduledExamDetails";
import {useSession} from "next-auth/react";

export interface ExamMedium extends ExamResult {
    exam_name: string;
    exam_course_name: string;
    exam_duration: string;
    exam_required: number;
    exam_online: number;
    status: 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending';
}

interface ExamCardExtendedProps {
    exam: ExamProp;
    index: number;
    onclick?: (e: any) => void;
}

interface ExamCardMediumProps {
    exam: Grade;
    index: number;
    onclick?: (e: any) => void;
    updateAction?: () => void;
}

interface ExamCardCompactProps {
    exam: ExamMedium;
    index: number;
    onclick?: (e: any) => void;
}

/**
 * Global Exam Card functions
 */
// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        upcoming: { color: 'bg-blue-100 text-blue-800', icon: <Calendar className="w-3 h-3" /> },
        completed: { color: 'bg-green-100 text-green-800', icon: <Award className="w-3 h-3" /> },
        canceled: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" /> },
        missing: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" /> }
    };

    const config =
        statusConfig[status as keyof typeof statusConfig]
        || { color: 'bg-gray-100 text-gray-800', icon: '📝' };

    return (
        <span className={`inline-flex items-center px-1 py-0.5 rounded-full
            text-[10px] font-medium ${config.color}`}>
          <span className="mr-1">{config.icon}</span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// Score Display Component
const ScoreDisplay = ({ score }: { score: string }) => {
    let scoreColor = 'text-red-600';

    if (score == 'A') scoreColor = 'text-green-600';
    else if (score == 'B') scoreColor = 'text-green-500';
    else if (score == 'C') scoreColor = 'text-yellow-600';

    return (
        <div className="flex items-center">
            <span className="text-sm mr-1">Score:</span>
            <span className={`text-sm font-bold ${scoreColor}`}>
                {score}
            </span>
        </div>
    );
};

// Determine course name for an exam
export const getExamPropCourse = (exam: Grade): string => {
    return exam.courseName;
};

// Determine exam status based on date and grade
export const getExamPropStatus =
    (exam: Grade): 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending' => {
        // Get the proper exam scheduled date, with timezone
        const examDate = new Date(exam.examScheduledDate);
        const examPstDate = new Date(examDate.toLocaleString('en-US',
            { timeZone: 'America/Los_Angeles' }));
        // Get the today's date, with timezone
        const today = new Date();
        const todayPstDate = new Date(today.toLocaleString('en-US',
            { timeZone: 'America/Los_Angeles' }));
        // If exam date is in the future, it's upcoming
        if (examPstDate > todayPstDate) return 'upcoming';
        // If exam date is in the past and has a score, it's completed
        else if ((exam.examScore !== undefined) && (exam.examScore !== '')) return 'completed';
        // If no exam date and no score
        else if ((exam.examScheduledDate == undefined)
            && (exam.examScore == undefined) || (exam.examScore == '')) return 'missing';
        // If the exam date is in the past but no score, it's pending
        else return 'pending';
    };

/**
 * These are the card components
 */
// Mid-size ExamCard Component
export function ExamCardMedium({ exam, index, onclick, updateAction }: ExamCardMediumProps ) {
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    // Get the status of the exam
    const examStatus = getExamPropStatus(exam);
    // Session Information
    const {data: session, status} = useSession();

    const [isHovered, setIsHovered] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    // Overlay for delete operations
    const [activeOverlay, setActiveOverlay] = useState<number | null>(null);

    // Add a timeout ref to your component
    const closeTimeoutRef = useRef(null);

    const actionBox = document.getElementById('action-box');

    // Accent color for cards
    const accentColor = 'rgba(163, 15, 50, 1.0)';
    const accentStyle = {
        content: '',
        position: 'absolute' as const,
        bottom: 0,
        right: 0,
        width: '80px',
        height: '80px',
        background: `radial-gradient(circle at bottom right, ${accentColor} 0%, transparent 55%)`,
        pointerEvents: 'none' as const,
        zIndex: 0,
    };

    // Exam Status Badge details
    const getStatusBadge = ({ status }: { status: string}) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', icon: <LucideCircleCheck className="w-4 h-4" /> },
            inactive: { color: 'bg-red-100 text-red-800', icon: <CircleX className="w-4 h-4" /> }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', icon: '📝' };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${config.color}`}>
                <span className="">{config.icon}</span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const openScheduledExamData =
        async (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        // Show the event object:
        let actionBox = event.currentTarget.querySelector('#action-box');
        let current = event.currentTarget;
        current?.classList.add('z-10');
        actionBox?.classList.replace('opacity-0', 'opacity-100');
        actionBox?.classList.replace('pointer-events-none', 'pointer-events-auto');
    }

    const closeScheduledExamData =
        async (event: MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        // Show the event object:
        let actionBox = event.currentTarget.querySelector('#action-box');
        let current = event.currentTarget

        actionBox?.classList.replace('opacity-100', 'opacity-0');
        actionBox?.classList.replace('pointer-events-auto', 'pointer-events-none');
        current?.classList.remove('z-10');
    }

    // Handle Delete
    const handleDelete = async (id: number) => {
        // Set overlay
        setActiveOverlay(id);

        // API Handler call
        try {
            console.log("Deleting Exam Result");
            // API Handler
            const res = await apiHandler(
                undefined,
                "DELETE",
                `api/exam/result/${id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.message || "Failed to delete the scheduled exam!");
            } else {
                toast.success("Successfully deleted the scheduled exam!");
                // updateExam(undefined);
                console.log("Exam Result Deletion Succeeded.");
                console.log(res.toString());
            }
        } catch (e) {
            toast.error("Exam Result Deletion Failed");
        } finally {
            setActiveOverlay(null);
            // Run the cancel/close callback
            if (updateAction) updateAction();
        }
    }

    return (
        <div className="relative">
            <motion.div
                className="relative rounded-lg bg-card-color border p-3 flex flex-col hover:shadow-md
            hover:shadow-crimson-700 transition-shadow"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={onclick}
                onMouseEnter={(e) => openScheduledExamData(e)}
                onMouseLeave={(e) => closeScheduledExamData(e)}
            >
                <div className="flex justify-between items-start pb-0.5 mb-1">
                    <h3 className="font-semibold text-mentat-gold text-sm truncate
                        hover:whitespace-normal hover:overflow-visible hover:z-10">
                        {exam.examName}
                    </h3>
                    <div className="flex items-start">
                        <span className="text-xs rounded-full flex gap-1 whitespace-nowrap">
                            <StatusBadge status={examStatus}/>
                        </span>
                    </div>
                </div>

                <hr className="border border-crimson" />

                <div className="flex justify-start mt-1">
                    <span className="text-[11px] font-medium text-mentat-gold pb-0.5 rounded">
                    <span className="italic">Date</span>
                        : {' '}
                        <span className="text-[#ff9719]">
                            {exam.examScheduledDate.toLocaleString('en-US',
                                { timeZone: 'America/Los_Angeles' })}
                        </span>
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-mentat-gold pb-0.5 text-end rounded">
                    <span className="italic">Duration</span>
                        : <span className="text-mentat-gold/80">
                            {exam.examDuration || 1} hour(s)
                        </span>
                    </span>
                    <span className="text-[11px] font-medium text-mentat-gold pb-0.5 text-end rounded">
                      <span className="italic">Online</span>
                        : {exam.examOnline ? (
                            <span className="text-[#2e8b57]">
                                True
                            </span>) : (
                                <span className="text-slate-500">
                                    False
                                </span>
                        )}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-mentat-gold">
                      <span className="italic">Version</span>
                      : <span className="text-mentat-gold/80">
                            {exam.examVersion > 1 ? exam.examVersion : 1} attempt(s)
                        </span>
                    </span>
                    <span className="text-[11px] font-medium text-mentat-gold">
                      {exam.examRequired === 1 ? (
                          <span className="text-[#2e8b57]">
                              Required
                          </span>) : (
                              <span className="text-slate-500">
                                  Not Required
                              </span>)}
                    </span>
                </div>

                {/* Schedule Action Box */}
                <div
                    id="action-box"
                    className="absolute left-0 right-0 bottom-0 transform translate-y-full
                       flex flex-col justify-end mt-0
                       opacity-0 pointer-events-none
                       transition-opacity duration-200 ease-in-out delay-150"
                >
                    <div className="flex justify-between items-center border border-white/20
                       rounded-b-lg bg-card-color/10 p-2
                       backdrop-blur-lg backdrop-saturate-150">
                        <button
                            className={`px-1 py-1 rounded text-xs font-medium transition-colors flex-1 mx-1
                             bg-crimson hover:bg-crimson shadow-sm shadow-mentat-gold-700
                             backdrop-blur-sm`}
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Reschedule clicked');
                                setIsScheduleModalOpen(true);

                            }}
                        >
                            Reschedule
                        </button>
                        <button
                            className={`px-1 py-1 rounded text-xs font-medium transition-colors flex-1 mx-1
                             bg-crimson hover:bg-crimson shadow-sm shadow-mentat-gold-700
                             backdrop-blur-sm opacity-100`}
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Delete clicked');
                                handleDelete(exam.examResultId);
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </motion.div>
            {/* Reschedule Action Modal */}
            <Modal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                title="Reschedule Exam Options"
                isFullScreen={true}
            >
                {isModalLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                        <RingSpinner size={'sm'} color={'mentat-gold'} />
                        <p className="mt-4 text-mentat-gold">Loading scheduled exam windows...</p>
                    </div>
                ) : (
                    <ScheduledExamDetailsComponent
                        exam={exam}
                        cancelAction={() => {
                            setIsScheduleModalOpen(false);
                        }}
                        updateAction={() => {
                            // Handle parent updates
                            if (updateAction) updateAction();
                            setIsScheduleModalOpen(false)
                        }}
                    />)}
            </Modal>
            {/* Overlay that appears when active */}
            {activeOverlay === exam.examResultId && (
                <div className="absolute inset-0 bg-mentat-black/10 backdrop-blur-sm rounded-xl
                                    flex items-center justify-center z-20"
                >
                    <div className="flex flex-col items-center justify-center">
                        <RingSpinner size={'xs'} color={'mentat-gold'} />
                        <p className="mt-2 text-mentat-gold text-xs">Deleting scheduled exam...</p>
                    </div>
                </div>
            )}
        </div>

    );
};
