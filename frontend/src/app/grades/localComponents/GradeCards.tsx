'use client';

import { motion } from 'framer-motion';
import { LucideCircleCheck, CircleX, Hourglass } from 'lucide-react';
import { Grade, GradeCardExtendedProps } from '@/components/types/exams';

// Determine grade status based on score
export const getGradeStatus = (grade: Grade): 'passed' | 'failed' | 'pending' | undefined => {
    // Grade arrays
    const passingGrade = ['A', 'B', 'C'];
    const failingGrade = ['D', 'F'];

    // If a score exists:
    if (grade?.exam_score) {
        // Check for active states
        if (passingGrade.includes(grade?.exam_score)) return 'passed';
        // Check for inactive states
        else if (failingGrade.includes(grade?.exam_score)) return 'failed';
    }
    // Default state is pending
    else return 'pending';
};

// Score Display Component
const ScoreDisplay = ({ score }: { score: string | undefined }) => {
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

/**
 * These are the card components
 */
// Extended GradeCard Component
export function GradeCardExtended({ grade, index, onclick }: GradeCardExtendedProps) {
    // Grade Status Badge details
    const StatusBadge = ({ status }: { status: string}) => {
        const statusConfig = {
            passed: { color: 'bg-green-100 text-green-800', icon: <LucideCircleCheck className="w-4 h-4" /> },
            failed: { color: 'bg-red-100 text-red-800', icon: <CircleX className="w-4 h-4" /> },
            pending: { color: 'bg-blue-100 text-blue-800', icon: <Hourglass className="w-4 h-4" /> }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', icon: '📝' };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <span className="mr-1">{config.icon}</span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // View variables
    const darkCimson = '#61091e';
    const examTaken = (grade.exam_taken_date !== undefined && grade.exam_taken_date !== null);

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
            className="rounded-md border border-gray-200 bg-card-color px-2 py-1 hover:shadow-md transition-shadow"
            style={{ position: 'relative', overflow: 'hidden',
                boxShadow: `1px 1px 1px 1px ${accentColor}` }}
            whileHover={{ y: -1, backgroundColor: darkCimson, opacity: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onclick}
        >
            {/* Add card accent coloring */}
            {/*<div style={accentStyle}/>*/}
            {/* Draw the cards */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex items-center justify-between">
                    {/* Left section: Title and subject */}
                    <div className="flex-1 min-w-0 pr-6 border-r border-gray-100">
                        <div className="flex items-center space-x-3 ">
                            <h3 className="text-md font-semibold truncate">{grade.exam_name}</h3>
                            {/*<span className="text-sm mt-1">{grade.course_name}</span>*/}
                        </div>

                    </div>

                    <div className="flex-1 min-w-0 px-6 border-r border-gray-100">
                        <div className="flex items-center justify-center space-x-3">
                            <span className="text-sm font-semibold truncate">{grade.course_name}</span>
                            {/*<span className="text-sm mt-1">{grade.course_name}</span>*/}
                        </div>

                    </div>

                    {/* Middle section: Date and time */}
                    <div className="flex flex-col items-center px-6 border-r border-gray-100">
                        <span className="text-sm font-medium">
                            { examTaken && grade?.exam_taken_date ?
                            new Date(grade?.exam_taken_date).toLocaleDateString('en-US',
                                { weekday: 'short', month: 'short', day: 'numeric'})
                                :
                            new Date(grade.exam_scheduled_date).toLocaleDateString('en-US',
                                { weekday: 'short', month: 'short', day: 'numeric'})}
                            {/*{new Date(grade.exam_taken_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}*/}
                        </span>
                    </div>

                    {/*<div className="flex flex-col items-center mx-6 px-6 border-l border-r border-gray-100">*/}
                    {/*    <span className="text-sm font-medium">*/}
                    {/*        {new Date(grade.exam_taken_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}*/}
                    {/*        <span className="text-xs mt-1"> {grade.exam_length ?? 1} hours</span>*/}
                    {/*        <span className="text-xs"> {grade.duration ?? 0} mins</span>*/}
                    {/*    </span>*/}
                    {/*</div>*/}

                    <div className="flex-1 flex flex-col items-center px-6 border-r border-gray-100">
                        {/*<StatusBadge status={grade.status !== undefined ? grade.status : ''} />*/}
                        {/*<span className="text-sm">{grade.location}</span>*/}
                        {grade.status !== 'pending' && grade.exam_score !== undefined ? (
                            <ScoreDisplay score={grade.exam_score} />
                        ) : (
                            <div className="mt-1 text-xs font-medium">
                                {new Date(grade.exam_scheduled_date) > new Date() ? 'Upcoming' : 'Pending grade'}
                            </div>
                        )}
                    </div>

                    {/* Right section: Location and score */}
                    <div className="flex-1 flex flex-col items-end">
                        <StatusBadge status={grade.status !== undefined ? grade.status : ''} />
                        {/*<span className="text-sm">{grade.location}</span>*/}
                        {/*{grade.status !== 'pending' && grade.exam_score !== undefined ? (*/}
                        {/*    <ScoreDisplay score={grade.exam_score} />*/}
                        {/*) : (*/}
                        {/*    <div className="mt-1 text-xs font-medium">*/}
                        {/*        {new Date(grade.exam_scheduled_date) > new Date() ? 'Upcoming' : 'Pending grade'}*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};