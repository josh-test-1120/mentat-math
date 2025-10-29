'use client'

import React, {useEffect, useState} from 'react';
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Course from "@/components/types/course";
import { CourseStrategy, GradeStrategy } from "@/app/dashboard/types/shared";

interface CourseDetailsComponentProps {
    course: Course | undefined;
    cancelAction: () => void
}

/**
 * This is the View course action component, which will show the
 * Course details only
 * @param course
 * @param cancelAction
 * @constructor
 * @author Joshua Summers
 */
export default function CourseDetailsComponent({ course,
                                                  cancelAction } : CourseDetailsComponentProps) {
    // These are the session state variables
    const { data: session, status } = useSession();
    // Session user information
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: '',
        accessToken: '',
    });

    // State variables
    const [gradeStrategy, setGradeStrategy] = useState<CourseStrategy>();
    // Valid grades
    const validGrades = ['GradeA', 'GradeA-', 'GradeB+', 'GradeB', 'GradeB-',
        'GradeC+', 'GradeC', 'GradeD', 'GradeF'];
    const styledGrades = {'GradeA': 'Grade A', 'GradeA-': 'Grade A-', 'GradeB+': 'Grade B+',
        'GradeB': 'Grade B', 'GradeB-': 'Grade B-', 'GradeC+': 'Grade C+', 'GradeC': 'Grade C',
        'GradeD': 'Grade D', 'GradeF': 'Grade F'};

    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    /**
     * useAffects that bind the page to refreshes and updates
     */
    // Page and Session Hydration
    useEffect(() => {
        if (status !== "authenticated") return;
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                accessToken: session?.user.accessToken || ''
            };

            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]);

    /**
     * UseEffect for the course changes (hydration)
     */
    useEffect(() => {
        if (!course) return
        // Parse and set the grade strategy
        parseGradeStrategy()
    }, [course]);

    // Load the specific grade strategy details
    const loadGradeStrategy = (strategy: GradeStrategy) => {
        // Define the grade letter strategy
        let newStrategy: GradeStrategy = {
            total: strategy?.total || 0,
            requiredA: strategy?.requiredA || 0,
            optional: strategy?.optional || [],
            allOptional: strategy?.allOptional || false
        }
        // Return the new Grade Strategy
        return newStrategy;
    }

    /**
     * Deserialize the grade strategy from the course
     */
    const parseGradeStrategy = () => {
        if (course?.gradeStrategy) {
            const strategyJSON: CourseStrategy = JSON.parse(course.gradeStrategy);
            setGradeStrategy(strategyJSON);
        }
    }

    return (
        course &&
        <div className="flex inset-0 justify-center items-center">
            <form id="ExamActionForm" className="w-full space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseName" className="text-sm">Course Name</label>
                        <input
                            type="text"
                            id="courseName"
                            name="courseName"
                            value={course.courseName}
                            className="w-full rounded-md bg-white/5 text-mentat-gold
                                placeholder-mentat-gold/60 border border-mentat-gold/20
                                focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                            readOnly={true}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseProfessorId" className="text-sm">Course Instructor ID</label>
                        <input
                            id="courseProfessorId"
                            type="text"
                            name="courseProfessorId"
                            value={course.courseProfessorId}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0
                                px-3 py-2"
                            readOnly={true}
                        >
                        </input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseSection" className="text-sm">Course Section</label>
                        <input
                            id="courseSection"
                            type="text"
                            name="courseSection"
                            value={course.courseSection}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
                            readOnly={true}
                        >
                        </input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseQuarter" className="text-sm">Course Quarter</label>
                        <input
                            id="courseQuarter"
                            type="text"
                            name="courseQuarter"
                            value={course.courseQuarter}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
                            readOnly={true}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseYear" className="text-sm">Course Year</label>
                        <input
                            id="courseYear"
                            type="text"
                            name="courseYear"
                            value={course.courseYear}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
                            readOnly={true}
                        />
                    </div>


                    {/*<div className="flex flex-col gap-2 justify-center">*/}
                    {/*    <div className="flex items-center gap-3">*/}
                    {/*        <input*/}
                    {/*            id="courseGradeStrategy"*/}
                    {/*            type="checkbox"*/}
                    {/*            name="is_required"*/}
                    {/*            checked={course !== undefined*/}
                    {/*                ? course.gradeStrategy === 1 : false}*/}
                    {/*            // onChange={data}*/}
                    {/*            className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5*/}
                    {/*                text-mentat-gold focus:ring-mentat-gold"*/}
                    {/*            readOnly={true}*/}
                    {/*        />*/}
                    {/*        <label htmlFor="is_required" className="select-none">Is Exam Required</label>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>

                {!gradeStrategy ? (
                    <div className="text-center">
                        <p className="text-sm italic text-mentat-gold/80">This course has no grade strategy</p>
                    </div>
                    ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-1 justify-center">
                            <p>Grade Strategy Details:</p>
                        </div>
                        {/*General Details Layer*/}
                        <div className="bg-card-color border border-mentat-gold/20
                        px-2 py-2 rounded-lg"
                        >
                            <div className="flex flex-col-2 gap-2 justify-between italic text-sm mb-1
                            text-mentat-gold/80"
                            >
                                <div>Total Exams:&nbsp;</div>
                                <div className="not-italic">
                                    {gradeStrategy.totalExams}
                                </div>
                            </div>
                            {/*Required Exams*/}
                            <div className="italic text-sm mb-1 text-mentat-gold/80">
                                Required Exams:
                            </div>
                            <div className="flex flex-row flex-wrap gap-2 mb-1 justify-end text-mentat-gold/40">
                                {gradeStrategy.requiredExams.map((exam) => {
                                    const name = exam.toString();
                                    return (
                                        <div
                                            key={name}
                                            className={`flex items-center justify-center text-xs border
                                            border-mentat-gold/20 rounded-2xl bg-card-color/15 py-0.5 px-2`}
                                        >
                                            {name}
                                        </div>
                                    )
                                })}
                            </div>
                            {/*Optional Exams*/}
                            <div className="italic text-sm mb-1 text-mentat-gold/80">
                                Optional Exams:
                            </div>
                            <div className="flex flex-row flex-wrap gap-2 mb-1 text-mentat-gold/40 justify-end">
                                {gradeStrategy.optionalExams.map((exam) => {
                                    const name = exam.toString();
                                    return (
                                        <div
                                            key={name}
                                            className={`flex items-center justify-center text-xs border
                                            border-mentat-gold/20 rounded-2xl bg-card-color/15 py-0.5 px-2`}
                                        >
                                            {name}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        {/*Letter Grade Specifics*/}
                        <div className="italic text-center">
                            Letter Grade Requirements:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-mentat-gold/80">
                            {validGrades.map((grade) => {
                                return (
                                    <div
                                        className='border border-mentat-gold/20 rounded-lg bg-card-color
                                        px-4 py-2'
                                        key={grade}
                                    >
                                        <div className={'text-center font-semibold italic'}>
                                            {styledGrades[grade as keyof typeof styledGrades]}
                                        </div>
                                        <hr className='border-1 border-mentat-gold-700/60 mb-1' />
                                        <div className='flex flex-col-2 gap-2 justify-between text-sm mb-1'>
                                            <div>Total Exams Required:&nbsp;</div>
                                            <div className="not-italic text-end">
                                                {gradeStrategy[grade as keyof typeof styledGrades].total}
                                            </div>
                                        </div>
                                        {/*Only if optional exams are required*/}
                                        {gradeStrategy[grade as keyof typeof styledGrades].optional.length > 0 && (
                                            <div>
                                                <div className="text-sm mb-1">
                                                    Optional Exams:
                                                </div>
                                                <div className="flex flex-row flex-wrap gap-2 mb-1 justify-end
                                                text-mentat-gold/40"
                                                >
                                                    {gradeStrategy[grade as keyof typeof styledGrades].optional.map((exam) => {
                                                        const name = exam.toString();
                                                        return (
                                                            <div
                                                                key={name}
                                                                className={`flex items-center justify-center text-[10px]
                                                                border border-mentat-gold/20 rounded-lg
                                                                bg-card-color/15 px-1 py-0.5`}
                                                            >
                                                                {name}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className='flex flex-col-2 gap-2 justify-between text-sm mb-1'>
                                                    All Optional Required:&nbsp;
                                                    <span className={`not-italic ${gradeStrategy[grade as keyof typeof styledGrades].allOptional?
                                                            'text-green-700/60' : 'text-red-700/60'}`}>
                                                        {gradeStrategy[grade as keyof typeof styledGrades].allOptional?
                                                            'True' : 'False'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col-2 gap-2 justify-between text-sm">
                                            Number of require As:&nbsp;
                                            <span className="not-italic">
                                                {gradeStrategy[grade as keyof typeof styledGrades].requiredA}
                                            </span>
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={cancelAction}
                        className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold
                            py-2 px-4 rounded-md border border-mentat-gold/20 shadow-sm shadow-white/10"
                    >
                        Close
                    </button>
                </div>
            </form>
        </div>
    );
}