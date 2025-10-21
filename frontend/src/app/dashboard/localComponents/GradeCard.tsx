'use client';

import { motion } from 'framer-motion';
import { Calendar, Award, AlertCircle } from 'lucide-react';
import React from "react";
import { ExamResultExtended } from "@/app/dashboard/types/shared";

interface ExamCardExtendedProps {
    exam: ExamResultExtended;
    index: number;
    onclick?: (e: any) => void;
}

/**
 * Status Badge layout
 * This will create a status badge based on
 * exam status
 * @param status
 * @constructor
 */
const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        upcoming: { color: 'bg-blue-100 text-blue-800', icon: <Calendar className="w-4 h-4" /> },
        completed: { color: 'bg-green-100 text-green-800', icon: <Award className="w-4 h-4" /> },
        canceled: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
        missing: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', icon: '📝' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
          <span className="mr-1">{config.icon}</span>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

/**
 * This will display the current score for the exam
 * This will style the response accodingly
 * @param score
 * @constructor
 */
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
    (exam: ExamResultExtended): 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending' => {
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
            && (exam.examScore == undefined)|| (exam.examScore == '')) return 'missing';
        // If the exam date is in the past but no score, it's pending
        else return 'pending';
    };

/**
 * This is the grade card that will contain the details
 * of an exam result. This will render the details
 * in an Extended card, that will fill the row
 * @param exam
 * @param index
 * @param onclick
 * @constructor
 * @author Joshua Summers
 */
export function GradeCardExtended({ exam, index, onclick }: ExamCardExtendedProps) {
    // Get the status of the exam
    const status = getExamPropStatus(exam);

    // Accent color for cards
    const accentColor = 'rgba(163, 15, 50, 1.0)';
    const accentStyle = {
        content: '',
        position: 'absolute' as const,
        bottom: 0,
        right: 0,
        width: '80px',
        height: '80px',
        background: `radial-gradient(circle at bottom right, ${accentColor} 0%, transparent 50%)`,
        pointerEvents: 'none' as const,
        zIndex: 0,
    };

    return (
        <motion.div
            className={`rounded-xl shadow-sm shadow-crimson-700 hover:shadow-md
            hover:shadow-crimson-700`}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onclick}
        >
            <div
                className="rounded-lg border border-mentat-gold/20 bg-card-color p-2 transition-shadow"
                style={{ position: 'relative', overflow: 'hidden'}}
            >
                {/* Add card accent coloring */}
                <div style={accentStyle}/>
                {/* Draw the cards */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex items-center justify-between">
                        {/* Left section: Title and subject */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold truncate">{exam.examName}</h3>
                            </div>
                            <p className="text-sm mt-1">{exam.courseName}</p>
                        </div>

                        {/* Middle section: Date and time */}
                        <div className="flex flex-col items-center mx-6 px-6 border-l border-r border-mentat-gold/40">
                            <span className="text-md font-semibold italic">
                                Date: { exam.examTakenDate ? (
                                <React.Fragment>
                                        <span className="text-sm font-medium not-italic">
                                            {new Date(exam.examTakenDate).toLocaleDateString('en-US',
                                                { weekday: 'short', month: 'short', day: 'numeric'})}
                                        </span>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                        <span className="text-sm font-medium not-italic">
                                            {new Date(exam.examScheduledDate).toLocaleDateString('en-US',
                                                { weekday: 'short', month: 'short', day: 'numeric'})}
                                        </span>

                                </React.Fragment>
                            )}
                            </span>
                            <p className="text-sm font-semibold">
                                <span className="text-xs mt-1 italic">
                                    Duration: <span className="text-sm not-italic font-medium">
                                        {exam.examDuration || 1} hour(s)
                                    </span>
                                </span>
                            </p>
                        </div>

                        {/* Right section: Location and score */}
                        <div className="flex-1 flex flex-col items-end">
                            <StatusBadge status={status}/>
                            {status === 'completed' && exam.examScore !== undefined
                            && exam.examScore !== null ? (
                                <ScoreDisplay score={exam.examScore} />
                            ) : (
                                <div className="mt-1 text-xs font-medium">
                                    {new Date(exam.examScheduledDate) > new Date() ? 'Upcoming'
                                        : 'Pending grade'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

    );
}