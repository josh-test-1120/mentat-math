import React from 'react';
import { motion } from 'framer-motion';
import {Report, GradeStrategy, GradeRequirements} from "../types/shared";

interface ReportTableProps {
    exams: Report[];
    gradeStrategy: GradeStrategy;
    required: String[];
    optional: String[];
}


export const ExamTable: React.FC<ReportTableProps> =
    ({ exams, gradeStrategy, required, optional }: ReportTableProps) => {
    // De-duplicate and reduce the optional exams array
    let reducer = gradeStrategy.allOptional ? 2 : 1;
    let optionalSize = (gradeStrategy.total - required.length) - reducer;

    const remainingOptionalExams = optional.filter((item => {return !gradeStrategy.optional.includes(item)}))

    console.log('This is the de-duplicated and reduced optional exams');
    console.log(remainingOptionalExams);

    const allOptionalExams = optionalSize > 0 ? [
        ...gradeStrategy.optional,
        ...remainingOptionalExams.slice(0, optionalSize),
    ] : []

    const allExamNames = [
        ...required,
        ...allOptionalExams
    ];

    console.log(allOptionalExams);
    console.log('This is the combined exams array');
    console.log(allExamNames);

    // Create a map of existing exams for easy lookup
    const examMap = new Map(exams.map(exam => [exam.exam_name, exam]));

    const statusMap: Record<string, "pending" | "passed" | "failed" | undefined> = {
        "pending": "pending",
        "passed": "passed",
        "failed": "failed"
    };

    const calculateCurrentGrade = () => {

        let passed = exams.filter((grade) =>
            grade.status === "passed").length;
        let passedAs = exams.filter((grade) =>
            grade.exam_score === "A").length;

        if (passed >= gradeStrategy.total && passedAs >= gradeStrategy.requiredA) return 'Passed';
        else return 'Not Yet';
    }

    // Separate into required and optional based on grade strategy
    const requiredExams = required
        .slice()
        .map(name => examMap.get(name.toString()) || {
            exam_name: name,
            exam_required: 1,
            exam_duration: 1,
            exam_difficulty: 5,
            exam_score: undefined,
            course_name: 'test',
            exam_version: 1,
            exam_id: 1,
            exam_course_id: 1,
            status: statusMap['pending'],
            exam_scheduled_date: ''
        });

    const optionalExams = allOptionalExams
        .slice()
        .map(name => examMap.get(name.toString()) || {
            exam_name: name,
            exam_required: 1,
            exam_duration: 1,
            exam_difficulty: 5,
            exam_score: undefined,
            course_name: 'test',
            exam_version: 1,
            exam_id: 1,
            exam_course_id: 1,
            status: statusMap['pending'],
            exam_scheduled_date: ''
        });

    const ExamRow: React.FC<{ exam: Report; index: number; isOptional?: boolean }> = ({ exam, index, isOptional = false }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            // className={`
            //     flex items-center min-h-16 border-b border-gray-200
            //     ${index % 2 === 0 ? 'bg-white' : 'bg-crimson-50'}
            //     hover:bg-gray-50 transition-colors duration-200
            //     ${isOptional ? 'bg-blue-50' : ''}
            //     ${exam.exam_score === undefined ? 'opacity-75' : ''}
            // `}
            className={`
                flex items-center min-h-16 border-b border-gray-200
                hover:bg-crimson-700/30 transition-colors duration-200
                ${exam.exam_score === undefined ? 'opacity-75' : ''}
            `}
        >
            {/* Exam Name Column */}
            <div className="w-1/4 px-4 py-3 border-r border-gray-300 font-medium">
                {exam.exam_name}
                {exam.exam_score === undefined && (
                    <span className="ml-2 text-xs italic">(Not attempted)</span>
                )}
            </div>

            {/* Exam Details - Individual bordered sections */}
            <div className="flex-1 flex items-stretch">
                {/* Required Status */}
                <div className="flex-1 px-4 py-3 border-r border-gray-300 flex items-center">
                    <div className="text-sm">
                        {/*<span className="font-medium block text-xs uppercase tracking-wide*/}
                        {/*    text-mentat-gold-700 mb-1">Required</span>*/}
                        {exam.exam_required ? (
                            <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                            <span className="text-blue-600 font-medium">Optional</span>
                        )}
                    </div>
                </div>

                {/* Duration */}
                <div className="flex-1 px-4 py-3 border-r border-gray-300 flex items-center">
                    <div className="text-sm">
                        <span className="font-medium block text-xs uppercase tracking-wide
                            text-mentat-gold-700 mb-1">Duration</span>
                        {exam.exam_duration || 1} hour(s)
                    </div>
                </div>

                {/* Difficulty */}
                <div className="flex-1 px-4 py-3 border-r border-gray-300 flex items-center">
                    <div className="text-sm">
                        <span className="font-medium block text-xs uppercase tracking-wide
                            text-mentat-gold-700 mb-1">Difficulty</span>
                        <div className="flex items-center">
                            <span className="mr-2">{exam.exam_difficulty || 5}</span>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <div
                                        key={star}
                                        className={`w-2 h-2 rounded-full ${
                                            star <= (exam.exam_difficulty || 5)
                                                ? 'bg-yellow-500'
                                                : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="flex-1 px-4 py-3 flex items-center">
                    <div className="text-sm">
                        <span className="font-medium block text-xs uppercase tracking-wide
                            text-mentat-gold-700 mb-1">Status</span>
                        {exam.exam_score !== undefined ? (
                            <span className="text-green-600 font-medium">Completed</span>
                        ) : (
                            <span className="text-orange-600 font-medium">Not Started</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Exam Score */}
            <div className="w-32 px-4 py-3 border-l border-gray-300 text-right">
                <div className="text-sm">
                    <span className="font-medium block text-xs uppercase tracking-wide
                        text-mentat-gold-700 mb-1">Score</span>
                    {exam.exam_score !== undefined ? (
                        <span className="font-medium text-lg">{exam.exam_score}</span>
                    ) : (
                        <span className="text-red-500 font-medium">Not met</span>
                    )}
                </div>
            </div>
        </motion.div>
    );

    // Spacer row above required exams
    const RequiredRowHeader: React.FC = () => (
        <div className="flex items-center min-h-8 border-b border-gray-200
            bg-mentat-gold-700 text-crimson-700">

            <div className="flex-1 flex items-stretch">
                <div className="flex-1 px-4 py-2 "></div>
                <div className="flex-1 px-4 py-2">
                    <div className="text-xs italic text-center">Required Exams</div>
                </div>
                <div className="flex-1 px-4 py-2 "></div>
            </div>
        </div>
    );

    // Spacer row above optional exams
    const OptionalRowHeader: React.FC = () => (
        <div className="flex items-center min-h-8 border-b border-gray-200
            bg-mentat-gold-700 text-crimson-700">
            <div className="flex-1 flex items-stretch">
                <div className="flex-1 px-4 py-2 "></div>
                <div className="flex-1 px-4 py-2">
                    <div className="text-xs italic text-center">Optional Exams</div>
                </div>
                <div className="flex-1 px-4 py-2 "></div>
            </div>
        </div>
    );

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="flex items-center border-b border-gray-300
                        font-semibold italic bg-crimson-700/30">
                        <div className="w-1/4 px-4 py-4 border-r border-gray-300 text-lg">Exam Name</div>
                        <div className="flex-1 flex items-stretch">
                            <div className="flex-1 px-4 py-4 border-r border-gray-300 text-center">Required</div>
                            <div className="flex-1 px-4 py-4 border-r border-gray-300 text-center">Duration</div>
                            <div className="flex-1 px-4 py-4 border-r border-gray-300 text-center">Difficulty</div>
                            <div className="flex-1 px-4 py-4 text-center">Status</div>
                        </div>
                        <div className="w-32 px-4 py-4 border-l border-gray-300 text-center">Score</div>
                    </div>

                    {/* Header before required exams */}
                    {requiredExams.length > 0 && (
                        <RequiredRowHeader />
                    )}

                    {/* Required Exams */}
                    {requiredExams.map((exam, index) => (
                        <ExamRow key={`required-${exam.exam_name}`} exam={exam} index={index} />
                    ))}

                    {/* Header before optional exams */}
                    {requiredExams.length > 0 && optionalExams.length > 0 && (
                        <OptionalRowHeader />
                    )}

                    {/* Optional Exams */}
                    {optionalExams.map((exam, index) => (
                        <ExamRow
                            key={`optional-${exam.exam_name}`}
                            exam={exam}
                            index={index + requiredExams.length}
                            isOptional={true}
                        />
                    ))}

                    {/* Summary Footer */}
                    <div className="flex items-center min-h-12 border-t border-gray-300">
                        <div className="w-1/4 px-4 py-3 border-r border-gray-300 font-medium">
                            Progress Summary
                        </div>
                        <div className="flex-1 flex items-stretch">
                            <div className="flex-1 px-4 py-3 border-r border-gray-300 text-sm">
                                Required: {requiredExams.filter(e =>
                                    e.exam_score !== undefined).length}/{requiredExams.length}
                            </div>
                            <div className="flex-1 px-4 py-3 border-r border-gray-300 text-sm">
                                Optional: {optionalExams.filter(e =>
                                    e.exam_score !== undefined).length}/{optionalExams.length}
                            </div>
                            <div className="flex-1 px-4 py-3 border-r border-gray-300 text-sm">
                                Total: {allExamNames.filter(name =>
                                    examMap.has(name.toString())).length}/{allExamNames.length}
                            </div>
                            <div className="flex-1 px-4 py-3 text-sm">
                                Completion: {Math.round((allExamNames.filter(name =>
                                    examMap.has(name.toString())).length / allExamNames.length) * 100)}%
                            </div>
                        </div>
                        <div className="w-32 px-4 py-3 border-l border-gray-300 text-right">
                            <div className="text-sm font-medium">
                                Avg: {exams.length > 0
                                ? calculateCurrentGrade()
                                : 0
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};