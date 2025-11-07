"use client";

import React, {useEffect} from "react";
import { GradeStrategy, StudentExams } from "@/app/reports/types/shared";
import { useGradeCalculations } from "@/app/reports/hooks/useGradeCalculations";

interface StudentAttentionCardProps {
    student: StudentExams | undefined;
    gradeStrategyNew: GradeStrategy | undefined;
}

/**
 * Student Attention Card for Instructor views
 * Shows instructors some insight into students that are not performing well
 */
export default function StudentAttentionCard({student, gradeStrategyNew}: StudentAttentionCardProps) {

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

    return (
        !student
            ? (<React.Fragment/>)
            : (
                <div
                    className="border border-mentat-gold/20 rounded-lg bg-card-color/10 p-4"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-medium">
                                {student.firstName} {student.lastName}
                            </h4>
                            <p className="text-sm">
                                Current Grade:&nbsp;
                                <span className="font-medium text-red-600">
                                    {calculatedCurrentGrade}
                                </span>
                            </p>
                        </div>
                        <button className="text-sm bg-white border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded">
                            Contact
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
                                    <span className={exam.examScore < 70
                                        ? 'text-red-600 font-medium' : ''}
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