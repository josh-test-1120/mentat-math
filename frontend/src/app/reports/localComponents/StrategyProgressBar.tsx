/**
 * This component will render a progress bar based on the
 * number of exams passed according to the grade strategy
 * for the course listed (passed in already as that logic
 * is done in the parent and the data passed in)
 * @author Joshua Summers
 */
'use client';

import React from "react";
import { Report, GradeStrategy } from "../types/shared";

/**
 * Define some types and interfaces for the chart
 */
interface StrategyProgressBarProps {
    grades: Report[];
    strategy: GradeStrategy;
}

export default function StrategyProgressBar({ grades, strategy }: StrategyProgressBarProps) {
    // Calculation the percentage of completion
    const calculateCompletion =
        (currentGrades: Report[], currentStrategy: GradeStrategy) => {
            let passed = currentGrades.filter(grade => grade.status === 'passed').length;
            let passedAs = currentGrades.filter(grade => grade.exam_score === 'A').length;
            let passedAvg = passed / currentStrategy.total;
            let passedAsAvg = passedAs / currentStrategy.requiredA;
            console.log(currentGrades);
            console.log(currentStrategy);
            console.log(`Current Passed: ${passed}`);
            console.log(`Current Passed As: ${passedAs}`);
            console.log(`Current Passed Avg: ${passedAvg}`);
            console.log(`Current Passed As Avg: ${passedAsAvg}`);
            console.log(`Current Required As: ${currentStrategy?.requiredA}`);
            console.log(`Current Required Exams: ${currentStrategy?.total}`);
            console.log(`This is the completion: ${Math.round(((passedAvg + passedAsAvg) / 2) * 100)}`)

            return Math.round(((passedAvg + passedAsAvg) / 2) * 100);
        }

    return (
        <div className="max-w-5xl mx-auto mb-6 shadow-md shadow-crimson-700">
            { !strategy && strategy === undefined ? (<React.Fragment />)
                : (
                <React.Fragment>
                    <h2 className="text-xl font-semibold mb-4 text-center">Grade Progress</h2>
                    <div className="bg-card-color p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between mb-2">
                            <span>Course Completion</span>
                            <span>{ calculateCompletion(grades,
                                strategy) }%</span>
                        </div>

                        {/* Segmented Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-4 relative
                                    overflow-hidden">
                            {/* Required section (first segment) */}
                            <div
                                className="bg-green-500 h-4 absolute top-0 left-0"
                                style={{ width: `${Math.min(calculateCompletion(grades,
                                            strategy),
                                        (strategy.requiredA / strategy.total) * 100)}%` }}
                            ></div>

                            {/* Optional section (second segment) */}
                            <div
                                className="bg-blue-500 h-4 absolute top-0"
                                style={{
                                    left: `${Math.round((strategy.requiredA / strategy.total) * 100)}%`,
                                    width: `${Math.max(0,
                                        100 - Math.round((strategy.requiredA / strategy.total) * 100))}%`
                                }}
                            ></div>

                            {/* Milestone divider */}
                            <div
                                className="absolute top-0 w-0.5 h-4 bg-white opacity-50"
                                style={{
                                    left:
                                        `${(strategy.requiredA / strategy.total) * 100}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between text-sm text-mentat-gold/80 mt-2">
                            { grades.filter(grade => grade.status === 'passed' ).length }
                            <span>{ grades.filter(grade =>
                                grade.status === 'passed' ).length } of { strategy.total } exams completed
                                    </span>
                            <span>{ strategy.total - grades.filter(grade =>
                                grade.status === 'passed' ).length } remaining</span>
                        </div>

                        {/* Legend */}
                        <div className="flex gap-4 text-xs mt-2">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>Required ({strategy.requiredA})</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <span>Optional ({strategy.total - strategy.requiredA})</span>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            )}
        </div>
    )
}