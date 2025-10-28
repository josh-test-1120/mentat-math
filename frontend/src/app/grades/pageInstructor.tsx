'use client';

import React, {useState, useEffect, useMemo} from "react";
import "react-toastify/dist/ReactToastify.css";
import { apiHandler } from "@/utils/api";
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion';
import Course from "@/components/types/course";
import { ExamCardSmall } from "@/app/grades/localComponents/ExamCards";
import CreateExam from "./localComponents/CreateExam";
import Modal from "@/components/services/Modal";
import ExamDetailsComponent from "@/app/grades/localComponents/ExamDetails";
import { RingSpinner } from "@/components/UI/Spinners";
import { ExamExtended } from "@/app/grades/util/types";
import ExamResult from "@/components/types/exam_result";
import { allCourse, CourseSelector } from "@/components/services/CourseSelector";
import {ExamStatistics} from "@/app/grades/localComponents/ExamStatistics";

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
    const [courses, setCourses] = useState<Course[]>([]);
    const [exam, setExam] = useState<ExamExtended>();
    const [course, setCourse] = useState<Course>();
    const [loading, setLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(true);
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

    }, [status, session, BACKEND_API, refreshTrigger]);

    useEffect(() => {
        if (!courses) return;
        if (courses && courses.length > 0) fetchExams();
    }, [courses]);

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
        setCoursesLoading(true);
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
    const fetchExams = async () => {
        setLoading(true);
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

    // Handle Course Updates from Course Selector Components
    const updateCourseHandle = async (courseId: string) => {
        // Turn the string into an integer
        let courseIdInt = parseInt(courseId);
        // First case is the default All course
        if (courseIdInt === -1) {
            setFilter('all')
            setCourse(allCourse);
        }
        // This is the
        else {
            let reduced = courses.find(course =>
                course.courseId === courseIdInt);
            console.log(reduced);
            if (reduced) {
                setFilter(reduced.courseName);
                setCourse(reduced);
            }
        }
    }

    return (
        <div className="px-4 pt-8 pb-1">
            <div className="max-w-5xl mx-auto">
                {/*Create Exam Component*/}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold mb-2">Exam Listing</h1>
                        < CreateExam
                            course={course}
                            onExamCreated={() =>
                                setRefreshTrigger(prev => prev + 1)
                            }
                        />
                    </div>
                    {/*<h1 className="text-3xl font-bold mb-2">Exam Listing</h1>*/}
                    <p>Manage and view your created exams</p>
                </header>
                {/*Course filter buttons*/}
                <div className="rounded-xl shadow-sm p-6 pb-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Your Exams</h2>
                        {/*Course Selector Component*/}
                        { courses && courses.length > 0 && (
                            <CourseSelector
                                courses={courses}
                                selectedCourseId={course?.courseId}
                                onCourseChange={(e) => {
                                    updateCourseHandle(e.target.value);
                                    console.log(filter);
                                }}
                                allDefault={true}
                            />
                        )}
                    </div>
                </div>
                {/* Line Divider */}
                <hr className="border-crimson border-2 mb-2"></hr>
                {/* Card Layout */}
                <div className="shadow-sm p-4 pt-2 max-h-[36vh] min-h-[200px]
                    overflow-y-auto scrollbar-hide"
                >
                    {loading ? (
                        <div className="flex justify-center items-center pt-10">
                            <RingSpinner size={'sm'} color={'mentat-gold'} />
                            <p className="ml-3 text-md text-mentat-gold">Loading Exams...</p>
                        </div>
                        ) : filteredExams && filteredExams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {filteredExams.map((examInst) => (
                                    <ExamCardSmall
                                        key={examInst.examId}
                                        exam={{...examInst, exam_duration: "1"} as ExamExtended}
                                        index={0}
                                        onclick={(e) =>
                                            loadModalData({...examInst, exam_duration: "1"} as ExamExtended, e)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            No exams exist for this instructor
                        </div>
                    )}

                </div>
                {/* Line Divider */}
                <hr className="border-crimson border-2 my-2"></hr>
                {/*Exam Analysis Dashboard Component*/}
                <ExamStatistics
                    exams={filteredExams}
                    index={0}
                />
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
                    updateAction={() => {
                        setIsExamModalOpen(false);
                        // Trigger refresh when modal closes
                        setRefreshTrigger(prev => prev + 1);
                    }}
                    cancelAction={() => {
                        setIsExamModalOpen(false);
                        // Trigger refresh when modal closes
                        // setRefreshTrigger(prev => prev + 1);
                    }}
                />)}
            </Modal>
        </div>
    );
};