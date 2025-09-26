'use client';

import { motion } from 'framer-motion';
import { Class } from '@/app/_components/types/exams';

interface ClassFilterProps {
    classes: Class[];
    selectedClass: string;
    onClassChange: (classId: string) => void;
}

export function ClassFilterOld({ classes, selectedClass, onClassChange }: ClassFilterProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-3 mb-8 p-4 bg-white rounded-lg shadow-sm border"
        >
            {classes.map((classItem, index) => (
                <motion.button
                    key={classItem.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => onClassChange(classItem.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedClass === classItem.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {classItem.name} - {classItem.grade}
                </motion.button>
            ))}
        </motion.div>
    );
}

export default function ClassFilter({ classes, selectedClass, onClassChange }: ClassFilterProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-3 mb-8 p-4 bg-white rounded-lg shadow-sm border"
        >
            complete = cl
            {classes.map((classItem, index) => (
                <motion.button
                    key={classItem.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => onClassChange(classItem.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedClass === classItem.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {classItem.name} - {classItem.grade}
                </motion.button>
            ))}
        </motion.div>
    );
}