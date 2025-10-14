'use client';

import { motion } from 'framer-motion';
import { LucideCircleCheck, CircleX, Hourglass } from 'lucide-react';
import { ExamExtended } from "@/app/grades/util/types";
import { useState } from "react";

interface ExamCardCompactProps {
    exam: ExamExtended;
    index: number;
    onclick?: (e: any) => void;
}
// Compact ExamCard Component
export function ExamCardSmall({ exam, index, onclick }: ExamCardCompactProps ) {

    // Determine exam status based on date and grade
    const getExamStatus =
        (exam: ExamExtended): 'active' | 'inactive' => {
            // Check for active states
            if (exam.examState == 1) return 'active';
            // Check for inactive states
            else if (exam.examState == 0) return 'inactive';
            // Default state is inactive
            else return 'inactive';
        };

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
            className="rounded-lg bg-card-color border p-3 flex flex-col hover:shadow-md
                hover:shadow-crimson-700 transition-shadow"
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
                <h3 className="font-semibold text-mentat-gold text-sm truncate">{exam.examName}</h3>
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                    {/*TODO: Fix type safety*/}
                    <span>{getStatusBadge(exam as any)}</span>
                </span>
            </div>

            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-mentat-gold py-1 rounded">
                  {exam.courseName}
                </span>
                <span className="text-xs text-mentat-gold py-1 text-end rounded">
                  Difficulty Level: {exam.examDifficulty}
                </span>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-mentat-gold">
                  {exam.examRequired === 1 ? 'Required' : 'Not Required'}
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