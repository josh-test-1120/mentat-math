'use client';

import React, {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import { CourseStrategy } from "@/app/dashboard/types/shared";
import Exam from "@/components/types/exam";
import { emptyGradeStrategy } from "@/app/dashboard/types/defaults";
import { toast } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { RingSpinner } from "@/components/UI/Spinners";

interface ModifyGradeStrategyComponentProps {
    gradeStrategy: CourseStrategy | undefined;
    courseId: number | undefined;
    setGradeStrategy: (gradeStrategy: CourseStrategy) => void;
}

export default function ModifyGradeStrategyComponent({gradeStrategy,
                                                         courseId, setGradeStrategy}: ModifyGradeStrategyComponentProps) {
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
    // Page Layout states
    const [exams, setExams] = useState<Exam[]>([]);
    const [newRequiredExam, setNewRequiredExam] = useState<string>('');
    const [newOptionalExam, setNewOptionalExam] = useState<string>('');
    const [gradeOptionalExams, setGradeOptionalExams] = useState<Record<string, string>>({});
    // Boolean states for layout
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // Add exam validation
    const [isExamValid, setIsExamValid] = useState<boolean>(false);
    // Valid grades
    const validGrades = ['GradeA', 'GradeA-', 'GradeB+', 'GradeB', 'GradeB-',
        'GradeC+', 'GradeC', 'GradeD', 'GradeF'];
    const styledGrades = {'GradeA': 'Grade A', 'GradeA-': 'Grade A-', 'GradeB+': 'Grade B+',
        'GradeB': 'Grade B', 'GradeB-': 'Grade B-', 'GradeC+': 'Grade C+', 'GradeC': 'Grade C',
        'GradeD': 'Grade D', 'GradeF': 'Grade F'};
    // References
    const gradeErrorRef = useRef<HTMLDivElement>(null);
    const hasFetchedForCourseRef = useRef<number | null>(null);
    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    /**
     * useAffects that bind to the session for hydration of session info
     */
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
     * useEffect that binds to changes of gradeStrategy and courseId
     * and refreshes the page accordingly
     */
    useEffect(() => {
        console.log(`This is the courseId: ${courseId}`);
        console.log(`This is the grade strategy: ${gradeStrategy}`);
        console.log(`This is the start fetched state: ${hasFetchedForCourseRef.current}`);
        if (!courseId) {
            setIsLoading(false);
            return;
        };
        if (hasFetchedForCourseRef.current !== courseId && gradeStrategy) {
            console.log(`This is the courseId (inside): ${courseId}`);
            console.log(`This is the grade strategy (inside): ${gradeStrategy}`);
            // const strategyJSON =  parseGradeStrategy();
            fetchExams();
            hasFetchedForCourseRef.current = courseId;
        }
        console.log(`This is the final fetched state: ${hasFetchedForCourseRef.current}`);
    }, [gradeStrategy, courseId]);

    /**
     * useEffect that binds to the exams state
     * and refreshes the page and other states when it changes
     */
    useEffect(() => {
        if (exams && exams.length > 0) {
            const gradeKeys = Object.values(validGrades);
            console.log(gradeKeys);
            gradeKeys.forEach(key => {
                setGradeOptionalExams(prev => ({
                    ...prev,
                    [key]: exams[0].examName
                }));
            });
            setNewRequiredExam(exams[0].examName);
            setNewOptionalExam(exams[0].examName);
            setIsExamValid(true)
            setIsExpanded(true);
        }
    }, [exams]);

    /**
     * Fetch the exams to be presented for selection
     * in grade strategy
     */
    const fetchExams = async () => {
        setIsLoading(true);
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/exam/course/${courseId}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching exams:', res.error);
            } else {
                // Get the response data
                let examsData = res?.exams || res || [];
                // Ensure it's an array
                examsData = Array.isArray(examsData) ? examsData : [examsData];
                console.log('Processed exams data:', examsData);
                // Set courses to coursesData
                setExams(examsData);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching exams:', e);
        } finally {
            // Set loading to false
            setIsLoading(false);
        }
    }

    /**
     * Generate a default grade strategy for new courses or ones without one
     * @param event
     */
    const loadDefaultGradeStrategy = async (event: React.FormEvent) => {
        event.preventDefault();
        setGradeStrategy(emptyGradeStrategy);
    }

    return (
        <div className="border-t border-mentat-gold/20">
            {/* Grade Strategy Conditional Rendering */}
            { isLoading && gradeStrategy ? (
                <div className="flex justify-center items-center mt-4">
                    <RingSpinner size={'sm'} color={'mentat-gold'} />
                    <p className="ml-3 text-md text-mentat-gold">Loading grade strategy...</p>
                </div>
            )
                : !gradeStrategy ? (
                    <div className="text-center mt-2 text-sm italic text-mentat-gold/80">
                        <p>This course has no grade strategy</p>
                        {!courseId && (
                            <p className="text-[12px] text-mentat-gold/60">
                                If this is a new course, configure this later once exams are populated
                            </p>
                        )}
                        <div className="text-[10px] content-center mt-2">
                            <button
                                className="select-none bg-green-700/60 hover:bg-green-700 rounded-2xl text-mentat-gold py-2 px-4 shadow-sm shadow-mentat-gold-700"
                                onClick={loadDefaultGradeStrategy}
                            >
                                Populate Default Grade Strategy
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4">
                        {/*Link to Exam management page*/}
                        {!isExamValid && courseId && (
                            <div
                                className="flex flex-col gap-2 mb-4 border border-mentat-gold-700/20
                                        rounded-lg px-2 py-2 bg-red-700/20 mt-4">
                                <p className="text-sm italic text-mentat-gold/80 text-center font-semibold">
                                    You must create an exam before you can properly configure strategy
                                </p>
                                <Link href={"/grades"} className="text-center">
                                    <button
                                        className="bg-mentat-gold hover:bg-mentat-gold-700 rounded-2xl text-crimson py-2 px-4 shadow-sm shadow-crimson-700 w-1/3 mx-auto"
                                    >
                                        Add Exam
                                    </button>
                                </Link>
                            </div>
                        )}
                        <div className="border border-mentat-gold/20 rounded-lg bg-card-color mb-4">
                            {/* Collapser Header */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="w-full flex items-center justify-between p-4 hover:bg-mentat-gold/5
                                transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-mentat-gold">
                                    Grade Strategy Details
                                </h3>
                                <ChevronDown
                                    className={`w-5 h-5 text-mentat-gold transform transition-transform ${
                                        isExpanded ? 'rotate-180' : 'rotate-0'
                                    }`}
                                />
                            </button>
                        </div>
                        {/* Collapsible content container*/}
                        <div
                            className={`overflow-hidden
                                ${isExpanded ? 'h-auto opacity-100' : 'h-0 opacity-0'}
                            `}
                        >
                            {/*Main Layout Container*/}
                            <div className="flex flex-col gap-2">
                                {/* General Details Layer */}
                                <div className="bg-card-color border border-mentat-gold/20 px-2 py-2 rounded-lg">
                                    <div className="flex flex-col-2 gap-2 mb-2 items-center justify-between">
                                        <label htmlFor="totalExams" className="text-sm">Total Exams:</label>
                                        <input
                                            type="text"
                                            id="totalExams"
                                            name="totalExams"
                                            disabled={!isExamValid}
                                            value={gradeStrategy.totalExams}
                                            onChange={(e) =>
                                                setGradeStrategy({
                                                    ...gradeStrategy,
                                                    totalExams: e.target.value !== '' ? parseInt(e.target.value) : 0
                                                })
                                            }
                                            className={`w-12 rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-1 py-0 ${
                                                isExamValid ? 'text-mentat-gold opacity-100' : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'
                                            }`}
                                        />
                                    </div>

                                    {/* Required Exams */}
                                    <div className="border border-mentat-gold/20 rounded-lg bg-card-color py-1 px-2">
                                        <div className="italic text-sm mb-1 text-mentat-gold/80">Required Exams:</div>
                                        <div className="flex flex-row flex-wrap gap-2 mb-1 px-4 text-mentat-gold/40">
                                            {gradeStrategy.requiredExams && gradeStrategy.requiredExams.length > 0 && exams && exams.length > 0 &&
                                                gradeStrategy.requiredExams.map((exam) => {
                                                    const name = exam.toString();
                                                    return (
                                                        <div key={name} className="flex justify-center items-center">
                                                            <input
                                                                id={name}
                                                                type="checkbox"
                                                                name={name}
                                                                checked={true}
                                                                onChange={(e) => {
                                                                    let currentExams = gradeStrategy?.requiredExams;
                                                                    const name = e.target.name;
                                                                    currentExams = currentExams.filter((exam) => exam !== name)
                                                                    setGradeStrategy({
                                                                        ...gradeStrategy,
                                                                        requiredExams: currentExams
                                                                    })
                                                                }}
                                                                className="h-4 w-4 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold mr-1"
                                                            />
                                                            <label
                                                                htmlFor={`${name}`}
                                                                className="select-none flex items-center justify-center text-xs border border-mentat-gold/20 rounded-2xl bg-card-color/15 py-0.5 px-2"
                                                            >
                                                                {name}
                                                            </label>
                                                        </div>
                                                    )
                                                })}

                                            {/* Add Exam layout */}
                                            <div className="flex justify-center items-center">
                                                <select
                                                    id="alllRequiredExams"
                                                    value={newRequiredExam}
                                                    onChange={(e) => setNewRequiredExam(e.target.value)}
                                                    className="w-24 h-6 rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-1 py-0 text-xs"
                                                >
                                                    {exams.length === 0 ? (
                                                        <option key='noExams' id='noExams' value='No exams'>No
                                                            Exams</option>
                                                    ) : (
                                                        exams.map((exam) => (
                                                            <option key={exam.examId.toString()}
                                                                    id={exam.examId.toString()} value={exam.examName}>
                                                                {exam.examName}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                                <button
                                                    className={`text-sm border border-mentat-gold/20 rounded-lg ml-1 px-2 shadow-sm shadow-crimson-700 ${
                                                        isExamValid ? 'bg-mentat-gold hover:bg-mentat-gold-700 text-crimson' : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'
                                                    }`}
                                                    disabled={!isExamValid}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (newRequiredExam && gradeStrategy) {
                                                            if (gradeStrategy.requiredExams.includes(newRequiredExam)) {
                                                                toast.error('This exam is already in the list')
                                                            } else if (gradeStrategy.optionalExams.includes(newOptionalExam)) {
                                                                toast.error('This exam is already in optional list')
                                                            } else {
                                                                setGradeStrategy({
                                                                    ...gradeStrategy,
                                                                    requiredExams: [...gradeStrategy.requiredExams, newRequiredExam]
                                                                });
                                                                setNewRequiredExam('');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Add Exam
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optional Exams */}
                                    <div
                                        className="border border-mentat-gold/20 rounded-lg bg-card-color mt-2 py-1 px-2">
                                        <div className="italic text-sm mb-1 text-mentat-gold/80">Optional Exams:</div>
                                        <div className="flex flex-row flex-wrap gap-2 mb-1 px-4 text-mentat-gold/40">
                                            {gradeStrategy.optionalExams && gradeStrategy.optionalExams.length > 0 &&
                                                gradeStrategy.optionalExams.map((exam) => {
                                                    const name = exam.toString();
                                                    return (
                                                        <div key={name} className="flex justify-center items-center">
                                                            <input
                                                                id={name}
                                                                type="checkbox"
                                                                name={name}
                                                                checked={true}
                                                                onChange={(e) => {
                                                                    let currentExams = gradeStrategy?.optionalExams;
                                                                    const name = e.target.name;
                                                                    currentExams = currentExams.filter((exam) => exam !== name)
                                                                    setGradeStrategy({
                                                                        ...gradeStrategy,
                                                                        optionalExams: currentExams
                                                                    })
                                                                }}
                                                                className="h-4 w-4 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold mr-1"
                                                            />
                                                            <label
                                                                htmlFor={`${name}`}
                                                                className="select-none flex items-center justify-center text-xs border border-mentat-gold/20 rounded-2xl bg-card-color/15 py-0.5 px-2"
                                                            >
                                                                {name}
                                                            </label>
                                                        </div>
                                                    )
                                                })}
                                            <div className="flex justify-center items-center">
                                                <select
                                                    id="allOptionalExams"
                                                    value={newOptionalExam}
                                                    onChange={(e) => setNewOptionalExam(e.target.value)}
                                                    className="w-24 h-6 rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-1 py-0 text-xs"
                                                >
                                                    {exams.length === 0 ? (
                                                        <option key='noExams' id='noExams' value='No exams'>No
                                                            Exams</option>
                                                    ) : (
                                                        exams.map((exam) => (
                                                            <option key={exam.examId.toString()}
                                                                    id={exam.examId.toString()} value={exam.examName}>
                                                                {exam.examName}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                                <button
                                                    className={`text-sm border border-mentat-gold/20 rounded-lg ml-1 px-2 shadow-sm shadow-crimson-700 ${
                                                        isExamValid ? 'bg-mentat-gold hover:bg-mentat-gold-700 text-crimson' : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'
                                                    }`}
                                                    disabled={!isExamValid}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (newOptionalExam && gradeStrategy) {
                                                            if (gradeStrategy.optionalExams.includes(newOptionalExam)) {
                                                                toast.error('This exam is already in the list')
                                                            } else if (gradeStrategy.requiredExams.includes(newOptionalExam)) {
                                                                toast.error('This exam is already in required list')
                                                            } else {
                                                                setGradeStrategy({
                                                                    ...gradeStrategy,
                                                                    optionalExams: [...gradeStrategy.optionalExams, newOptionalExam]
                                                                });
                                                                setNewOptionalExam('');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Add Exam
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Letter Grade Specifics */}
                                <div className="flex flex-col gap-2">
                                    <div className="italic text-center">Letter Grade Requirements:</div>
                                    {/* Grade Card Rendering */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-mentat-gold/80">
                                        {validGrades.map((grade) => {
                                            const gradeKey = grade as keyof typeof styledGrades;
                                            return (
                                                <div
                                                    className='border border-mentat-gold/20 rounded-lg bg-card-color px-4 py-2'
                                                    key={grade}>
                                                    <div
                                                        className={'text-center font-semibold italic'}>{styledGrades[gradeKey]}</div>
                                                    <hr className='border-1 border-mentat-gold-700/60 mb-1'/>

                                                    {/* Total Exams Required Input */}
                                                    <div className="flex flex-col-2 gap-2 items-center justify-between">
                                                        <label htmlFor="totalExamsRequired" className="text-sm">Total
                                                            Exams Required:</label>
                                                        <input
                                                            type="text"
                                                            id="totalExamsRequired"
                                                            name="totalExamsRequired"
                                                            value={gradeStrategy[gradeKey].total}
                                                            disabled={!isExamValid}
                                                            onChange={(e) => setGradeStrategy({
                                                                ...gradeStrategy,
                                                                [gradeKey]: {
                                                                    ...gradeStrategy[gradeKey],
                                                                    total: e.target.value
                                                                }
                                                            })}
                                                            className={`w-12 h-6 rounded-md bg-white/5 placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-2 py-2 ${
                                                                isExamValid ? 'text-mentat-gold opacity-100' : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'
                                                            }`}
                                                        />
                                                    </div>

                                                    {/* Letter Grade Optional Exams */}
                                                    <div
                                                        className="border border-mentat-gold/20 rounded-lg bg-card-color my-2 py-1 px-2">
                                                        <div className="text-sm mb-1">Optional Exams:</div>
                                                        <div
                                                            className="flex flex-row flex-wrap gap-2 mb-1 text-mentat-gold/40">
                                                            {gradeStrategy[gradeKey].optional.map((exam) => {
                                                                const name = exam.toString();
                                                                return (
                                                                    <div key={`${gradeKey}-${name}`}
                                                                         className="text-[10px] content-center">
                                                                        <input
                                                                            id={`${gradeKey}-${name}`}
                                                                            type="checkbox"
                                                                            name={name}
                                                                            checked={true}
                                                                            onChange={(e) => {
                                                                                let currentExams = gradeStrategy[gradeKey].optional;
                                                                                const name = e.target.name;
                                                                                currentExams = currentExams.filter((exam) => exam !== name)
                                                                                setGradeStrategy({
                                                                                    ...gradeStrategy,
                                                                                    [gradeKey]: {
                                                                                        ...gradeStrategy[gradeKey],
                                                                                        optional: currentExams
                                                                                    }
                                                                                })
                                                                            }}
                                                                            className="h-4 w-4 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold mr-1"
                                                                        />
                                                                        <label
                                                                            htmlFor={`${gradeKey}-${name}`}
                                                                            className="select-none border-mentat-gold/20 rounded-2xl bg-card-color/15 py-0.5 px-2"
                                                                        >
                                                                            {name}
                                                                        </label>
                                                                    </div>
                                                                )
                                                            })}
                                                            <div className="flex justify-center items-center">
                                                                <select
                                                                    id="alllOptionalExams"
                                                                    value={gradeOptionalExams[gradeKey]}
                                                                    onChange={(e) => {
                                                                        setGradeOptionalExams(prev => ({
                                                                            ...prev,
                                                                            [gradeKey]: e.target.value
                                                                        }))
                                                                    }}
                                                                    className="w-24 h-6 rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-1 py-0 text-xs"
                                                                >
                                                                    {exams.length === 0 ? (
                                                                        <option key='noExams' id='noExams'
                                                                                value='No exams'>No Exams</option>
                                                                    ) : (
                                                                        exams.map((exam) => (
                                                                            <option key={exam.examId.toString()}
                                                                                    id={exam.examId.toString()}
                                                                                    value={exam.examName}>
                                                                                {exam.examName}
                                                                            </option>
                                                                        ))
                                                                    )}
                                                                </select>
                                                                <button
                                                                    className={`text-sm border border-mentat-gold/20 rounded-lg ml-1 px-2 shadow-sm shadow-crimson-700 ${
                                                                        isExamValid ? 'bg-mentat-gold hover:bg-mentat-gold-700 text-crimson' : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'
                                                                    }`}
                                                                    disabled={!isExamValid}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        const examValue = gradeOptionalExams[gradeKey];
                                                                        console.log(`This is the exam value: ${examValue}`);
                                                                        console.log(gradeOptionalExams);
                                                                        if (examValue && gradeStrategy) {
                                                                            if (gradeStrategy[gradeKey].optional.includes(examValue)) {
                                                                                toast.error('This exam is already in the list')
                                                                            } else {
                                                                                setGradeStrategy({
                                                                                    ...gradeStrategy,
                                                                                    [gradeKey]: {
                                                                                        ...gradeStrategy[gradeKey],
                                                                                        optional: [...gradeStrategy[gradeKey].optional, examValue]
                                                                                    }
                                                                                });
                                                                                setGradeOptionalExams(prev => ({
                                                                                    ...prev,
                                                                                    [gradeKey]: exams[0].examName
                                                                                }));
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    Add Exam
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="min-h-0 text-xs text-red-700 italic hidden"
                                                         ref={gradeErrorRef}>
                                                        Please select a different exam
                                                    </div>

                                                    {/* All Optional Exams are Required? */}
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label htmlFor="allOptionalRequired" className="text-sm">All
                                                            Optional Required:</label>
                                                        <select
                                                            id="allOptionalRequired"
                                                            value={gradeStrategy[gradeKey].allOptional ? "true" : "false"}
                                                            disabled={!isExamValid}
                                                            onChange={(e) => setGradeStrategy({
                                                                ...gradeStrategy,
                                                                [gradeKey]: {
                                                                    ...gradeStrategy[gradeKey],
                                                                    allOptional: e.target.value === "true"
                                                                }
                                                            })}
                                                            className={`w-24 h-6 rounded-md bg-white/5 text-sm placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-1 py-0 ${
                                                                isExamValid ? 'text-mentat-gold opacity-100' : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <option value="false">False</option>
                                                            <option value="true">True</option>
                                                        </select>
                                                    </div>

                                                    {/* Number of exams that must have A grades */}
                                                    <div className="flex flex-col-2 gap-2 items-center justify-between">
                                                        <label htmlFor="totalRequiredAs" className="text-sm">Number of
                                                            Required As:</label>
                                                        <input
                                                            type="text"
                                                            id="totalRequiredAs"
                                                            name="totalRequiredAs"
                                                            disabled={!isExamValid}
                                                            value={gradeStrategy[gradeKey].requiredA}
                                                            onChange={(e) => setGradeStrategy({
                                                                ...gradeStrategy,
                                                                [gradeKey]: {
                                                                    ...gradeStrategy[gradeKey],
                                                                    requiredA: e.target.value
                                                                }
                                                            })}
                                                            className={`w-12 h-6 rounded-md bg-white/5 placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-2 py-2 ${
                                                                isExamValid ? 'text-mentat-gold opacity-100' : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            )}
        </div>
    );
}