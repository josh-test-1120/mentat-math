/**
 * This component will render a combined progress bar showing:
 * 1) Number of exams completed out of total (with required/optional breakdown)
 * 2) Number of A grades out of required A's
 * 3) Overall completion percentage combining both metrics
 * @author Joshua Summers
 */
'use client';

import React from "react";
import { Report, GradeStrategy } from "../types/shared";

interface StrategyProgressBarProps {
    grades: Report[];
    strategy: GradeStrategy;
    required: String[];
    optional: String[];
}

export function StrategyProgressBar({grades, strategy, required, optional}: StrategyProgressBarProps) {
    // Calculate exam completion counts with required/optional breakdown
    const calculateExamCounts = (currentGrades: Report[]) => {
        // Calculate the required passed exams from grades
        const requiredCompleted = currentGrades.filter(grade =>
            grade.status === 'passed' &&
            grade.examRequired === 1 &&
            required.includes(grade.examName)
        ).length;
        const optionalCompleted = currentGrades.filter(grade =>
            grade.status === 'passed' &&
            grade.examRequired === 0 &&
            optional.includes(grade.examName)
        ).length;
        const totalCompleted = requiredCompleted + optionalCompleted;

        // Calculate the required A exams from grades
        const requiredAGrades = currentGrades.filter(grade =>
            grade.examScore === 'A' &&
            grade.examRequired === 1 &&
            required.includes(grade.examName)
        ).length;
        const optionalAGrades = currentGrades.filter(grade =>
            grade.examScore === 'A' &&
            grade.examRequired === 0 &&
            optional.includes(grade.examName)
        ).length;
        const totalAGrades = requiredAGrades + optionalAGrades;
        // Return a map of all the values for later access
        return {
            requiredCompleted,
            optionalCompleted,
            requiredAGrades,
            optionalAGrades,
            totalCompleted,
            totalAGrades
        };
    };
    // Get the calculated values
    const examCounts = calculateExamCounts(grades);

    // Calculate percentages
    const overallCompletionPercentage = Math.round((examCounts.totalCompleted / strategy.total) * 100);
    const aGradePercentage = Math.round((examCounts.totalAGrades / strategy.requiredA) * 100);
    const requiredExamProgressWidth = Math.round((examCounts.requiredCompleted / strategy.total) * 100);
    const optionalExamProgressWidth = Math.round((examCounts.optionalCompleted / strategy.total) * 100);
    const requiredAsProgressWidth = Math.round((examCounts.requiredAGrades / strategy.requiredA) * 100);
    const optionalAsProgressWidth = Math.round((examCounts.optionalAGrades / strategy.requiredA) * 100);
    const optionalExamNumber = (strategy.total - required.length) >= 0
        ? (strategy.total - required.length)
        : 0

    // Combined completion (average of exam completion and A grade progress)
    const combinedCompletionPercentage = Math.round((overallCompletionPercentage + aGradePercentage) / 2);

    return (
        <div className="max-w-5xl mx-auto mb-6">
            {!strategy && !grades ? <React.Fragment/> : (
                <React.Fragment>
                    <h2 className="text-xl font-semibold mb-4 text-center">Grade Progress</h2>
                    <div className="bg-card-color p-4 rounded-lg border border-mentat-gold/40
                    shadow-sm shadow-crimson-700">

                        {/* Combined Completion Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Overall Completion</span>
                                <span className="font-semibold text-mentat-gold">(
                                    {combinedCompletionPercentage > 100 ?
                                        '100' : combinedCompletionPercentage}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-crimson to-crimson-700 h-4 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${combinedCompletionPercentage > 100 ?
                                            '100' : combinedCompletionPercentage}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Dual Progress Bars */}
                        <div className="space-y-4 mb-4">
                            {/* Exam Completion Bar with Required/Optional Breakdown */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">Exam Progress</span>
                                    <span className="font-semibold">
                                        {examCounts.totalCompleted} / {strategy.total} exams
                                        <span className="ml-2 text-mentat-gold">(
                                            {overallCompletionPercentage > 100 ?
                                                '100' : overallCompletionPercentage}%)
                                        </span>
                                    </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                    {/* Required exams segment */}
                                    <div
                                        className="bg-green-500 h-3 absolute top-0 left-0 transition-all duration-500"
                                        style={{
                                            width: `${requiredExamProgressWidth > 100 ?
                                                '100' : requiredExamProgressWidth}%`
                                        }}
                                    ></div>

                                    {/* Optional exams segment */}
                                    {requiredExamProgressWidth < 100 && (
                                        <div
                                            className="bg-blue-500 h-3 absolute top-0 transition-all duration-500"
                                            style={{
                                                left: `${requiredExamProgressWidth}%`,
                                                width: `${optionalExamProgressWidth > 100 ?
                                                    '100' : optionalExamProgressWidth}%`
                                            }}
                                        ></div>
                                    )}
                                </div>
                            </div>

                            {/* A Grade Completion Bar with Required/Optional Breakdown */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">A Grade Progress</span>
                                    <span className="font-semibold">
                                        {examCounts.totalAGrades} / {strategy.requiredA} A's
                                        <span className="ml-2 text-mentat-gold">(
                                            {aGradePercentage > 100 ?
                                                '100' : aGradePercentage}%)
                                        </span>
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                                    {/* Required exams segment */}
                                    <div
                                        className="bg-green-500 h-3 absolute top-0 left-0 transition-all duration-500"
                                        style={{
                                            width: `${requiredAsProgressWidth > 100 ?
                                                '100' : requiredAsProgressWidth}%`
                                        }}
                                    ></div>

                                    {/* Optional exams segment */}
                                    { requiredAsProgressWidth < 100 && (
                                        <div
                                            className="bg-blue-500 h-3 absolute top-0 transition-all duration-500"
                                            style={{
                                                left: `${requiredAsProgressWidth}%`,
                                                width: `${optionalAsProgressWidth > 100 ?
                                                    '100' : optionalAsProgressWidth}%`
                                            }}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Counts */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 font-medium">Required Exams:</span>
                                    <span>{examCounts.requiredCompleted} / {required.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-600 font-medium">Optional Exams:</span>
                                    <span>{examCounts.optionalCompleted} / {optionalExamNumber}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 font-medium">Required A's:</span>
                                    <span>{examCounts.requiredAGrades} / {strategy.requiredA}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-600 font-medium">Optional A's:</span>
                                    <span>{examCounts.optionalAGrades} / {strategy.requiredA}</span>
                                </div>
                            </div>
                        </div>

                        {/* Compact Legend */}
                        <div className="flex flex-wrap gap-4 text-xs pt-3 border-t
                        border-mentat-gold/50 justify-center">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>Required Exams ({required.length})</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <span>Optional Exams ({optionalExamNumber})</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span>A Grades ({strategy.requiredA} required)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-crimson rounded"></div>
                                <span>Overall Progress</span>
                            </div>
                        </div>

                        {/*/!* Remaining Requirements *!/*/}
                        {/*<div className="text-center text-sm pt-3 italic">*/}
                        {/*    <div className="font-semibold">*/}
                        {/*        Remaining Requirements: {' '}*/}
                        {/*        {strategy.total - examCounts.totalCompleted} exams and {' '}*/}
                        {/*        {Math.max(0, strategy.requiredA - examCounts.totalAGrades)} A's needed*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>
                </React.Fragment>
            )}
        </div>
    );
}