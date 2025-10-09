'use client';

import React, {useState, useEffect, useMemo} from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { apiHandler } from "@/utils/api";
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion';
import { Exam, ExamProp, Course } from "@/components/types/exams";
import { getExamPropCourse, ExamCardSmall, getExamStatus, ExamExtended } from "@/components/UI/cards/ExamCards";
import CreateExam from "./localComponents/CreateExam";
import Modal from "@/components/services/Modal";
import ExamDetailsComponent from "@/components/UI/exams/ExamDetails";
import { RingSpinner } from "@/components/UI/Spinners";

// Status Counter
const statusScore = (exam: ExamProp) => {
    if (exam.exam_score == 'A') return 5;
    else if (exam.exam_score == 'B') return 4;
    else if (exam.exam_score == 'C') return 3;
    else if (exam.exam_score == 'D') return 2;
    else if (exam.exam_score == 'F') return 1;
    else return 0;
}

const avgScore = (exams: ExamProp[]) => {
    let counter = 0;
    exams.forEach((exam: ExamProp) => {
        if (exam.exam_score == 'A') counter += 5;
        else if (exam.exam_score == 'B') counter += 4;
        else if (exam.exam_score == 'C') counter += 3;
        else if (exam.exam_score == 'D') counter += 2;
        else if (exam.exam_score == 'F') counter += 1;
    });
    // Return the average
    return Math.round(counter / exams.length);
}

// Main Component
export default function ExamDashboard() {
    const {data: session, status} = useSession();
    const [exams, setExams] = useState<ExamProp[]>([]);
    const [exam, setExam] = useState<Exam>();
    const [course, setCourse] = useState<Course>();
    const [loading, setLoading] = useState(true);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [filter, setFilter] = useState<'all' | 'MATH260' | 'MATH330'>('all');

    // Fetch exams
    useEffect(() => {
        // If not authenticated, return
        if (status !== 'authenticated') return;
        // Get instructor ID
        const id = session?.user?.id?.toString();
        // If no instructor ID, return
        if (!id) return;

        // Fetch Exams
        fetchExams(id);

    }, [status, session, BACKEND_API, refreshTrigger]);

    const filteredExams = useMemo(() => {
        // First filter by class
        let result = filter === 'all'
            ? exams
            : exams.filter(exam => getExamPropCourse(exam) === filter);
        console.log('result of filter:', result);
        console.log('length of exams:', exams.length);

        return result;
    }, [filter, exams]);

    // Fetch exams
    const fetchExams = async (id: string) => {
        // Try wrapper to handle async exceptions
        try {
            // API Handler
            const res = await apiHandler(
                undefined, // No body for GET request
                'GET',
                `api/exams/instructor/${id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors
            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching exams:', res.error);
                setExams([]);
            } else {
                // Convert object to array
                let examsData = [];

                // If res is an array, set coursesData to res
                if (Array.isArray(res)) {
                    examsData = res;
                    // If res is an object, set coursesData to the values of the object
                } else if (res && typeof res === 'object') {
                    // Use Object.entries() to get key-value pairs, then map to values
                    examsData = Object.entries(res)
                        .filter(([key, value]) => value !== undefined && value !== null)
                        .map(([key, value]) => value);
                    // If res is not an array or object, set coursesData to an empty array
                } else {
                    examsData = [];
                }

                // Filter out invalid entries
                examsData = examsData.filter(c => c && typeof c === 'object');

                console.log('Processed exams data:', examsData);
                // Set courses to coursesData
                setExams(examsData);
                setFilter('all');
                console.log('Length of filter:', filteredExams.length);
            }
        } catch (e) {
            // Error fetching courses
            console.error('Error fetching exams:', e);
            // Set courses to empty array
            setExams([]);
        } finally {
            // Set loading to false
            setLoading(false);
        }
    }

    // Fetch Course
    const fetchCourse = async (courseId: number) => {
        // API Handler call
        try {
            console.log(`Fetching course details for course: ${courseId}...`);
            // API Handler
            const res = await apiHandler(
                undefined,
                "GET",
                `api/course/${courseId}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                // toast.error(res?.message || "Failed to fetch the course");
                console.error(res?.message || "Failed to fetch the course");
                setCourse(undefined);
            } else {
                // toast.success("Successfully fetched the course details!");
                console.log("Successfully fetched the course details!");
                // updateExam(undefined);
                console.log("Course fetch succeeded");
                console.log(res.toString());

                // Convert response to Exam interface object
                const courseData: Course = {
                    course_name: res.course_name,
                    course_id: res.course_id,
                    course_professor_id: res.course_professor_id,
                    course_year: res.course_year,
                    course_quarter: res.course_year,
                    course_section: res.course_section
                };

                console.log('Processed course data:', courseData);
                console.log(courseData);
                // Set courses to coursesData
                setCourse(courseData);
                console.log('This is the course variable');
                console.log(course);

            }
        } catch (error) {
            console.error('Error fetching course data', error as string);
            // toast.error("Course fetch failed");
        } finally {
            // Run the cancel/close callback
            // cancelAction();
        }
    }

    // Load Exam Actions Modal
    const loadModalData = async (exam: ExamExtended, e: any) => {
        e.preventDefault();

        // Set basic data and open modal immediately
        const examData: Exam = {
            exam_id: exam.exam_id,
            exam_name: exam.exam_name,
            exam_course_id: exam.exam_course_id,
            exam_difficulty: exam.exam_difficulty,
            exam_required: exam.exam_required,
            exam_duration: exam.exam_duration || "1",
            exam_state: exam.exam_state,
            exam_online: exam.exam_online
        }

        setExam(examData);
        setIsExamModalOpen(true); // Open modal immediately
        setIsModalLoading(true); // Show spinner inside modal

        try {
            // Load course data while modal is open
            await fetchCourse(exam.exam_course_id);
        } catch (error) {
            console.error('Failed to load course details:', error);
        } finally {
            setIsModalLoading(false); // Hide spinner when done
        }
    }

    const splitCourseExam = async (examResult: ExamExtended) => {
        // Split the data into an exam only detail
        const exam: Exam = {
            exam_id: examResult.exam_id,
            exam_state: examResult.exam_state,
            exam_required: examResult.exam_required,
            exam_difficulty: examResult.exam_difficulty,
            exam_name: examResult.exam_name,
            exam_course_id: examResult.exam_course_id,
            exam_duration: examResult.exam_duration || "1",
            exam_online: examResult.exam_online || 0
        };
        exam.status = getExamStatus(exam as ExamExtended);
        setExam(exam);
        // Get and set the course
        await fetchCourse(exam.exam_course_id)

        // const course: Course = {
        //     course_id: examResult.exam_course_id,
        //     course_name: examResult.exam_course_name,
        //     course_year: examResult.
        // };
        // exam.status = getExamStatus(exam)
    }

    if (status !== 'authenticated')
        return <div className="p-6 text-mentat-gold-700">Please sign in.</div>;
    if (loading)
        return <div className="p-6 text-mentat-gold-700">Loading...</div>;

    return (
        <div className="bg-gradient-to-br">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold mb-2">Exam Listing</h1>
                        < CreateExam />
                    </div>
                    {/*<h1 className="text-3xl font-bold mb-2">Exam Listing</h1>*/}
                    <p>Manage and view your created exams</p>
                </header>

                <div className="rounded-xl shadow-sm p-6 pb-2">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Your Exams</h2>
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
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'MATH260'
                                        ? `bg-crimson text-mentat-gold-700 focus-mentat`
                                        : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                onClick={() => setFilter('MATH260')}
                            >
                                MATH260
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filter === 'MATH330'
                                        ? `bg-crimson text-mentat-gold-700 focus-mentat`
                                        : 'bg-crimson text-mentat-gold hover:bg-crimson-700'}`}
                                onClick={() => setFilter('MATH330')}
                            >
                                MATH330
                            </button>
                        </div>
                    </div>
                </div>
                {/* Line Divider */}
                <hr className="border-crimson border-2 mb-2"></hr>
                {/* Card Layout */}
                <div className="shadow-sm p-4 pt-2 max-h-[60vh] min-h-[200px]
                    overflow-y-auto scrollbar-hide"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredExams.map((examInst) => (
                                <ExamCardSmall
                                    key={examInst.exam_id}
                                    exam={examInst as ExamExtended}
                                    index={0}
                                    onclick={(e) => loadModalData(examInst as ExamExtended, e)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredExams.length === 0 && (
                        <div className="text-center py-12">
                            No exams found for the selected filter.
                        </div>
                    )}

                    <div className="rounded-xl shadow-sm pt-6 mb-1">
                        <h2 className="text-xl font-semibold mb-4">Exam Performance Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border bg-card-color
                                shadow-md shadow-crimson-700">
                                <h3 className="text-lg font-medium mb-2">Passed Student Exams</h3>
                                <p className="text-3xl font-bold">
                                    {exams.filter(exam => exam.status === 'active').length}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border bg-card-color
                                shadow-md shadow-crimson-700">
                                <h3 className="text-lg font-medium mb-2">Failed Student Exams</h3>
                                <p className="text-3xl font-bold">
                                    {exams.filter(exam => exam.status === 'inactive').length}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border bg-card-color
                                shadow-md shadow-crimson-700">
                                <h3 className="text-lg font-medium mb-2">Average Student Score</h3>
                                <p className="text-3xl font-bold">
                                    {exams.filter(exam => exam.status === 'active'
                                        && exam.exam_score !== undefined).length > 0
                                        ? avgScore(exams) : 0}

                                    {/*{exams.filter(e => e.status === 'completed' && e.exam_score !== undefined).length > 0*/}
                                    {/*    ? Math.round(exams.filter(e => e.status === 'completed' && e.score !== undefined)*/}
                                    {/*            .reduce((acc, e) => acc + (e.score!/e.totalScore * 100), 0) /*/}
                                    {/*        exams.filter(e => e.status === 'completed' && e.score !== undefined).length)*/}
                                    {/*    : 0}%*/}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
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
                ) : (
                <ExamDetailsComponent
                    exam={exam}
                    course={course}
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