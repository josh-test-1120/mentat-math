'use client';

import React, {useState, useEffect, useMemo} from "react";
import "react-toastify/dist/ReactToastify.css";
import { apiHandler } from "@/utils/api";
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion';
import { ExamProp } from "@/components/types/exams";
import Exam from "@/components/types/exam";
import Course from "@/components/types/course";
import { ExamCardSmall } from "@/app/grades/localComponents/ExamCards";
import CreateExam from "./localComponents/CreateExam";
import Modal from "@/components/services/Modal";
import ExamDetailsComponent from "@/app/grades/localComponents/ExamDetails";
import { RingSpinner } from "@/components/UI/Spinners";
import { ExamExtended } from "@/app/grades/util/types";
import ExamResult from "@/components/types/exam_result";

// Status Counter
const statusScore = (exam: ExamResult) => {
    if (exam.examScore == 'A') return 5;
    else if (exam.examScore == 'B') return 4;
    else if (exam.examScore == 'C') return 3;
    else if (exam.examScore == 'D') return 2;
    else if (exam.examScore == 'F') return 1;
    else return 0;
}

const avgScore = (exams: ExamResult[]) => {
    let counter = 0;
    console.log('Calculate Average of Exam Results');
    console.log(exams);
    exams.forEach((exam: ExamResult) => {
        if (exam.examScore == 'A') counter += 5;
        else if (exam.examScore == 'B') counter += 4;
        else if (exam.examScore == 'C') counter += 3;
        else if (exam.examScore == 'D') counter += 2;
        else if (exam.examScore == 'F') counter += 1;
    });
    // Get the average
    let avg = Math.round(counter / exams.length);

    // Return the letter score
    switch (avg) {
        case 5: return 'A';
        case 4: return 'B';
        case 3: return 'C';
        case 2: return 'D';
        case 1: return 'F';
    }
}

// Main Component
export default function ExamDashboard() {
    const {data: session, status} = useSession();
    const [exams, setExams] = useState<ExamExtended[]>([]);
    const [examResults, setExamResults] = useState<ExamResult[]>();
    const [courses, setCourses] = useState<Course[]>([]);
    const [exam, setExam] = useState<ExamExtended>();
    const [course, setCourse] = useState<Course>();
    const [loading, setLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [examResultsLoading, setExamResultsLoading] = useState(true);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [filter, setFilter] = useState<'all' | string>('all');

    // Fetch exams
    useEffect(() => {
        // If not authenticated, return
        if (status !== 'authenticated') return;
        // Get instructor ID
        const id = session?.user?.id?.toString();
        // If no instructor ID, return
        if (!id) return;

        // Fetch Courses for instructor
        fetchCourses(id);

        // // Fetch Exams
        // fetchExams(id);

    }, [status, session, BACKEND_API, refreshTrigger]);

    useEffect(() => {
        if (session?.user?.id) fetchExams(session.user.id);
    }, [courses]);

    useEffect(() => {
        if (exams && exams.length > 0) fetchExamResults();
    }, [exams]);

    const filteredExams = useMemo(() => {
        // First filter by class
        let result = filter === 'all'
            ? exams
            : exams.filter(exam => exam.courseName === filter);
        console.log('result of filter:', result);
        console.log('length of exams:', exams.length);

        return result;
    }, [filter, exams]);

    const fetchCourses = async (id: string) => {
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/course/instructor/${id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching courses:', res.error);
                setCourses([]);
            } else {
                // Convert object to array
                let coursesData = [];

                // If res is an array, set coursesData to res
                if (Array.isArray(res)) {
                    coursesData = res;
                    // If res is an object, set coursesData to the values of the object
                } else if (res && typeof res === 'object') {
                    // Use Object.entries() to get key-value pairs, then map to values
                    coursesData = Object.entries(res)
                        .filter(([key, value]) =>
                            value !== undefined && value !== null)
                        .map(([key, value]) => value);
                    // If res is not an array or object, set coursesData to an empty array
                } else {
                    coursesData = [];
                }

                // Filter out invalid entries
                coursesData = coursesData.filter(c => c && typeof c === 'object');

                console.log('Processed courses data:', coursesData);
                // Set courses to coursesData
                setCourses(coursesData);
                // setFilter('all');
                // console.log('Length of filter:', filteredExams.length);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching courses:', e);
            // Set courses to empty array
            setCourses([]);
        } finally {
            // Set loading to false
            // setLoading(false);
            setCoursesLoading(false);
        }
    }

    // Fetch exams
    const fetchExams = async (id: string) => {
        // Full exam list
        let examsData: ExamExtended[] = [];
        // Iterate through the courses
        for (const course of courses) {
            // Try wrapper to handle async exceptions
            try {
                // API Handler
                const res = await apiHandler(
                    undefined, // No body for GET request
                    'GET',
                    `api/exam/course/${course.courseId}`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );

                // Handle errors
                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching exams:', res.error);
                    // setExams([]);
                } else {
                    // Convert object to array
                    let courseExamsData = [];

                    // If res is an array, set coursesData to res
                    if (Array.isArray(res)) {
                        courseExamsData = res;
                        // If res is an object, set coursesData to the values of the object
                    } else if (res && typeof res === 'object') {
                        // Use Object.entries() to get key-value pairs, then map to values
                        courseExamsData = Object.entries(res)
                            .filter(([key, value]) =>
                                value !== undefined && value !== null)
                            .map(([key, value]) => value);
                        // If res is not an array or object, set coursesData to an empty array
                    } else {
                        courseExamsData = [];
                    }

                    // Filter out invalid entries
                    courseExamsData = courseExamsData.filter(c => c && typeof c === 'object');

                    courseExamsData = courseExamsData.map((grade: ExamExtended) => ({
                        ...grade,
                        courseName: courses.filter(course =>
                            course.courseId === grade.courseId)[0].courseName,
                    }));
                    examsData.push(...courseExamsData);
                    console.log(`Processed exams data for course ${course.courseName}:`, courseExamsData);
                    // Set courses to coursesData
                    // setExams(examsData);
                    // setFilter('all');
                    // console.log('Length of filter:', filteredExams.length);
                }
            } catch (e) {
                // Error fetching courses
                console.error('Error fetching exams:', e);
                // Set courses to empty array
                // setExams([]);
            } finally {
                // Set loading to false
                // setLoading(false);
            }
        }
        setExams(examsData);
        setLoading(false);
        // setExamsLoading(false);

    }

    // Fetch exams
    const fetchExamResults = async () => {
        // Full exam list
        let examResults: ExamResult[] = [];
        // Iterate through the courses
        for (const exam of exams) {
            // Try wrapper to handle async exceptions
            try {
                // API Handler
                const res = await apiHandler(
                    undefined, // No body for GET request
                    'GET',
                    `api/exam/result/exam/${exam.examId}`,
                    `${BACKEND_API}`,
                    session?.user?.accessToken || undefined
                );

                // Handle errors
                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching exams:', res.error);
                    // setExams([]);
                } else {
                    // Convert object to array
                    let examResultsData = [];

                    // If res is an array, set coursesData to res
                    if (Array.isArray(res)) {
                        examResultsData = res;
                        // If res is an object, set coursesData to the values of the object
                    } else if (res && typeof res === 'object') {
                        // Use Object.entries() to get key-value pairs, then map to values
                        examResultsData = Object.entries(res)
                            .filter(([key, value]) =>
                                value !== undefined && value !== null)
                            .map(([key, value]) => value);
                        // If res is not an array or object, set coursesData to an empty array
                    } else {
                        examResultsData = [];
                    }

                    // Filter out invalid entries
                    examResultsData = examResultsData.filter(c => c && typeof c === 'object');

                    // examResultsData = examResultsData.map((grade: ExamExtended) => ({
                    //     ...grade,
                    //     courseName: courses.filter(course =>
                    //         course.courseId === grade.courseId)[0].courseName,
                    // }));
                    examResults.push(...examResultsData);
                    // console.log(`Processed exams data for course ${course.courseName}:`, examResultsData);
                    // Set courses to coursesData
                    // setExams(examsData);
                    // setFilter('all');
                    // console.log('Length of filter:', filteredExams.length);
                }
            } catch (e) {
                // Error fetching courses
                console.error('Error fetching exams:', e);
                // Set courses to empty array
                // setExams([]);
            } finally {
                // Set loading to false
                // setLoading(false);
            }
        }
        console.log('Exam Result fetched');
        console.log(examResults);

        setExamResults(examResults);
        setExamResultsLoading(false);

        // setExamsLoading(false);

    }

    // // Fetch Course
    // const fetchCourse = async (courseId: number) => {
    //     // API Handler call
    //     try {
    //         console.log(`Fetching course details for course: ${courseId}...`);
    //         // API Handler
    //         const res = await apiHandler(
    //             undefined,
    //             "GET",
    //             `api/course/${courseId}`,
    //             `${BACKEND_API}`,
    //             session?.user?.accessToken || undefined
    //         );
    //
    //         // Handle errors properly
    //         if (res instanceof Error || (res && res.error)) {
    //             // toast.error(res?.message || "Failed to fetch the course");
    //             console.error(res?.message || "Failed to fetch the course");
    //             setCourse(undefined);
    //         } else {
    //             // toast.success("Successfully fetched the course details!");
    //             console.log("Successfully fetched the course details!");
    //             // updateExam(undefined);
    //             console.log("Course fetch succeeded");
    //             console.log(res.toString());
    //
    //             // Convert response to Exam interface object
    //             const courseData: Course = {
    //                 courseName: res.course_name,
    //                 courseId: res.course_id,
    //                 courseProfessorId: res.course_professor_id,
    //                 courseYear: res.course_year,
    //                 courseQuarter: res.course_year,
    //                 courseSection: res.course_section,
    //             };
    //
    //             console.log('Processed course data:', courseData);
    //             console.log(courseData);
    //             // Set courses to coursesData
    //             setCourse(courseData);
    //             console.log('This is the course variable');
    //             console.log(course);
    //
    //         }
    //     } catch (error) {
    //         console.error('Error fetching course data', error as string);
    //         // toast.error("Course fetch failed");
    //     } finally {
    //         // Run the cancel/close callback
    //         // cancelAction();
    //     }
    // }

    // Load Exam Actions Modal
    const loadModalData = async (exam: ExamExtended, e: any) => {
        e.preventDefault();

        setExam(exam);
        setIsExamModalOpen(true); // Open modal immediately
        setIsModalLoading(true); // Show spinner inside modal

        try {
            // Load course data while modal is open
            // await fetchCourse(exam.courseId);
        } catch (error) {
            console.error('Failed to load course details:', error);
        } finally {
            setIsModalLoading(false); // Hide spinner when done
        }
    }

    return (
        <div className="px-4 pt-8 pb-1">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold mb-2">Exam Listing</h1>
                        < CreateExam />
                    </div>
                    {/*<h1 className="text-3xl font-bold mb-2">Exam Listing</h1>*/}
                    <p>Manage and view your created exams</p>
                </header>
                {/*Course filter buttons*/}
                <div className="rounded-xl shadow-sm p-6 pb-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Your Exams</h2>
                        {/*Default All courses button*/}
                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'all'
                                        ? `bg-crimson text-mentat-gold-700 focus-mentat`
                                        : 'bg-crimson text-mentat-gold hover:bg-crimson-700'
                                }`}
                                onClick={() => setFilter('all')}
                            >
                                All Exams
                            </button>
                            {/*Load the courses of instructor*/}
                            {!coursesLoading && courses.map((course) => (
                                <button
                                    key={course.courseId}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium
                                        transition-colors shadow-sm shadow-mentat-gold-700 ${
                                        filter === course.courseName
                                            ? 'bg-crimson text-mentat-gold-700 focus-mentat'
                                            : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}
                                                `}
                                    onClick={() => setFilter(course.courseName)}
                                >
                                    {course.courseName}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Line Divider */}
                <hr className="border-crimson border-2 mb-2"></hr>
                {/* Card Layout */}
                <div className="shadow-sm p-4 pt-2 max-h-[35vh] min-h-[200px]
                    overflow-y-auto scrollbar-hide"
                >
                    { filteredExams.length === 0 ? (
                        <div className="flex justify-center items-center pt-10">
                            <RingSpinner size={'sm'} color={'mentat-gold'} />
                            <p className="ml-3 text-md text-mentat-gold">Loading exams...</p>
                        </div>
                    ) : (
                        <React.Fragment>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <AnimatePresence>
                                    {filteredExams.map((examInst) => (
                                        <ExamCardSmall
                                            key={examInst.examId}
                                            exam={examInst}
                                            index={0}
                                            onclick={(e) => loadModalData(examInst, e)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredExams.length === 0 && (
                                <div className="text-center py-12">
                                    No exams found for the selected filter.
                                </div>
                            )}
                        </React.Fragment>
                    )}
                </div>
                {/*Exam Analysis Dashboard Component*/}
                { examResultsLoading ? (
                    <div className="flex justify-center items-center pt-10">
                        <RingSpinner size={'sm'} color={'mentat-gold'} />
                        <p className="ml-3 text-md text-mentat-gold">Loading exam results...</p>
                    </div>
                ) : examResults && (
                    <div className="rounded-xl shadow-sm px-4 pt-6 mb-1">
                        <h2 className="text-xl font-semibold mb-4">Exam Performance Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border bg-card-color
                                shadow-md shadow-crimson-700">
                                <h3 className="text-lg font-medium mb-2">Passed Student Exams</h3>
                                <p className="text-3xl font-bold">
                                    {examResults.filter(exam => exam.examScore === 'A'
                                        || exam.examScore === 'B'
                                        || exam.examScore === 'C').length}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border bg-card-color
                                shadow-md shadow-crimson-700">
                                <h3 className="text-lg font-medium mb-2">Failed Student Exams</h3>
                                <p className="text-3xl font-bold">
                                    {examResults.filter(exam => exam.examScore === 'D'
                                        || exam.examScore === 'F').length}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border bg-card-color
                                shadow-md shadow-crimson-700">
                                <h3 className="text-lg font-medium mb-2">Average Student Score</h3>
                                <p className="text-3xl font-bold">
                                    {examResults && examResults.filter(exam =>
                                        exam.examScore !== undefined).length > 0
                                        ? avgScore(examResults.filter(exam =>
                                            exam.examScore !== undefined)) : 0}
                                </p>

                                {/*{exams.filter(e => e.status === 'completed' && e.exam_score !== undefined).length > 0*/}
                                {/*    ? Math.round(exams.filter(e => e.status === 'completed' && e.score !== undefined)*/}
                                {/*            .reduce((acc, e) => acc + (e.score!/e.totalScore * 100), 0) /*/}
                                {/*        exams.filter(e => e.status === 'completed' && e.score !== undefined).length)*/}
                                {/*    : 0}%*/}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Exam Action Modal */}
            <Modal
                isOpen={isExamModalOpen}
                onClose={() => setIsExamModalOpen(false)}
                title="Modify Exam Details"
            >
                {isModalLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                        <RingSpinner />
                        <p className="mt-4 text-mentat-gold">Loading exam details...</p>
                    </div>
                ) : exam && (
                <ExamDetailsComponent
                    exam={exam}
                    cancelAction={() => {
                        setIsExamModalOpen(false);
                        // Trigger refresh when modal closes
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />)}
            </Modal>
        </div>
    );
};