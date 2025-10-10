/**
 * This component will render a small dashboard that
 * displays some statistics about the exams that
 * have been taken in the course
 * @author Joshua Summers
 */
'use client';

import React from "react";
import { Report, GradeStrategy } from "../types/shared";

/**
 * Define some types and interfaces for the chart
 */
interface GradeDashboardProps {
    grades: Report[];
}

export default function GradeDashboard({ grades }: GradeDashboardProps) {

    const calculateAverage = () => {
        let count = 0;

        let reduced = grades.filter(grade => grade.exam_score && true);
        reduced.map(grade => {
            switch (grade.exam_score) {
                case 'A':
                    count += 4;
                    break;
                case 'B':
                    count += 3;
                    break;
                case 'C':
                    count += 2;
                    break;
                case 'D':
                    count += 1;
                    break;
                default:
            }
        })
        let average = Math.min(count / grades.length, 1);
        switch (average) {
            case 5: return 'A';
            case 4: return 'B';
            case 3: return 'C';
            case 2: return 'D';
            default: return 'F';
        }
    }

    const findHighestScore = () => {
        let count = 0;

        let reduced = grades.filter(grade => grade.exam_score && true);
        reduced.map(grade => {
            switch (grade.exam_score) {
                case 'A':
                    count = 4;
                    break;
                case 'B':
                    count = 3;
                    break;
                case 'C':
                    count = 2;
                    break;
                case 'D':
                    count = 1;
                    break;
                default:
            }
        })
        switch (count) {
            case 5: return 'A';
            case 4: return 'B';
            case 3: return 'C';
            case 2: return 'D';
            default: return 'F';
        }
    }

    const calculatePassRate = () => {
        let passed = 0;

        let reduced = grades.filter(grade => grade.exam_score && true);
        reduced.map(grade => {
            switch (grade.exam_score) {
                case 'A':
                    passed++;
                    break;
                case 'B':
                    passed++;
                    break;
                case 'C':
                    passed++;
                    break;
                default:
            }
        })

        return Math.round(passed / grades.length);
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Average Score */}
            <div className="bg-card-color p-4 rounded-lg shadow-md border
                shadow-crimson-700">
                <h3 className="text-sm font-medium text-mentat-gold/80">Average Score</h3>
                { calculateAverage() === 'A' ? (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-green-500">{calculateAverage()}</p>
                    </React.Fragment>
                ) : calculateAverage() === 'B' ? (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-blue-600">{calculateAverage()}</p>
                    </React.Fragment>
                ) : calculateAverage() === 'C' ? (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-mentat-gold">{calculateAverage()}</p>
                    </React.Fragment>
                ) : calculateAverage() === 'D' ? (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-orange-600">{calculateAverage()}</p>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-red-600">{calculateAverage()}</p>
                    </React.Fragment>
                )}
            </div>

            {/* Highest Score */}
            <div className="bg-card-color p-4 rounded-lg shadow-md border
                shadow-crimson-700">
                <h3 className="text-sm font-medium text-mentat-gold/80">Highest Score</h3>
                { findHighestScore() === 'A' ? (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-green-500">{findHighestScore()}</p>
                    </React.Fragment>
                ) : findHighestScore() === 'B' ? (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-blue-600">{findHighestScore()}</p>
                    </React.Fragment>
                ) : findHighestScore() === 'C' ? (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-mentat-gold">{findHighestScore()}</p>
                    </React.Fragment>
                ) : findHighestScore() === 'D' ? (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-orange-600">{findHighestScore()}</p>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <p className="text-2xl font-bold text-red-600">{findHighestScore()}</p>
                    </React.Fragment>
                )}
            </div>

            {/* Exams Taken */}
            <div className="bg-card-color p-4 rounded-lg shadow-md border
                shadow-crimson-700">
                <h3 className="text-sm font-medium text-mentat-gold/80">Exams Taken</h3>
                <p className="text-2xl font-bold">{grades.length}</p>
            </div>

            {/* Success Rate */}
            <div className="bg-card-color p-4 rounded-lg shadow-md border
                shadow-crimson-700">
                <h3 className="text-sm font-medium text-mentat-gold/80">Pass Rate</h3>
                <p className="text-2xl font-bold">{calculatePassRate()}%</p>
            </div>
        </div>
    )
}