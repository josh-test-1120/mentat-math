'use client';

import { motion } from 'framer-motion';
import { Exam } from '@/app/_components/types/exams';
import { Calendar, Clock, Award, AlertCircle } from 'lucide-react';

interface ExamCardProps {
    exam: Exam;
    index: number;
}

export default function ExamCard({ exam, index }: ExamCardProps) {
    const statusColors = {
        completed: 'border-green-200 bg-green-50',
        upcoming: 'border-blue-200 bg-blue-50',
        missed: 'border-red-200 bg-red-50'
    };

    const statusIcons = {
        completed: <Award className="w-4 h-4 text-green-600" />,
        upcoming: <Clock className="w-4 h-4 text-blue-600" />,
        missed: <AlertCircle className="w-4 h-4 text-red-600" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`p-6 rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow`}
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{exam.name}</h3>

                <div className="flex items-center gap-2 space-y-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(exam.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 space-y-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration}</span>
                </div>

                <div className="flex items-center gap-2">
                    {statusIcons[exam.status]}
                    <span className={`text-sm font-medium capitalize ${
                        exam.status === 'completed' ? 'text-green-600' :
                            exam.status === 'upcoming' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                        {exam.status}
                    </span>
                </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
                {/*<div className="flex items-center gap-2">*/}
                {/*    <Calendar className="w-4 h-4" />*/}
                {/*    <span>{new Date(exam.date).toLocaleDateString()}</span>*/}
                {/*</div>*/}

                {/*<div className="flex items-center gap-2">*/}
                {/*    <Clock className="w-4 h-4" />*/}
                {/*    <span>{exam.duration}</span>*/}
                {/*</div>*/}

                <div className="flex items-center gap-2">
                    <span className="font-medium">Subject:</span>
                    <span>{exam.course}</span>
                </div>

                {exam.status === 'completed' && exam.score !== undefined && (
                    <div className="flex items-center gap-2">
                        <span className="font-medium">Score:</span>
                        <span className="font-semibold text-green-600">
              {exam.score}
            </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}