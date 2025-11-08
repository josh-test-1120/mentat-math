"use client";

import React, { useEffect } from "react";
import { GradeStrategy, StudentExams } from "@/app/reports/types/shared";
import { useGradeCalculations } from "@/app/reports/hooks/useGradeCalculations";
import { usePopover } from "@/app/reports/hooks/usePopover";
import { studentStatus, calculateAverageGrade } from "@/app/reports/utils/GradeDetermination";

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

    // Popover Hooks
    const {
        isVisible,
        position,
        triggerRef,
        handleMouseEnter,
        handleMouseLeave,
        handleClick,
        hidePopover,
        handlePopoverMouseEnter,
        handlePopoverMouseLeave
    } = usePopover(500);

    // Passing grades
    const passingGrade = ['A', 'B', 'C'];

    useEffect(() => {
        if (student && calculatedCurrentGrade) {
            student.status = studentStatus(calculatedCurrentGrade)
        }
    }, [student, calculatedCurrentGrade]);

    return (
        !student
            ? (<React.Fragment/>)
            : (
                <React.Fragment>
                    <div
                        ref={triggerRef}
                        className="border border-mentat-gold/20 rounded-lg bg-card-color/10 p-4 pb-2
                        cursor-pointer transition-all duration-200 hover:border-mentat-gold/40
                        hover:bg-card-color/20 active:scale-95"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                    >
                        <div className="flex justify-between items-start">
                            <div className="pr-2">
                                <h4 className="font-medium mb-1">
                                    {student.firstName} {student.lastName}
                                </h4>
                                <p className="text-sm text-mentat-gold/60">
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
                    </div>

                    {/* Popover */}
                    {isVisible && (
                        <div
                            className="fixed z-30 bg-mentat-black border border-mentat-gold/30
                            rounded-lg shadow-lg p-4 pt-8 max-w-sm transform -translate-x-1/2
                            -translate-y-full backdrop-blur-lg bg-opacity-95"
                            style={{
                                left: position.x,
                                top: position.y - 10
                            }}
                            onMouseEnter={handlePopoverMouseEnter}
                            onMouseLeave={handlePopoverMouseLeave}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Popover arrow */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
                                                       w-0 h-0 border-l-8 border-r-8 border-t-8 border-t-card-color
                                                       border-transparent"></div>

                            <div className="mb-2">
                                <h4 className="font-semibold text-mentat-gold/80 mb-2 italic">
                                    Performance Details for {student.firstName} {student.lastName}
                                </h4>

                                {/* All exam scores in detail */}
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {student.exams?.map((exam, index) => (
                                        <div
                                            key={`${exam.examId}-${exam.examName}-${exam.examVersion}`}
                                            className="flex justify-between items-center p-2 rounded bg-card-color/10"
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium text-sm mb-1">
                                                    {exam.examName}
                                                </div>
                                                <div className="flex flex-row gap-2 justify-between">
                                                    <div className="flex text-xs text-mentat-gold/60 px-2">
                                                        Version: {exam.examVersion}
                                                    </div>
                                                    <div className="flex text-xs text-mentat-gold/60 px-2">
                                                        Date: {exam?.examTakenDate
                                                        ? new Date(exam.examTakenDate).toLocaleDateString()
                                                        : 'Pending'}
                                                    </div>
                                                    <div className="flex text-xs text-mentat-gold/60 px-2">
                                                        <span>
                                                            Grade:&nbsp;
                                                        </span>
                                                        <span className={`font-bold ${
                                                            passingGrade.includes(exam.examScore ?? 'None')
                                                                ? 'text-green-600' : 'text-red-600'
                                                        }`}
                                                        >
                                                            {exam.examScore}
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="mt-3 pt-3 border-t border-mentat-gold/20">
                                    <div className="flex justify-between text-sm">
                                        <span>Average Score:</span>
                                        <span className="font-semibold">
                                                        {student.exams && student.exams.length > 0
                                                            ? calculateAverageGrade(student.exams): 'N/A'}
                                                    </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Exams Taken:</span>
                                        <span className="font-semibold">{student.exams?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Close button - the ONLY way to close click-opened popovers */}
                            <button
                                onClick={hidePopover}
                                className="absolute top-2 right-2 text-gray-400 hover:text-mentat-gold
                                                           transition-colors duration-200 bg-card-color rounded-full w-6 h-6
                                                           flex items-center justify-center border border-mentat-gold/20
                                                           hover:bg-mentat-gold hover:border-mentat-gold"
                                aria-label="Close popover"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </React.Fragment>
            )
    );
}