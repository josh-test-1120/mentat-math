/**
 * This is the Student Report page
 * This will give a comprehensive overview
 * of all exams that have been taken,
 * what grades have been received,
 * and what grade they are likely to receive
 * based on their progress.
 * Additionally, a student can see their progress
 * towards any particular grade to know what more
 * is required to receive that grade
 * @author Joshua Summers
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusChart } from "./localComponents/StatusChart";
import ProgressChart from "./localComponents/ProgressChart";
import { ExamTable } from "@/app/reports/localComponents/GradeStrategyTable";
import { StrategyProgressBar } from "./localComponents/StrategyProgressBar";
import GradeDashboard from "@/app/reports/localComponents/GradeDashboard";
import { RingSpinner } from "@/components/UI/Spinners";
import { CourseSelector, allCourse } from "@/components/services/CourseSelector";
import { useSessionData } from "@/hooks/useSessionData";
import { useFetchData } from "@/app/reports/hooks/useFetchData";
import { useReportFilters } from "@/app/reports/hooks/useReportFilters";


/**
 * This is the Student Report default page component
 * @constructor
 */
export function StudentReport() {
    // This is the Backend API data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API ?? '';
    // Session hook
    const { userSession, sessionReady } = useSessionData();
    // Data Fetch hook
    const {
        grades,
        courses,
        exams,
        selectedCourse,
        setSelectedCourse,
        loading,
        fetchAllData,
        fetchExams
    } = useFetchData(userSession, BACKEND_API);
    // Memoized filters hook
    const {
        filter,
        courseFilter,
        gradeFilter,
        currentGrade,
        courseGrades,
        setGradeFilter,
        setCourseGrades,
        updateCourseHandler,
        filteredGrades,
        filteredCourse,
        filteredGradeStrategy,
    } = useReportFilters(courses, selectedCourse, setSelectedCourse);

    // Toggle states
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);

    /**
     * This useEffect fetches the data once
     * the session has been hydrated
     */
    useEffect(() => {
        if (!sessionReady || hasFetched.current) return;

        const hydrateData = async () => {
            hasFetched.current = true;
            await fetchAllData();
        }
        // Call the async handler
        hydrateData();
    }, [sessionReady, fetchAllData, refreshTrigger]);

    /**
     * This useEffect ties the fetch hook states
     * and the report filter states together
     */
    useEffect(() => {
        if (!selectedCourse || loading) return;

        const updateCourseExams = async () => {
            // Update course grades
            const reducedGrades = grades.filter(grade =>
                grade.courseName === courseFilter);
            setCourseGrades(reducedGrades);
            // Fetch exams for this course
            await fetchExams(selectedCourse);
        }
        // Call the async handler
        updateCourseExams();
    }, [selectedCourse?.courseId, fetchExams]);

    // Motion Container Variant definitions
    const containerVariants = {
        hidden: {opacity: 0},
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="px-4 py-4">
            {/*This is the course header*/}
            <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
                {/*This is the Course Selection button*/}
                {userSession ?
                    (
                        <React.Fragment>
                            <h2 className="text-xl font-semibold">{userSession.name
                                ? userSession.name + "'s Report"
                                : ''
                            }
                            </h2>
                            {loading ? (<React.Fragment/>) : !selectedCourse
                                ? (
                                    <div>
                                        <p>Student has no courses</p>
                                    </div>
                                )
                                : courses && courses.length > 0 && (
                                    <CourseSelector
                                        courses={courses}
                                        selectedCourseId={selectedCourse.courseId}
                                        onCourseChange={(e) => {
                                            updateCourseHandler(e.target.value);
                                            console.log(filter);
                                        }}
                                    />
                            )}
                        </React.Fragment>
                    ) : (<React.Fragment/>)
                }
            </div>
            {/*Main Area for details of page*/}
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                >
                    <h1 className="text-3xl font-bold text-center mb-1">Student Performance Report</h1>

                    {/* Line Divider */}
                    <hr className="border-crimson border-2 mb-2"></hr>
                    {/*Overflow wrapper container to manage scrolling*/}
                    <div className="overflow-y-auto pt-1 scrollbar-hide max-h-[70vh]">
                        {/*Grade Summary Charts Components*/}
                        <div className="justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-center mb-1">Grade Analysis Overview</h2>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex-1 w-1/2 min-w-[300px] min-h-[300px]">
                                    {loading ? (
                                            <div className="flex justify-center items-center pt-6">
                                                <RingSpinner size={'sm'} color={'mentat-gold'} />
                                                <p className="ml-3 text-md text-mentat-gold">Generating Graph...</p>
                                            </div>
                                        ) :
                                        (
                                            <motion.div
                                                // variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="space-y-2 mb-2"
                                            >
                                                <StatusChart
                                                    key={`grade-chart-${courseFilter}-
                                                                ${filteredGrades.length}`}
                                                    data={filteredGrades}
                                                />
                                            </motion.div>
                                        )}
                                </div>
                                <div className="flex-1 w-1/2 min-w-[300px] min-h-[300px]">
                                    {loading ? (
                                            <div className="flex justify-center items-center pt-6">
                                                <RingSpinner size={'sm'} color={'mentat-gold'} />
                                                <p className="ml-3 text-md text-mentat-gold">Generating Graph...</p>
                                            </div>
                                        ) :
                                        (
                                            <motion.div
                                                // variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="space-y-2 mb-2"
                                            >
                                                <ProgressChart
                                                    key={`progress-chart-${courseFilter}`}
                                                    exams={filteredGrades}
                                                    course={selectedCourse}
                                                    currentGrade={currentGrade}
                                                />
                                            </motion.div>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/*This is the grade statistics dashboard*/}
                        { !loading && filteredGrades.length != 0
                            && currentGrade && (
                            <div className="justify-between items-center mb-6">
                                <GradeDashboard
                                    grades={filteredGrades}
                                    score={currentGrade}
                                    isStrategy={!!filteredGradeStrategy?.strategy}
                                />
                            </div>)}

                        {/*This is the Exam Details According to Grade Strategy*/}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Grade Selection Filter</h2>
                            <div className="flex gap-2">
                                <button
                                    className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                             shadow-sm shadow-mentat-gold-700 ${
                                        gradeFilter === 'A'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('A')}
                                >
                                    A
                                </button>
                                <button
                                    className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                             shadow-sm shadow-mentat-gold-700 ${
                                        gradeFilter === 'B'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('B')}
                                >
                                    B
                                </button>
                                <button
                                    className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                             shadow-sm shadow-mentat-gold-700 ${
                                        gradeFilter === 'C'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('C')}
                                >
                                    C
                                </button>
                                <button
                                    className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                             shadow-sm shadow-mentat-gold-700 ${
                                        gradeFilter === 'D'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('D')}
                                >
                                    D
                                </button>
                                <button
                                    className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors
                                             shadow-sm shadow-mentat-gold-700 ${
                                        gradeFilter === 'F'
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                    onClick={() => setGradeFilter('F')}
                                >
                                    F
                                </button>
                            </div>
                        </div>
                        <hr className="border-crimson border-1 my-4"></hr>

                        {/*This is the grade progress bar*/}
                        { !loading && filteredGrades && filteredGradeStrategy && (
                            <div className="justify-between items-center mb-6">
                                <StrategyProgressBar
                                    grades={filteredGrades}
                                    strategy={filteredGradeStrategy?.strategy}
                                    required={filteredGradeStrategy?.required}
                                    optional={filteredGradeStrategy?.optional}
                                />
                            </div>)
                        }

                        {/*This is the revision progress bars*/}
                        {/* { !loading && filteredGrades && (
                            <div className="justify-between items-center mb-6">
                                <TopicBreakdown
                                    grades={filteredGrades}
                                />
                            </div>)
                        } */}

                        {/*This is the Exam Table*/}
                        {loading ? (
                            <div className="flex justify-center items-center pt-6">
                                <RingSpinner size={'sm'} color={'mentat-gold'} />
                                <p className="ml-3 text-md text-mentat-gold">
                                    Loading Grade Strategy Details...
                                </p>
                            </div>
                        ) : !filteredGradeStrategy ? (
                            <div className="text-center py-6
                                rounded-xl shadow-sm shadow-crimson-700 border border-mentat-gold/40 p-6"
                            >
                                Course has no grade strategy
                            </div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="rounded-xl border border-mentat-gold/40 p-6 pb-3"
                            >
                                <div className="flex items-center justify-between text-right">
                                    <h2 className="text-xl font-semibold">
                                        Grade {gradeFilter} Course Requirements
                                    </h2>
                                    <span className="text-sm text-mentat-gold/80 italic">
                                        {filteredGradeStrategy.strategy.total} exams required with score greater than C <br/>
                                        {filteredGradeStrategy.strategy.requiredA} exams with an A score required
                                    </span>
                                </div>
                                {/*New Grade Strategy Chart*/}
                                <div className="pt-1 mt-2 bg-card-color shadow-sm shadow-crimson-700">
                                    {filteredCourse && exams && courseGrades && (
                                        <AnimatePresence mode="wait">
                                            <ExamTable
                                                grades={courseGrades}
                                                gradeStrategy={filteredGradeStrategy.strategy}
                                                required={filteredGradeStrategy.required}
                                                optional={filteredGradeStrategy.optional}
                                                exams={exams}
                                                course={filteredCourse}
                                                currentGrade={currentGrade}
                                            />
                                        </AnimatePresence>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}