/**
 * This component will render a small dashboard that
 * displays some statistics about the exams that
 * have been taken in the course
 * Optimized with Memo features to precalculate on render
 * @author Joshua Summers
 */
'use client';

import React, {useMemo} from "react";
import { Report } from "../types/shared";

/**
 * Define some types and interfaces for the chart
 */
interface GradeDashboardProps {
    grades: Report[];
    score: String;
    isStrategy: Boolean;
}

export default function GradeDashboard({ grades, score, isStrategy=false }: GradeDashboardProps) {
    // Memo of calculated pass rate
    const calculatePassRate = useMemo(() => {
        // Only get the passed grades
        let reduced = grades.filter(grade => grade.status === 'passed');
        if (reduced.length === 0) {
            console.log('passrate: No status was assigned to grades');
            console.log('passrate: Reverting to manual checks');
            reduced = grades.filter(grade => grade.exam_score === 'A'
                || grade.exam_score === 'B' || grade.exam_score === 'C');
        }
        console.log(`This is the reduced exams that were passed: ${reduced.length}`);
        // Return the percentage
        return Math.round((reduced.length / grades.length) * 100);
    }, [grades]);

    // Memo of highest score
    const highestScore = useMemo(() => {
        if (!grades || grades.length === 0) return 'F';

        const scoreValues: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
        const validGrades = grades.filter(grade => grade.exam_score);

        if (validGrades.length === 0) return 'F';

        const maxScoreValue = Math.max(...validGrades.map(grade => {
            const score = grade.exam_score;
            return score && score in scoreValues ? scoreValues[score] : 0;
        }));

        const valueToScore: Record<number, string> = { 4: 'A', 3: 'B', 2: 'C', 1: 'D', 0: 'F' };
        return valueToScore[maxScoreValue] || 'F';
    }, [grades]);

    return (
        <div>
            {/*Wrapper for no course strategy warning*/}
            { !isStrategy && (
                    <div className="text-xs italic text-center mb-1">
                        These determinations are based on no course strategy
                    </div>
            )}
            {/*These are the dashboard cards*/}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Average Score */}
                <div className="bg-card-color p-4 rounded-lg shadow-md border
                    shadow-crimson-700">
                    <h3 className="text-sm font-medium text-mentat-gold/80">Average Score</h3>
                    <p className={`text-2xl font-bold ${
                        score === 'A' ? 'text-green-500'
                        : score === 'B' ? 'text-blue-600'
                        : score === 'C' ? 'text-mentat-gold'
                        : score === 'D' ? 'text-orange-600'
                        : 'text-red-600'
                     }`}>
                        {score}
                    </p>
                </div>

                {/* Highest Score */}
                <div className="bg-card-color p-4 rounded-lg shadow-md border
                    shadow-crimson-700">
                    <h3 className="text-sm font-medium text-mentat-gold/80">Highest Score</h3>
                    <p className={`text-2xl font-bold ${
                        highestScore === 'A' ? 'text-green-500'
                        : highestScore === 'B' ? 'text-blue-600'
                        : highestScore === 'C' ? 'text-mentat-gold'
                        : highestScore === 'D' ? 'text-orange-600'
                        : 'text-red-600'
                    }`}>
                        {highestScore}
                    </p>
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
                    <p className="text-2xl font-bold">{calculatePassRate}%</p>
                </div>
            </div>
        </div>
    )
}