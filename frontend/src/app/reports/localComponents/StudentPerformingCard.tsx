"use client";

import React, {useEffect} from "react";
import { GradeStrategy, StudentExams } from "@/app/reports/types/shared";
import { useGradeCalculations } from "@/app/reports/hooks/useGradeCalculations";

interface StudentPerformingCardProps {
    student: StudentExams | undefined;
    gradeStrategyNew: GradeStrategy | undefined;
}

/**
 * Instructor Exam Statistics Component
 * Shows instructors some insight into exam scheduling and student analysis
 */
export default function StudentPerformingCard({student, gradeStrategyNew}: StudentPerformingCardProps) {

    // Grade Calculation Hooks
    const { gradeRequirements, calculatedCurrentGrade } = useGradeCalculations({
        filteredCourses: undefined,
        filteredGrades: student?.exams,
    });

    useEffect(() => {
        if (student && calculatedCurrentGrade) {
            student.status = studentStatus()
        }
    }, [student, calculatedCurrentGrade]);

    const studentStatus = () => {
        switch (calculatedCurrentGrade) {
            case "A":
            case "B":
            case "C":
                return 'passing'
            case "D":
            case 'F':
                return 'failing'
        }
    }

    // Grade strategy visualization
    const gradeStrategy = {
        F: { min: 0, max: 59, color: 'bg-red-500' },
        D: { min: 60, max: 69, color: 'bg-orange-500' },
        C: { min: 70, max: 79, color: 'bg-yellow-500' },
        B: { min: 80, max: 89, color: 'bg-blue-500' },
        A: { min: 90, max: 100, color: 'bg-green-500' },
    };


    // // Determine which grade bracket the student falls into
    // for (const [grade, range] of Object.entries(gradeStrategy)) {
    //     if (student.examScore >= range.min && student.examScore <= range.max) {
    //         currentGrade = grade;
    //         break;
    //     }
    // }

    return (
        !student
            ? (<React.Fragment/>)
            : (
                <div
                    className="border border-mentat-gold/20 rounded-lg p-4 bg-card-color/10"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-medium">
                                {student.firstName} {student.lastName}
                            </h4>
                            <p className="text-sm">
                                Current Grade:&nbsp;
                                <span className="font-medium text-green-600">
                                    {calculatedCurrentGrade}
                                </span>
                            </p>
                        </div>
                        <button className="text-sm bg-white border border-green-300
                        text-green-600 hover:bg-green-50 px-3 py-1 rounded">
                            Message
                        </button>
                    </div>
                    <div className="mt-3">
                        <p className="text-xs text-mentat-gold/40 mb-1">Exam Performance:</p>
                        <div className="space-y-1">
                            {student.exams && student.exams.map(exam => (
                                <div
                                    key={`${exam.examId}-${exam.examName}-${exam.examVersion}`}
                                    className="flex justify-between text-xs"
                                >
                                    <span>{exam.examName}</span>
                                    <span className={exam.examScore >= 90
                                        ? 'text-green-600 font-medium' : ''}
                                    >
                                                                {exam.examScore}/{exam.maxScore}
                                                            </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
    );
}