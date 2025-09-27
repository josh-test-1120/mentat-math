'use client';

import { motion } from 'framer-motion';
import { Exam, ExamProp } from '@/app/_components/types/exams';
import { Calendar, Clock, Award, AlertCircle } from 'lucide-react';

interface ExamCardProps {
    exam: ExamProp;
    index: number;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        upcoming: { color: 'bg-blue-100 text-blue-800', icon: <Calendar className="w-4 h-4" /> },
        completed: { color: 'bg-green-100 text-green-800', icon: <Award className="w-4 h-4" /> },
        cancelled: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
        missed: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> }
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
export const getExamStatus = (exam: ExamProp): 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending' => {
    const examDate = new Date(exam.exam_scheduled_date);
    const today = new Date();

    // If exam date is in the future, it's upcoming
    if (examDate > today) return 'upcoming';

    // If exam date is in the past and has a score, it's completed
    else if ((exam.exam_score !== undefined) && (exam.exam_score !== '')) return 'completed';

    // If no exam date and no score
    else if (((exam.exam_scheduled_date == undefined) || (exam.exam_scheduled_date == ''))
        && (exam.exam_score == undefined)|| (exam.exam_score == '')) return 'missing';

    // If the exam date is in the past but no score, it's pending
    else return 'pending';
};

// Determine exam status based on date and grade
export const getExamPropStatus = (exam: ExamProp): 'active' | 'inactive' => {
    // Check for active states
    if (exam.exam_state == 1) return 'active';
    // Check for inactive states
    else if (exam.exam_state == 0) return 'inactive';
    // Default state is inactive
    else return 'inactive';
};

// Determine course name for an exam
export const getExamCourse = (exam: Exam): string => {
    return exam.course;
};

// Determine course name for an exam
export const getExamPropCourse = (exam: ExamProp): string => {
    return exam.exam_course_name;
};

// Compact ExamCard Component
export function ExamCardExtended({ exam, index }: ExamCardProps) {
// const ExamCard = ({ exam }: { exam: Exam }) => {
    const status = getExamStatus(exam);

    return (
        <motion.div
            className="rounded-lg border border-gray-200 p-2 hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
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
                        <span className="text-xs mt-1"> {exam.exam_length ?? 1} hours</span>
                        <span className="text-xs"> {exam.duration ?? 0} mins</span>
                    </span>
                </div>

                {/* Right section: Location and score */}
                <div className="flex-1 flex flex-col items-end">
                    <StatusBadge status={status}/>
                    <span className="text-sm">{exam.location}</span>
                    {exam.status === 'completed' && exam.exam_score !== undefined ? (
                        <ScoreDisplay score={exam.exam_score} />
                    ) : (
                        <div className="mt-1 text-xs font-medium">
                            {new Date(exam.exam_scheduled_date) > new Date() ? 'Upcoming' : 'Pending results'}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};