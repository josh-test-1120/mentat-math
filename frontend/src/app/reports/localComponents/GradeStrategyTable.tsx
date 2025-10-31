/**
 * This component will handle rendering a flex based table
 * All animations for rendering the rows is controlled
 * inside this component
 * @author Joshua Summers
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Report, GradeStrategy, GradeRequirements } from "../types/shared";
import { StarIcon } from "lucide-react";
import { Grade } from "@/components/types/exams";
import Exam from "@/components/types/exam";
import Course from "@/components/types/course";
import { examRequiredDefault, examOptionalDefault } from '../types/defaults'

interface ReportTableProps {
    grades: Report[];
    exams: Exam[];
    course: Course;
    currentGrade: String;
    gradeStrategy: GradeStrategy;
    required: String[];
    optional: String[];
}

export const ExamTable: React.FC<ReportTableProps> =
    ({ grades, gradeStrategy, required, optional,
         exams, course, currentGrade }: ReportTableProps) => {

    // console.log(`This is the current grade: ${currentGrade}`);

    // Create a map of existing exams for easy lookup
    const examMap = new Map(grades.map(grade => [grade.examName, grade]));

    // De-duplicate and reduce the optional exams array
    let reducer = gradeStrategy.allOptional ? 2 : 1;
    let optionalSize = (gradeStrategy.total - required.length) - reducer;

    // Let's determine which optional ones a student has taken
    const optionalTaken = grades
        .filter(item => optional.some(name => name === item.examName))
        .map(item => item.examName);
    // console.log('Optional Taken');
    // console.log(optionalTaken);

    // Now let's append remaining optional exams, since you have not scheduled any yet
    const remainingOptionalExams = optional.filter(item => {
        const isNotInStrategy = !gradeStrategy.optional.includes(item);
        const isNotTaken = !grades.some(grade => grade.examName === item);
        return isNotInStrategy && isNotTaken;
    })
    // console.log('This is the de-duplicated and reduced optional exams');
    // console.log(remainingOptionalExams);

    // Let's make the final array now of optional exams
    const allOptionalExams = optionalSize > 0 ? [
        ...gradeStrategy.optional,
        ...optionalTaken,
        ...remainingOptionalExams.slice(0, optionalSize)
    ].reduce((unique: String[], item: String) => {
        return unique.includes(item) ? unique : [...unique, item];
    }, []) : [];
    // console.log('This is the final optional exams list')
    // console.log(allOptionalExams);

    const calculateCurrentGrade = () => {
        // Get the counts from the student grades
        let passed = grades.filter((grade) =>
            grade.status === "passed").length;
        let passedAs = grades.filter((grade) =>
            grade.examScore === "A").length;
        // Return the determination based on grade strategy number requirements
        if (passed >= gradeStrategy.total && passedAs >= gradeStrategy.requiredA) return 'Passed';
        else return 'Not Yet';
    }

    console.log('These are the passes grades');
    console.log(grades);
    console.log(exams);

    // Let's create the required exams list
    const requiredExams = required.map(item1 => {
        const matchingExam = exams.find(item =>
            item.examName === item1);
        const matchingExamResult = grades.find(item =>
            item.examId === matchingExam?.examId);
        const defaultRecord = examRequiredDefault(item1.toString(),
            course.courseName) as Report;
        if (matchingExamResult)
            return {
                ...matchingExam,
                ...matchingExamResult
            } as Report;
        // This is the exam only layout
        else if (matchingExam) return {
            ...defaultRecord,
            ...matchingExam
        } as Report;
        // This is a generic layout
        else return defaultRecord;
    });
    console.log('This is the required exams array');
    console.log(requiredExams);

    // Let's create the optional exams list
    const optionalExams = allOptionalExams.map(item1 => {
        const matchingExam = exams.find(item =>
            item.examName === item1);
        const matchingExamResult = grades.find(item =>
            item.examId === matchingExam?.examId);
        const defaultRecord = examOptionalDefault(item1.toString(),
            course.courseName, gradeStrategy) as Report;
        if (matchingExamResult)
            return {
                ...matchingExam,
                ...matchingExamResult
            } as Report;
        // This is a exam only layout
        else if (matchingExam) return {
            ...defaultRecord,
            ...matchingExam
        } as Report;
        // This is a generic layout
        else return defaultRecord;
    });
    console.log('This is the optional exams array');
    console.log(optionalExams);

    const passedRequiredAndOptional = grades.filter(grade =>
        grade.status === 'passed' &&
        (requiredExams.some(req => req.examName === grade.examName) ||
            optionalExams.some(opt => opt.examName === grade.examName))
    ).length;

    const requiredCount = requiredExams.filter(exam =>
        exam.examScore !== undefined && exam.examScore
        && exam.status === 'passed').length;
    const optionalCount = optionalExams.filter(exam =>
        exam.examScore !== undefined && exam.examScore
        && exam.status === 'passed').length;

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
                flex items-center min-h-16 border-b border-mentat-gold/50
                hover:bg-crimson-700/30 transition-colors duration-200
            `}
        >
            {/* Exam Name Column */}
            <div className="w-1/4 px-4 py-3 border-r border-mentat-gold/70 font-medium">
                {grade.examName}
                {grade.examScore === undefined && !grade.examScore && (
                    <span className="ml-2 text-xs italic text-mentat-gold-700">
                        (Not attempted)
                    </span>
                )}
            </div>

            {/* Exam Details - Individual bordered sections */}
            <div className="flex-1 flex items-stretch">
                {/* Required Status */}
                <div className="flex-1 px-4 py-3 border-r border-mentat-gold/70 flex
                    items-center justify-center">
                    <div className="text-sm">
                        {/*<span className="font-medium block text-xs uppercase tracking-wide*/}
                        {/*    text-mentat-gold-700 mb-1">Required</span>*/}
                        { grade.examRequired ? (
                            <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                            <span className="text-blue-600 font-medium">Optional</span>
                        )}
                    </div>
                </div>

                {/* Duration */}
                <div className="flex-1 px-4 py-3 border-r border-mentat-gold/70 flex
                    items-center justify-center">
                    <div className="text-sm">
                        {/*<span className="font-medium block text-2xs uppercase tracking-wide*/}
                        {/*    text-mentat-gold-700 mb-1">Duration</span>*/}
                        { grade.examDuration > 0 ? grade.examDuration : 1 } hour(s)
                    </div>
                </div>

                {/* Difficulty */}
                <div className="flex-1 px-4 py-3 border-r border-mentat-gold/70 flex
                    items-center justify-center">
                    <div className="text-sm">
                        {/*<span className="font-medium block text-xs uppercase tracking-wide*/}
                        {/*    text-mentat-gold-700 mb-1">Difficulty</span>*/}
                        <div className="flex items-center">
                            <span className="mr-2">
                                { grade.examDifficulty >= 0 ? grade.examDifficulty : 5 }
                            </span>
                            {/*Star Icons*/}
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
                        { grade.examScore !== undefined && grade.examScore ? (
                            <span className="text-green-600 font-medium">Completed</span>
                        ) : (
                            <span className="text-orange-600 font-medium">Not Started</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Exam Score */}
            <div className="w-32 px-4 py-3 border-l border-mentat-gold/70 text-right">
                <div className="text-sm">
                    {/*<span className="font-medium block text-xs uppercase tracking-wide*/}
                    {/*    text-mentat-gold-700 mb-1">Score</span>*/}
                    {grade.examScore !== undefined && grade.examScore ?
                    grade.examScore === 'A' ? (
                        <span className="font-medium text-lg text-green-700">
                            {grade.examScore}
                        </span>
                    ) : grade.examScore === 'B' ? (
                        <span className="font-medium text-lg text-blue-700">
                            {grade.examScore}
                        </span>
                    ) : grade.examScore === 'C' ? (
                        <span className="font-medium text-lg text-mentat-gold">
                            {grade.examScore}
                        </span>
                    ) : grade.examScore === 'D' ? (
                        <span className="font-medium text-lg text-orange-600">
                            {grade.examScore}
                        </span>
                    ) : (
                        <span className="font-medium text-lg text-red-600">
                            {grade.examScore}
                        </span>
                    ) : (
                        <span className="text-red-500 font-medium">No Grade</span>
                    )}
                </div>
            </div>
        </motion.div>
    );

    // Spacer row above required exams
    const RequiredRowHeader: React.FC = () => (
        <div className="flex items-center min-h-8 border-b border-mentat-gold/90
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
        <div className="flex items-center min-h-8 border-b border-mentat-gold/90
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
                <div className="rounded-lg border border-mentat-gold/70 overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-center border-b border-mentat-gold/70
                        font-semibold italic bg-crimson-700/30">
                        <div className="w-1/4 px-4 py-4 border-r border-mentat-gold/70 text-lg">Exam Name</div>
                        <div className="flex-1 flex items-stretch">
                            <div className="flex-1 px-4 py-4 border-r border-mentat-gold/70 text-center">Required</div>
                            <div className="flex-1 px-4 py-4 border-r border-mentat-gold/70 text-center">Duration</div>
                            <div className="flex-1 px-4 py-4 border-r border-mentat-gold/70 text-center">Difficulty</div>
                            <div className="flex-1 px-4 py-4 text-center">Status</div>
                        </div>
                        <div className="w-32 px-4 py-4 border-l border-mentat-gold/70 text-center">Score</div>
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
                    {/*<div className="flex items-center min-h-12 border-t border-gray-300">*/}
                    {/*    <div className="w-1/4 px-4 py-3 border-r border-gray-300 font-medium">*/}
                    {/*        Progress Summary*/}
                    {/*    </div>*/}
                    {/*    <div className="flex-1 flex items-stretch">*/}
                    {/*        <div className="flex-1 px-4 py-3 border-r border-gray-300 text-sm">*/}
                    {/*            Required: {requiredCount}/{requiredExams.length}*/}
                    {/*        </div>*/}
                    {/*        <div className="flex-1 px-4 py-3 border-r border-gray-300 text-sm">*/}
                    {/*            Optional: {optionalCount}/{optionalExams.length}*/}
                    {/*        </div>*/}
                    {/*        <div className="flex-1 px-4 py-3 border-r border-gray-300 text-sm">*/}
                    {/*            Total: {passedRequiredAndOptional}/{gradeStrategy.total}*/}
                    {/*        </div>*/}
                    {/*        <div className="flex-1 px-4 py-3 text-sm font-normal">*/}
                    {/*            Current Grade: { currentGrade === 'A'*/}
                    {/*            ? (*/}
                    {/*                <span className="text-green-700">*/}
                    {/*                    A*/}
                    {/*                </span>*/}
                    {/*            ) : currentGrade === 'B' ? (*/}
                    {/*                <span className="text-blue-700">*/}
                    {/*                    B*/}
                    {/*                </span>*/}
                    {/*            ) : currentGrade === 'C' ? (*/}
                    {/*                <span className="text-mentat-gold">*/}
                    {/*                    C*/}
                    {/*                </span>*/}
                    {/*            ) : currentGrade === 'D' ? (*/}
                    {/*                <span className="text-orange-600">*/}
                    {/*                    D*/}
                    {/*                </span>*/}
                    {/*            ) : (*/}
                    {/*                <span className="text-red-600">*/}
                    {/*                    F*/}
                    {/*                </span>*/}
                    {/*            )}*/}
                    {/*            /!*Completion: { grades.filter(grade =>*!/*/}
                    {/*            /!*    grade.examRequired === 1).length >= gradeStrategy.total*!/*/}
                    {/*            /!*    && grades.filter((grade) =>*!/*/}
                    {/*            /!*    grade.exam_score === 'A').length >= gradeStrategy.requiredA*!/*/}
                    {/*            /!*    ? (*!/*/}
                    {/*            /!*        <span className="text-green-600">*!/*/}
                    {/*            /!*            Achieved!*!/*/}
                    {/*            /!*        </span>*!/*/}
                    {/*            /!*    ) : (*!/*/}
                    {/*            /!*        <span className="text-orange-600">*!/*/}
                    {/*            /!*            Not Yet!*!/*/}
                    {/*            /!*        </span>*!/*/}
                    {/*            /!*    )}*!/*/}
                    {/*            /!*Math.round((allExamNames.filter(name =>*!/*/}
                    {/*            /!*    examMap.has(name.toString())).length / allExamNames.length) * 100)}%*!/*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*    <div className="w-32 px-4 py-3 border-l border-gray-300 text-right">*/}
                    {/*        <div className="text-sm font-medium">*/}
                    {/*            Avg: {exams.length > 0*/}
                    {/*            ? calculateCurrentGrade()*/}
                    {/*            : 0*/}
                    {/*        }*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </motion.div>
        </div>
    );
};