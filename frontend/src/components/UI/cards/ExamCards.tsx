'use client';

import { motion } from 'framer-motion';
import { Exam, ExamProp, Course } from '@/components/types/exams';
import { Calendar, Award, AlertCircle, LucideCircleCheck, CircleX } from 'lucide-react';
import {useState} from "react";

interface ExamExtended extends Exam {
    exam_course_name: string;
    exam_duration: string;
    exam_online: number;
}

interface ExamCardExtendedProps {
    exam: ExamProp;
    index: number;
    onclick?: (e: any) => void;
}

interface ExamCardCompactProps {
    exam: ExamExtended;
    index: number;
    onclick?: (e: any) => void;
}

/**
 * Global Exam Card functions
 */
// Status Badge Component
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

// Total Score Display Component
const TotalScoreDisplay = ({ score, totalScore }: { score: number; totalScore: number }) => {
    const percentage = (score / totalScore) * 100;
    let scoreColor = 'text-red-600';

    if (percentage >= 90) scoreColor = 'text-green-600';
    else if (percentage >= 80) scoreColor = 'text-green-500';
    else if (percentage >= 70) scoreColor = 'text-yellow-600';
    else if (percentage >= 60) scoreColor = 'text-yellow-500';

    return (
        <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-1">Score:</span>
            <span className={`text-sm font-bold ${scoreColor}`}>
        {score}/{totalScore}
      </span>
            <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
        </div>
    );
};

// Determine exam status based on date and grade
export const getExamPropStatus = (exam: ExamProp): 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending' => {
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

// Determine exam status based on date and grade
export const getExamStatus = (exam: ExamExtended): 'active' | 'inactive' => {
    // Check for active states
    if (exam.exam_state == 1) return 'active';
    // Check for inactive states
    else if (exam.exam_state == 0) return 'inactive';
    // Default state is inactive
    else return 'inactive';
};

// Determine course name for an exam
export const getExamCourse = (exam: Exam): string => {
    // TODO: Fix this exam type safety, this is technical debt
    return (exam as any).course;
};

// Determine course name for an exam
export const getExamPropCourse = (exam: ExamProp): string => {
    return exam.exam_course_name;
};

/**
 * These are the card components
 */
// Extended ExamCard Component
export function ExamCardExtended({ exam, index, onclick }: ExamCardExtendedProps) {
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
            className="rounded-lg border border-gray-200 bg-card-color p-2 hover:shadow-md transition-shadow"
            style={{ position: 'relative', overflow: 'hidden',
                boxShadow: `1px 1px 6px 1px ${accentColor}` }}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onclick}
        >
            {/* Add card accent coloring */}
            <div style={accentStyle}/>
                {/* Draw the cards */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex items-center justify-between">
                        {/* Left section: Title and subject */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold truncate">{exam.exam_name}</h3>
                            </div>
                            <p className="text-sm mt-1">{exam.exam_course_name}</p>
                        </div>

                        {/* Middle section: Date and time */}
                        <div className="flex flex-col items-center mx-6 px-6 border-l border-r border-gray-100">
                            <span className="text-sm font-medium">
                                {new Date(exam.exam_taken_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}
                                {/*TODO: Fix this exam type safety*/}
                                <span className="text-xs mt-1"> {(exam as any).exam.hour ?? 1} hours</span>
                                <span className="text-xs"> {(exam as any).exam_minutes ?? 0} mins</span>
                            </span>
                        </div>

                        {/* Right section: Location and score */}
                        <div className="flex-1 flex flex-col items-end">
                            <StatusBadge status={status}/>
                            <span className="text-sm">{exam.location}</span>
                            {status === 'completed' && exam.exam_score !== undefined
                                && exam.exam_score !== null ? (
                                <ScoreDisplay score={exam.exam_score} />
                            ) : (
                                <div className="mt-1 text-xs font-medium">
                                    {new Date(exam.exam_scheduled_date) > new Date() ? 'Upcoming'
                                        : 'Pending grade'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
        </motion.div>
    );
}

// Compact ExamCard Component
export function ExamCardSmall({ exam, index, onclick }: ExamCardCompactProps ) {
    // Get exam status
    exam.status = getExamStatus(exam);
    const [isHovered, setIsHovered] = useState(false);

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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <span className="mr-1">{config.icon}</span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <motion.div
            className="rounded-lg bg-card-color border p-3 flex flex-col hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={onclick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/*<div style={accentStyle}/>*/}
            {isHovered && <div style={accentStyle} />}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-mentat-gold text-sm truncate">{exam.exam_name}</h3>
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    {/*TODO: Fix type safety*/}
                    <span>{getStatusBadge(exam as any)}</span>
                </span>
            </div>

            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-mentat-gold py-1 rounded">
                  {exam.exam_course_name}
                </span>
                <span className="text-xs text-mentat-gold py-1 text-end rounded">
                  Difficulty Level: {exam.exam_difficulty}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-mentat-gold">
                  {exam.exam_required === 1 ? 'Required' : 'Not Required'}
                </span>

                {/*{exam.status === 'active' && exam.score !== undefined ? (*/}
                {/*    <div className="flex items-center gap-1">*/}
                {/*        <span className="text-xs font-semibold text-gray-700">*/}
                {/*          Score:*/}
                {/*        </span>*/}
                {/*        <span className={`text-xs font-bold ${exam.score == 'A' ? 'text-green-600' : exam.score == 'B' ? 'text-yellow-600' : 'text-red-600'}`}>*/}
                {/*          {exam.score}*/}
                {/*        </span>*/}
                {/*    </div>*/}
                {/*) : (*/}
                {/*    <span className="text-xs font-medium text-gray-500">*/}
                {/*        {new Date(exam.exam_scheduled_date) > new Date() ? 'Upcoming' : 'Pending results'}*/}
                {/*    </span>*/}
                {/*)}*/}
            </div>
        </motion.div>
    );
};
