'use client';

import { motion } from 'framer-motion';
import { MouseEvent } from 'react';
import Grade from "@/components/types/grade";
import ExamResult from "@/components/types/exam_result";
import { Calendar, Award, AlertCircle } from 'lucide-react';
import React, {useEffect, useRef, useState} from "react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import Modal from "@/components/services/Modal";
import { RingSpinner } from "@/components/UI/Spinners";
import ScheduledExamDetailsComponent from "@/app/schedule/localComponents/ScheduledExamDetails";
import { useSession } from "next-auth/react";

/**
 * Props for the Component
 */
interface ExamCardMediumProps {
    exam: Grade;
    index: number;
    onclick?: (e: any) => void;
    updateAction?: () => void;
}

/**
 * Global Exam Card functions
 */
// Determine course name for an exam
export const getExamPropCourse = (exam: Grade): string => {
    return exam.courseName;
};

/**
 * Determine grade status based on exam score, and exam date
 * @param exam
 */
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
 * This is the card component that will render a
 * medium size card with the exam result information
 * available
 * @param exam
 * @param index
 * @param onclick
 * @param updateAction
 * @constructor
 * @author Joshua Summers
 */
export function ExamCardMedium({ exam, index, onclick, updateAction }: ExamCardMediumProps ) {
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
    // Modal state checks
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    // Overlay for delete operations
    const [activeOverlay, setActiveOverlay] = useState<number | null>(null);
    // Refs for the elements we need to manipulate
    const examContainerRef = useRef<HTMLDivElement>(null);
    const actionBoxRef = useRef<HTMLDivElement>(null);
    // This is the Backend API data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

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
     * Status Badge Component
     * This will render a status badge into the layout
     * based on exam information
     * @param status
     * @constructor
     */
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

    // /**
    //  * Determine grade status based on exam score, and exam date
    //  * @param exam
    //  */
    // const getExamPropStatus =
    //     (exam: Grade): 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending' => {
    //         // Get the proper exam scheduled date, with timezone
    //         const examDate = new Date(exam.examScheduledDate);
    //         const examPstDate = new Date(examDate.toLocaleString('en-US',
    //             { timeZone: 'America/Los_Angeles' }));
    //         // Get the today's date, with timezone
    //         const today = new Date();
    //         const todayPstDate = new Date(today.toLocaleString('en-US',
    //             { timeZone: 'America/Los_Angeles' }));
    //         // If exam date is in the future, it's upcoming
    //         if (examPstDate > todayPstDate) return 'upcoming';
    //         // If exam date is in the past and has a score, it's completed
    //         else if ((exam.examScore !== undefined) && (exam.examScore !== '')) return 'completed';
    //         // If no exam date and no score
    //         else if ((exam.examScheduledDate == undefined)
    //             && (exam.examScore == undefined) || (exam.examScore == '')) return 'missing';
    //         // If the exam date is in the past but no score, it's pending
    //         else return 'pending';
    // };

    // Get the status of the exam
    const examStatus = getExamPropStatus(exam);


    // Helper function to determine expiration status
    const getExpirationStatus = (exam: Grade): 'expired' | 'expiring-soon' | 'valid' => {
        if (!exam.expirationDate) return 'valid';

        const expirationDate = new Date(exam.expirationDate);
        const currentDate = new Date();
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        if (expirationDate < currentDate) return 'expired';
        if (expirationDate < sevenDaysFromNow) return 'expiring-soon';
        return 'valid';
    };

    // Get the expiration Status of the exam
    const expirationStatus = getExpirationStatus(exam);
    // Compound Exam Status
    const examStatusValid = (examStatus === 'pending' || examStatus === 'upcoming')
        && expirationStatus !== 'expired';

    // Determine card styling based on expiration status
    const getCardStyling = () => {
        switch (expirationStatus) {
            case 'expired':
                return 'border-red-500 bg-red-50/10';
            case 'expiring-soon':
                return 'border-orange-500 bg-orange-50/10';
            default:
                return 'border-crimson bg-card-color';
        }
    };

    /**
     * This is the handler for opening a scheduled exam
     * @param event
     */
    const openScheduledExamData =
        async (event: MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            // Process animation affect
            requestAnimationFrame(() => {
                // Check if refs are available - JUST LIKE YOUR SIDEBAR
                if (!examContainerRef.current || !actionBoxRef.current) {
                    return;
                }
                // Use the refs directly - JUST LIKE YOUR SIDEBAR
                examContainerRef.current.classList.add('z-10');
                actionBoxRef.current.classList.replace('opacity-0', 'opacity-100');
                actionBoxRef.current.classList.replace('pointer-events-none', 'pointer-events-auto');
            });
        }

    /**
     * This is the handler for closing a scheduled exam
     * @param event
     */
    const closeScheduledExamData =
        async (event: MouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            // Process animation affect
            requestAnimationFrame(() => {
                // Check if refs are available - JUST LIKE YOUR SIDEBAR
                if (!examContainerRef.current || !actionBoxRef.current) {
                    return;
                }
                // Use the refs directly - JUST LIKE YOUR SIDEBAR
                examContainerRef.current.classList.remove('z-10');
                actionBoxRef.current.classList.replace('opacity-100', 'opacity-0');
                actionBoxRef.current.classList.replace('pointer-events-auto', 'pointer-events-none');
            });
        }

    /**
     * Delete handler for deleteing scheduled exam
     * @param id
     */
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
                ref={examContainerRef}
                className={`relative rounded-lg border border-mentat-gold/20 p-3 flex flex-col
                hover:shadow-md hover:shadow-crimson-700 transition-shadow ${getCardStyling()}`}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={onclick}
                onMouseEnter={(e) =>
                    openScheduledExamData(e)}
                onMouseLeave={(e) =>
                    closeScheduledExamData(e)}
            >
                <div className="flex justify-between items-start pb-0.5 mb-1">
                    <h3 className="font-semibold text-mentat-gold text-sm truncate
                        hover:whitespace-normal hover:overflow-visible hover:z-10">
                        {exam.examName}
                    </h3>
                    {/*Always leave original code when making merge updates*/}
                    {/*<div className="flex items-start">*/}
                    {/*    <span className="text-xs rounded-full flex gap-1 whitespace-nowrap">*/}
                    {/*        <StatusBadge status={examStatus}/>*/}
                    {/*    </span>*/}
                    {/*</div>*/}
                    <div className="flex items-start gap-1">
                        <span className="text-xs rounded-full flex gap-1 whitespace-nowrap">
                            <StatusBadge status={examStatus}/>
                        </span>
                        {/* Expiration Warning Badge */}
                        {expirationStatus === 'expired' && (
                            <span className="inline-flex items-center px-1 py-0.5 rounded-full
                                text-[10px] font-medium bg-red-100 text-red-800">
                                <span className="mr-1">⚠️</span>
                                Expired
                            </span>
                        )}
                        {expirationStatus === 'expiring-soon' && (
                            <span className="inline-flex items-center px-1 py-0.5 rounded-full
                                text-[10px] font-medium bg-orange-100 text-orange-800">
                                <span className="mr-1">⏰</span>
                                Expires Soon
                            </span>
                        )}
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

                {/* Expiration Date Display */}
                {exam.expirationDate && (
                    <div className="flex justify-start mt-1">
                        <span className="text-[11px] font-medium text-mentat-gold pb-0.5 rounded">
                            <span className="italic">Expires</span>
                            : {' '}
                            <span className={`${
                                new Date(exam.expirationDate) < new Date()
                                    ? 'text-red-500'
                                    : new Date(exam.expirationDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                        ? 'text-orange-500'
                                        : 'text-green-500'
                            }`}>
                                {new Date(exam.expirationDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </span>
                    </div>
                )}

                {/* Schedule Action Box */}
                <div
                    ref={actionBoxRef}
                    id="action-box"
                    className="absolute left-0 right-0 bottom-0 transform translate-y-full
                       flex flex-col justify-end mt-0
                       opacity-0 pointer-events-none
                       transition-opacity duration-200 ease-in-out delay-150"
                >
                    <div className="flex justify-between items-center border border-white/20
                       rounded-b-lg bg-card-color/10 p-2
                       backdrop-blur-lg backdrop-saturate-150">
                        { examStatusValid && (
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
                        )}
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
            {/* Overlay that appears when delete is active */}
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