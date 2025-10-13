'use client';

import { motion } from 'framer-motion';
import {ExamOld, ExamProp, Course, ExamResultProper} from '@/components/types/exams';
import ExamResult from "@/components/types/exam_result";
import { Calendar, Award, AlertCircle, LucideCircleCheck, CircleX } from 'lucide-react';
import React, {useEffect, useRef, useState} from "react";
import Modal from "@/components/services/Modal";
import {RingSpinner} from "@/components/UI/Spinners";
import ScheduledExamDetailsComponent, {ExamAction} from "@/app/schedule/localComponents/ScheduledExamDetails";

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
    exam: ExamMedium;
    index: number;
    onclick?: (e: any) => void;
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

// Determine exam status based on date and grade
export const getExamPropStatus =
    (exam: ExamResult): 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending' => {
        // Get the proper exam scheduled date, with timezone
        const examDate = new Date(exam.exam_scheduled_date);
        const examPstDate = new Date(examDate.toLocaleString('en-US',
            { timeZone: 'America/Los_Angeles' }));
        // Get the today's date, with timezone
        const today = new Date();
        const todayPstDate = new Date(today.toLocaleString('en-US',
            { timeZone: 'America/Los_Angeles' }));
        // If exam date is in the future, it's upcoming
        if (examPstDate > todayPstDate) return 'upcoming';
        // If exam date is in the past and has a score, it's completed
        else if ((exam.exam_score !== undefined) && (exam.exam_score !== '')) return 'completed';
        // If no exam date and no score
        else if (((exam.exam_scheduled_date == undefined) || (exam.exam_scheduled_date == ''))
            && (exam.exam_score == undefined)|| (exam.exam_score == '')) return 'missing';
        // If the exam date is in the past but no score, it's pending
        else return 'pending';
    };

/**
 * These are the card components
 */
// Mid-size ExamCard Component
export function ExamCardMedium({ exam, index, onclick }: ExamCardMediumProps ) {
    // Get the status of the exam
    const status = getExamPropStatus(exam);
    // exam.status = status;

    const [isHovered, setIsHovered] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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

    const showCardActions = (e) => {

    }

    const openScheduledExamData = async (event) => {
        event.preventDefault();
        // Clear any pending close timeout
        // if (closeTimeoutRef.current) {
        //     clearTimeout(closeTimeoutRef.current);
        //     closeTimeoutRef.current = null;
        // }
        // Show the event object:
        let actionBox = event.currentTarget.querySelector('#action-box');
        let current = event.currentTarget;
        current?.classList.add('z-10');
        actionBox?.classList.replace('opacity-0', 'opacity-100');
        actionBox?.classList.replace('pointer-events-none', 'pointer-events-auto');

        // console.log(event.currentTarget.querySelector('#action-box'));

    }

    const closeScheduledExamData = async (event) => {
        event.preventDefault();
        // Show the event object:
        let actionBox = event.currentTarget.querySelector('#action-box');
        let current = event.currentTarget

        actionBox?.classList.replace('opacity-100', 'opacity-0');
        actionBox?.classList.replace('pointer-events-auto', 'pointer-events-none');
        current?.classList.remove('z-10');

        // // Set a timeout before actually closing
        // closeTimeoutRef.current = setTimeout(() => {
        //     // let actionBox = event.currentTarget.querySelector('#action-box');
        //     actionBox?.classList.replace('opacity-100', 'opacity-0');
        //     actionBox?.classList.replace('pointer-events-auto', 'pointer-events-none');
        //     current?.classList.remove('z-10');
        // }, 800); // 300ms delay before closing

    }

    // useEffect(() => {
    //     if (isHovered) {
    //         console.log('hovered', isHovered);
    //         // actionBox?.classList.remove("hidden");
    //     }
    //     else {
    //         console.log('unhovered', isHovered);
    //         // actionBox?.classList.add("hidden");
    //         // actionBox.classList.add("bg-mentat-black")
    //     }
    // }, [isHovered]);

    return (
        // <motion.div
        //     className="relative rounded-lg bg-card-color border p-3 flex flex-col hover:shadow-md
        //         hover:shadow-crimson-700 transition-shadow"
        //     whileHover={{ y: -2 }}
        //     initial={{ opacity: 0, y: 10 }}
        //     animate={{ opacity: 1, y: 0 }}
        //     exit={{ opacity: 0 }}
        //     onClick={onclick}
        //     // onMouseEnter={() => setIsHovered(true)}
        //     // onMouseLeave={() => setIsHovered(false)}
        //     onMouseEnter={(e) =>
        //         openScheduledExamData(e)}
        //     onMouseLeave={(e) =>
        //         closeScheduledExamData(e)}
        // >
        //     {/*<div style={accentStyle}/>*/}
        //     {/*{isHovered && <div style={accentStyle} />}*/}
        //     <div className="flex justify-between items-start mb-2">
        //         <h3 className="font-semibold text-mentat-gold text-sm truncate">{exam.exam_name}</h3>
        //         <span className="text-xs py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
        //             {/*TODO: Fix type safety*/}
        //             <StatusBadge status={status}/>
        //         </span>
        //     </div>
        //
        //     <div className="flex justify-between items-center mb-2">
        //         <span className="text-xs text-mentat-gold py-1 rounded">
        //           {exam.exam_course_name}
        //         </span>
        //         <span className="text-xs text-mentat-gold py-1 text-end rounded">
        //           Difficulty Level: {exam.exam_difficulty}
        //         </span>
        //     </div>
        //
        //     <div className="flex justify-between items-center">
        //         <span className="text-xs font-medium text-mentat-gold">
        //           {exam.exam_required === 1 ? 'Required' : 'Not Required'}
        //         </span>
        //
        //         {/*{exam.status === 'active' && exam.score !== undefined ? (*/}
        //         {/*    <div className="flex items-center gap-1">*/}
        //         {/*        <span className="text-xs font-semibold text-gray-700">*/}
        //         {/*          Score:*/}
        //         {/*        </span>*/}
        //         {/*        <span className={`text-xs font-bold ${exam.score == 'A' ? 'text-green-600' : exam.score == 'B' ? 'text-yellow-600' : 'text-red-600'}`}>*/}
        //         {/*          {exam.score}*/}
        //         {/*        </span>*/}
        //         {/*    </div>*/}
        //         {/*) : (*/}
        //         {/*    <span className="text-xs font-medium text-gray-500">*/}
        //         {/*        {new Date(exam.exam_scheduled_date) > new Date() ? 'Upcoming' : 'Pending results'}*/}
        //         {/*    </span>*/}
        //         {/*)}*/}
        //     </div>
        //     {/*<div*/}
        //     {/*    id={"action-box"}*/}
        //     {/*    className="absolute mt-4 flex flex-col justify-end h-full action-box hidden"*/}
        //     {/*>*/}
        //     {/*    <div className="flex justify-between items-center border border-gray-200">*/}
        //     {/*        <button*/}
        //     {/*            className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors*/}
        //     {/*                 bg-crimson hover:bg-crimson-700 shadow-sm shadow-mentat-gold-700`}*/}
        //     {/*            onClick={() => console.log('button clicked')}*/}
        //     {/*        >*/}
        //     {/*            Reschedule*/}
        //     {/*        </button>*/}
        //     {/*        <button*/}
        //     {/*            className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors*/}
        //     {/*                 bg-crimson hover:bg-crimson-700 shadow-sm shadow-mentat-gold-700`}*/}
        //     {/*            onClick={() => console.log('button clicked')}*/}
        //     {/*        >*/}
        //     {/*            Cancel*/}
        //     {/*        </button>*/}
        //     {/*    </div>*/}
        //     {/*</div>*/}
        //
        //     {/*Schedule Action Box*/}
        //     <div
        //         id="action-box"
        //         className="absolute left-0 right-0 bottom-0 transform translate-y-full
        //            flex flex-col justify-end mt-0
        //            opacity-0 pointer-events-none
        //            transition-opacity duration-100 ease-linear"
        //     >
        //         <div className="flex justify-between items-center border border-white/20
        //        rounded-b-lg bg-card-color/10 p-2
        //        backdrop-blur-lg backdrop-saturate-150">
        //             <button
        //                 className={`px-1 py-1 rounded text-xs font-medium transition-colors flex-1 mx-1
        //          bg-crimson/90 hover:bg-crimson shadow-sm shadow-mentat-gold-700
        //          backdrop-blur-sm`}
        //                 onClick={(e) => {
        //                     e.stopPropagation();
        //                     console.log('Reschedule clicked');
        //                 }}
        //             >
        //                 Reschedule
        //             </button>
        //             <button
        //                 className={`px-1 py-1 rounded text-xs font-medium transition-colors flex-1 mx-1
        //          bg-crimson/90 hover:bg-crimson shadow-sm shadow-mentat-gold-700
        //          backdrop-blur-sm opacity-100`}
        //                 onClick={(e) => {
        //                     e.stopPropagation();
        //                     console.log('Cancel clicked');
        //                 }}
        //             >
        //                 Cancel
        //             </button>
        //         </div>
        //     </div>
        //
        // </motion.div>
        <div>
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
                <div className="flex justify-between items-start pb-0.5">
                    <h3 className="font-semibold text-mentat-gold text-sm truncate
                        hover:whitespace-normal hover:overflow-visible hover:z-10">
                        {exam.exam_name}
                    </h3>
                    <div className="flex items-start">
                        <span className="text-xs rounded-full flex gap-1 whitespace-nowrap">
                            <StatusBadge status={status}/>
                        </span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <span className="text-[11px] font-medium text-mentat-gold pb-0.5 rounded">
                    <span className="italic">Date</span>
                        : {' '}
                        <span className="text-green-500">
                            {exam.exam_scheduled_date}
                        </span>
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-mentat-gold pb-0.5 text-end rounded">
                    <span className="italic">Duration</span>
                        : {exam.exam_duration || 1}
                    </span>
                    <span className="text-[11px] font-medium text-mentat-gold pb-0.5 text-end rounded">
                      <span className="italic">Online</span>
                        : {exam.exam_online ? (
                            <span className="text-[#DA70D6]">
                                True
                            </span>) : 'False'}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-mentat-gold">
                      <span className="italic">Version</span>
                      : {exam.exam_version > 1 ? exam.exam_version : 1}
                    </span>
                    <span className="text-[11px] font-medium text-mentat-gold">
                      {exam.exam_required === 1 ? (
                          <span className="text-[#E0B0FF]">
                              Required
                          </span>) : ('Not Required')}
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
                                console.log('Cancel clicked');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                    {/*/!* Add buffer zone *!/*/}
                    {/*<div className="h-4 w-full bg-transparent"></div>*/}
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
                        exam={exam as ExamAction}
                        cancelAction={() => {
                            setIsScheduleModalOpen(false);
                            // Trigger refresh when modal closes
                            // setRefreshTrigger(prev => prev + 1);
                        }}
                    />)}
            </Modal>
        </div>
    );
};
