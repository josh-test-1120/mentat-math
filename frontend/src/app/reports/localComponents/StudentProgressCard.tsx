"use client";

import React, { useEffect } from "react";
import { GradeStrategy, StudentExams } from "@/app/reports/types/shared";
import { useGradeCalculations } from "@/app/reports/hooks/useGradeCalculations";
import { usePopover } from "@/app/reports/hooks/usePopover";
import { studentStatus, calculateAverageGrade, scoreToNumber } from "@/app/reports/utils/GradeDetermination";

interface StudentProgressCardProps {
    student: StudentExams | undefined;
    gradeStrategyNew: GradeStrategy | undefined;
}

/**
 * Instructor Exam Statistics Component
 * Shows instructors some insight into exam scheduling and student analysis
 */
export default function StudentProgressCard({student, gradeStrategyNew}: StudentProgressCardProps) {

    // Grade Calculation Hooks
    const {gradeRequirements, calculatedCurrentGrade} = useGradeCalculations({
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

    // Grade strategy color visualization
    const gradeStrategy = {
        F: {min: 0, max: 59, color: 'bg-red-500'},
        D: {min: 60, max: 69, color: 'bg-orange-500'},
        C: {min: 70, max: 79, color: 'bg-yellow-500'},
        B: {min: 80, max: 89, color: 'bg-blue-500'},
        A: {min: 90, max: 100, color: 'bg-green-500'},
    };

    return (
        !student
            ? (<React.Fragment/>)
            : (
                <React.Fragment>
                    <div
                        ref={triggerRef}
                        className="rounded-lg p-4 pb-0 bg-card-color/10 cursor-pointer transition-all duration-200
                           hover:bg-mentat-gold/20 active:scale-95 shadow-sm shadow-mentat-gold/40"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">
                                {student.firstName} {student.lastName}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                student.status === 'passing'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {student.status === 'passing' ? 'Passing' : 'Failing'}
                            </span>
                        </div>

                        {/* Grade strategy visualization */}
                        <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>F (0-59)</span>
                                <span>D (60-69)</span>
                                <span>C (70-79)</span>
                                <span>B (80-89)</span>
                                <span>A (90-100)</span>
                            </div>
                            <div className="flex h-6 rounded-md overflow-hidden">
                                {gradeStrategy && Object.entries(gradeStrategy).map(([grade, data]) => (
                                    <div
                                        key={grade}
                                        className={`${data.color} relative flex-1`}
                                    >
                                        {calculatedCurrentGrade === grade && (
                                            <div
                                                className="absolute top-full transform -translate-x-1/2
                                                    w-0 h-0 border-l-8 border-r-8 border-t-8 border-t-mentat-black
                                                    border-transparent z-30 -mt-2"
                                                style={{
                                                    left: '50%'
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Current Grade: {calculatedCurrentGrade}</span>
                            </div>
                        </div>

                        {/* Quick exam preview (shows first 2 exams) */}
                        {/*<div className="grid grid-cols-2 gap-2 mt-2">*/}
                        {/*    {student.exams?.slice(0, 2).map(exam => (*/}
                        {/*        <div*/}
                        {/*            key={`${exam.examId}-${exam.examName}-${exam.examVersion}`}*/}
                        {/*            className="text-xs"*/}
                        {/*        >*/}
                        {/*    <span className="font-medium">*/}
                        {/*        {exam.examName}:*/}
                        {/*    </span>*/}
                        {/*            &nbsp;{exam.examScore}%*/}
                        {/*        </div>*/}
                        {/*    ))}*/}
                        {/*    {student.exams && student.exams.length > 2 && (*/}
                        {/*        <div className="text-xs text-mentat-gold/70 col-span-2 text-center">*/}
                        {/*            +{student.exams.length - 2} more exams...*/}
                        {/*        </div>*/}
                        {/*    )}*/}
                        {/*</div>*/}
                    </div>

                    {/* Popover */}
                    {isVisible && (
                        <div
                            className="fixed z-30 bg-mentat-black border border-mentat-gold/30
                            rounded-lg p-4 pt-8 max-w-sm transform -translate-x-1/2
                            -translate-y-full backdrop-blur-lg bg-opacity-95 backdrop-saturate-50
                            shadow-sm shadow-mentat-gold/40"
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
    )
}
