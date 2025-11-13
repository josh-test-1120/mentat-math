'use client';

import React, {useState, useEffect, useMemo, useRef} from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from 'framer-motion';
import CreateScheduledExam from "@/app/schedule/localComponents/CreateScheduledExam";
import { RingSpinner } from "@/components/UI/Spinners";
import { ExamCardMedium } from "@/app/schedule/localComponents/ExamCard";
import { CourseSelector, allCourse } from "@/components/services/CourseSelector";
import { useSessionData } from "@/hooks/useSessionData";
import { useFetchData } from "@/app/schedule/hooks/useFetchData";
import { useExamFilters } from "@/app/schedule/hooks/useExamFilters";

/**
 * This component will render a page that shows all
 * exams that a student has attempted. This will include
 * any existing exams taken, and any upcoming exams
 * @constructor
 * @author Joshua Summers
 */
export default function StudentSchedule() {
    // This is the Backend API data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API ?? '';
    // Session hook
    const { userSession, sessionReady } = useSessionData();
    // Data Fetch hook
    const { exams, courses, loading, fetchAllData } = useFetchData(userSession, BACKEND_API);
    // Memoized filter hook
    const {
        selectedCourse,
        updateCourseHandler,
        filteredExams,
        filteredCourses
    } = useExamFilters(exams, courses);
    // Refresh trigger (to re-render page)
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);


    /**
     * useAffects that bind the page to refreshes and updates
     */
    useEffect(() => {
        if (!sessionReady || hasFetched.current) return;

        hasFetched.current = true;
        fetchAllData();
    }, [sessionReady, fetchAllData]);

    // Changes to session or refresh will trigger a page update
    useEffect(() => {
        if (!sessionReady) return;
        fetchAllData();
    }, [refreshTrigger, sessionReady, fetchAllData]);

    /**
     * Handle refresh increment for page re-render
     */
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="w-full max-w-screen-2xl px-4 pt-2 pb-2">
            <div className="max-w-5xl mx-auto overflow-y-auto scrollbar-hide">
                {/*Create Scheduled Exam Component*/}
                <header className="mb-1">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold ml-4">Manage Scheduled Exams</h1>
                        { userSession.id !== '' && filteredCourses ? (
                            < CreateScheduledExam
                                studentId={userSession.id}
                                courses={courses}
                                filteredCourse={selectedCourse}
                                updateAction={handleRefresh}
                            />
                        ): ( <React.Fragment /> )}

                    </div>
                </header>
                {/*This is the course selector component*/}
                <div className="rounded-xl shadow-sm px-4 py-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Your Scheduled Exams</h2>
                        { courses && courses.length > 0 && (
                            <CourseSelector
                                courses={courses}
                                selectedCourseId={selectedCourse?.courseId}
                                onCourseChange={(e) => {
                                    updateCourseHandler(e.target.value);
                                }}
                                allDefault={true}
                                />
                        )}
                    </div>
                </div>
                {/* Line Divider */}
                <hr className="border-crimson border-2 mb-2"></hr>
                {/* Card Layout */}
                <div className="shadow-sm px-4 pb-10 pt-2 max-h-[60vh] min-h-[200px]
                    overflow-y-auto scrollbar-hide"
                >
                    { loading ? (
                        <div className="flex justify-center items-center pt-10">
                            <RingSpinner size={'sm'} color={'mentat-gold'} />
                            <p className="ml-3 text-md text-mentat-gold">Loading scheduled exams...</p>
                        </div>
                    ) : !filteredExams || filteredExams.length === 0 ? (
                            <div className="text-center py-12">
                                No exams found for the selected filter.
                            </div>
                    ) : filteredExams && filteredExams.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                        xl:grid-cols-5 gap-4">
                            <AnimatePresence>
                                {filteredExams
                                    .map((examInst) => (
                                    <ExamCardMedium
                                        key={`${examInst.examId}-${examInst.examVersion}`}
                                        exam={examInst}
                                        index={0}
                                        updateAction={handleRefresh}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/*<div className="rounded-xl shadow-sm pt-6 mb-1">*/}
                    {/*    <h2 className="text-xl font-semibold mb-4">Exam Performance Summary</h2>*/}
                    {/*    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">*/}
                    {/*        <div className="p-4 rounded-lg border bg-card-color*/}
                    {/*            shadow-md shadow-crimson-700">*/}
                    {/*            <h3 className="text-lg font-medium mb-2">Passed Student Exams</h3>*/}
                    {/*            <p className="text-3xl font-bold">*/}
                    {/*                {exams.filter(exam => exam.status === 'active').length}*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*        <div className="p-4 rounded-lg border bg-card-color*/}
                    {/*            shadow-md shadow-crimson-700">*/}
                    {/*            <h3 className="text-lg font-medium mb-2">Failed Student Exams</h3>*/}
                    {/*            <p className="text-3xl font-bold">*/}
                    {/*                {exams.filter(exam => exam.status === 'inactive').length}*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*        <div className="p-4 rounded-lg border bg-card-color*/}
                    {/*            shadow-md shadow-crimson-700">*/}
                    {/*            <h3 className="text-lg font-medium mb-2">Average Student Score</h3>*/}
                    {/*            <p className="text-3xl font-bold">*/}
                    {/*                {exams.filter(exam => exam.status === 'active'*/}
                    {/*                    && exam.exam_score !== undefined).length > 0*/}
                    {/*                    ? avgScore(exams) : 0}*/}

                    {/*                /!*{exams.filter(e => e.status === 'completed' && e.exam_score !== undefined).length > 0*!/*/}
                    {/*                /!*    ? Math.round(exams.filter(e => e.status === 'completed' && e.score !== undefined)*!/*/}
                    {/*                /!*            .reduce((acc, e) => acc + (e.score!/e.totalScore * 100), 0) /*!/*/}
                    {/*                /!*        exams.filter(e => e.status === 'completed' && e.score !== undefined).length)*!/*/}
                    {/*                /!*    : 0}%*!/*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    );
};