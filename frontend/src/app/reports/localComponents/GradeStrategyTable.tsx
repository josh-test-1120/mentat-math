import React from 'react';
import { motion } from 'framer-motion';
import { Report, GradeStrategy, GradeRequirements } from "../types/shared";
import { StarIcon } from "lucide-react";
import {Exam} from "@/components/types/exams";

interface ReportTableProps {
    grades: Report[];
    exams: Exam[];
    gradeStrategy: GradeStrategy;
    required: String[];
    optional: String[];
}


export const ExamTable: React.FC<ReportTableProps> =
    ({ grades, gradeStrategy, required, optional, exams }: ReportTableProps) => {

    // Create a map of existing exams for easy lookup
    const examMap = new Map(grades.map(grade => [grade.exam_name, grade]));

    const statusMap: Record<string, "pending" | "passed" | "failed" | undefined> = {
        "pending": "pending",
        "passed": "passed",
        "failed": "failed"
    };
    // De-duplicate and reduce the optional exams array
    let reducer = gradeStrategy.allOptional ? 2 : 1;
    let optionalSize = (gradeStrategy.total - required.length) - reducer;


    const optionalTaken = grades
        .filter(item => optional.some(name => name === item.exam_name))
        .map(item => item.exam_name);
    console.log('Optional Taken');
    console.log(optionalTaken);

    const remainingOptionalExams = optional.filter(item => {
        const isNotInStrategy = !gradeStrategy.optional.includes(item);
        const isNotTaken = !grades.some(grade => grade.exam_name === item);
        return isNotInStrategy && isNotTaken;
    })


    console.log('This is the de-duplicated and reduced optional exams');
    console.log(remainingOptionalExams);

    // const allOptionalExams = optionalSize > 0 ? [
    //     ...gradeStrategy.optional,
    //     ...optionalTaken,
    //     ...remainingOptionalExams.slice(0, optionalSize),
    // ] : []

    const allOptionalExams = optionalSize > 0 ? [
        ...gradeStrategy.optional,
        ...optionalTaken,
        ...remainingOptionalExams.slice(0, optionalSize)
    ].reduce((unique: String[], item: String) => {
        return unique.includes(item) ? unique : [...unique, item];
    }, []) : [];

    const allExamNames = [
        ...required,
        ...allOptionalExams
    ];

    console.log(allOptionalExams);
    console.log('This is the combined exams array');
    console.log(allExamNames);

    const calculateCurrentGrade = () => {

        let passed = grades.filter((grade) =>
            grade.status === "passed").length;
        let passedAs = grades.filter((grade) =>
            grade.exam_score === "A").length;

        if (passed >= gradeStrategy.total && passedAs >= gradeStrategy.requiredA) return 'Passed';
        else return 'Not Yet';
    }

    console.log('These are the passes grades');
    console.log(grades);
    console.log(exams);

    const requiredExams = required.map(item1 => {
        const matchingExam = exams.find(item =>
            item.examName === item1);
        const matchingExamResult = grades.find(item =>
            item.exam_id === matchingExam?.examId);
        if (matchingExam)
            return {
                item1,
                ...matchingExam,
                ...matchingExamResult
            };
        else
            return {
                examName: item1,
                examRequired: 1,
                examDuration: 1,
                examDifficulty: 0,
                exam_score: undefined,
                course_name: 'test',
                exam_version: 1,
                exam_id: -99,
                exam_course_id: -99,
                status: statusMap['pending'],
                exam_scheduled_date: ''
            };
    });
    console.log('This is the required exams array');
    console.log(requiredExams);

    const optionalExams = allOptionalExams.map(item1 => {
        const matchingExam = exams.find(item =>
            item.examName === item1);
        const matchingExamResult = grades.find(item =>
            item.exam_id === matchingExam?.examId);
        if (matchingExam)
            return {
                item1,
                ...matchingExam,
                ...matchingExamResult
            };
        else
            return {
                examName: item1,
                examRequired: 0,
                examDuration: 1,
                examDifficulty: 0,
                exam_score: undefined,
                course_name: 'test',
                exam_version: 1,
                exam_id: -99,
                exam_course_id: -99,
                status: statusMap['pending'],
                exam_scheduled_date: ''
            };
    });

    console.log('This is the optional exams array');
    console.log(optionalExams);

    const requiredExams1 = required
        .slice()
        .map(name => examMap.get(name.toString()) || {
            exam_name: name,
            exam_required: 1,
            exam_duration: 1,
            exam_difficulty: 0,
            exam_score: undefined,
            course_name: 'test',
            exam_version: 1,
            exam_id: 1,
            exam_course_id: 1,
            status: statusMap['pending'],
            exam_scheduled_date: ''
        });

    const optionalExams1 = allOptionalExams
        .slice()
        .map(name => examMap.get(name.toString()) || {
            exam_name: name,
            exam_required: 1,
            exam_duration: 1,
            exam_difficulty: 0,
            exam_score: undefined,
            course_name: 'test',
            exam_version: 1,
            exam_id: 1,
            exam_course_id: 1,
            status: statusMap['pending'],
            exam_scheduled_date: ''
        });

    const ExamRow: React.FC<{ grade: Report; index: number; isOptional?: boolean }> =
        ({ grade, index, isOptional = false }) => (
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
            `}
        >
            {/* Exam Name Column */}
            <div className="w-1/4 px-4 py-3 border-r border-gray-300 font-medium">
                {grade.examName}
                {grade.exam_score === undefined && (
                    <span className="ml-2 text-xs italic text-mentat-gold-700">
                        (Not attempted)
                    </span>
                )}
            </div>

            {/* Exam Details - Individual bordered sections */}
            <div className="flex-1 flex items-stretch">
                {/* Required Status */}
                <div className="flex-1 px-4 py-3 border-r border-gray-300 flex
                    items-center justify-center">
                    <div className="text-sm">
                        {/*<span className="font-medium block text-xs uppercase tracking-wide*/}
                        {/*    text-mentat-gold-700 mb-1">Required</span>*/}
                        {grade.examRequired ? (
                            <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                            <span className="text-blue-600 font-medium">Optional</span>
                        )}
                    </div>
                </div>

                {/* Duration */}
                <div className="flex-1 px-4 py-3 border-r border-gray-300 flex
                    items-center justify-center">
                    <div className="text-sm">
                        {/*<span className="font-medium block text-2xs uppercase tracking-wide*/}
                        {/*    text-mentat-gold-700 mb-1">Duration</span>*/}
                        { grade.examDuration > 0 ? grade.examDuration : 1 } hour(s)
                    </div>
                </div>

                {/* Difficulty */}
                <div className="flex-1 px-4 py-3 border-r border-gray-300 flex
                    items-center justify-center">
                    <div className="text-sm">
                        {/*<span className="font-medium block text-xs uppercase tracking-wide*/}
                        {/*    text-mentat-gold-700 mb-1">Difficulty</span>*/}
                        <div className="flex items-center">
                            <span className="mr-2">
                                { grade.examDifficulty >= 0 ? grade.examDifficulty : 5 }
                            </span>
                            {/*<div className="flex space-x-1">*/}
                            {/*    {[1, 2, 3, 4, 5].map((star) => (*/}
                            {/*        <div*/}
                            {/*            key={star}*/}
                            {/*            className={`w-2 h-2 rounded-full ${*/}
                            {/*                star <= (exam.exam_difficulty || 5)*/}
                            {/*                    ? 'bg-yellow-500'*/}
                            {/*                    : 'bg-gray-300'*/}
                            {/*            }`}*/}
                            {/*        />*/}
                            {/*    ))}*/}
                            {/*</div>*/}
                            <div className="flex space-x-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                        key={star}
                                        size={14} // Smaller size
                                        strokeWidth={1.5} // Thinner outline
                                        className={`
                                            transition-colors duration-200
                                            ${star <= (
                                                grade.examDifficulty >= 0 
                                                    ? grade.examDifficulty : 0)
                                                ? 'fill-yellow-400 text-yellow-500' // filled with slightly different colors
                                                : 'fill-gray-100 text-gray-300' // light fill with gray outline
                                            }
                                        `}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="flex-1 px-4 py-3 flex items-center justify-center">
                    <div className="text-sm">
                        {/*<span className="font-medium block text-xs uppercase tracking-wide*/}
                        {/*    text-mentat-gold-700 mb-1">Status</span>*/}
                        { grade.exam_score !== undefined && grade.exam_score ? (
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
                    {/*<span className="font-medium block text-xs uppercase tracking-wide*/}
                    {/*    text-mentat-gold-700 mb-1">Score</span>*/}
                    {grade.exam_score !== undefined ? (
                        <span className="font-medium text-lg">{grade.exam_score}</span>
                    ) : (
                        <span className="text-red-500 font-medium">No Grade</span>
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
                    {requiredExams.map((grade, index) => (
                        <ExamRow
                            key={`required-${grade.examName}`}
                            grade={grade}
                            index={index} />
                    ))}

                    {/* Header before optional exams */}
                    {requiredExams.length > 0 && optionalExams.length > 0 && (
                        <OptionalRowHeader />
                    )}

                    {/* Optional Exams */}
                    {optionalExams.map((grade, index) => (
                        <ExamRow
                            key={`optional-${grade.examName}`}
                            grade={grade}
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