"use client";

import React, { useEffect, useState } from "react";
import { GradeStrategy, StudentExams, StudentGrade, Report } from "@/app/reports/types/shared";
import { useSession } from "next-auth/react";
import Course from "@/components/types/course";
import Grade from "@/components/types/grade";
import StudentCourse from "@/components/types/student_course";
import { apiHandler } from "@/utils/api";
import StudentProgressCard from "@/app/reports/localComponents/StudentProgressCard";
import StudentAttentionCard from "@/app/reports/localComponents/StudentAttentionCard";
import StudentPerformingCard from "@/app/reports/localComponents/StudentPerformingCard";
import { RingSpinner } from "@/components/UI/Spinners";
import { useStudentProgressDeterminations } from "@/app/reports/hooks/useStudentProgressDeterminations";
import { motion } from "framer-motion";
import InstructorStatusChart from "@/app/reports/localComponents/InstructorStatusChart";
import InstructorStatisticsChart from "@/app/reports/localComponents/InstructorStatisticsChart";

interface InstructorExamStatisticsProps {
    course: Course | undefined;
    gradeStrategyNew: GradeStrategy | undefined;
}

/**
 * Instructor Exam Statistics Component
 * Shows instructors some insight into exam scheduling and student analysis
 */
export default function InstructorExamStatistics({course,
                                                 gradeStrategyNew}: InstructorExamStatisticsProps) {

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
    // State variables for Layout
    const [studentResults, setStudentResults] = useState<StudentExams[]>();
    const [examStats, setExamStats] = useState({
        passing: 0,
        failing: 0,
        averageScore: 0,
        totalStudents: 0
    });
    // Toggle states
    const [loading, setLoading] = useState(false);
    // Add this to track when gradeRequirements are ready
    const [gradeRequirementsReady, setGradeRequirementsReady] = useState(false);

    // This is the Backend Data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    // Student progress determination hooks
    const { passingStudents, failingStudents, isLoading: statusLoading } = useStudentProgressDeterminations({
        students: studentResults || [],
        course: course
    });

    // Mock data - Left in Exam stats as this component is not ready yet
    useEffect(() => {
        // Simulate API calls
        setExamStats({
            passing: 3,
            failing: 2,
            averageScore: 70.2,
            totalStudents: 5
        });

        setLoading(false);
    }, []);

    /**
     * useAffects for session hydration
     */
    useEffect(() => {
        let id = '';
        if (status !== 'authenticated' || !session) return;
        // Hydrate session information
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                accessToken: session?.user.accessToken || '',
            };

            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]);

    /**
     * Capture the student course information
     * based on the course selected
     */
    // Course-specific student course data
    useEffect(() => {
        console.log('Course change useEffect');
        if (!course || statusLoading || loading) return;

        const updateStudentExamData = async () => {
            console.log('Fetching students for course');
            // Fetch exams for this course
            await fetchStudents();
        };

        console.log(gradeRequirementsReady);

        updateStudentExamData();
    }, [course?.courseId, gradeRequirementsReady]);

    /**
     * Fetch Students based on course
     * Implementation for general API handler
     */
    async function fetchStudents() {
        console.log('Fetching data for instructor report page: Studen course data');
        setLoading(true);
        // Courses List
        let studentCoursesData: StudentCourse[] = [];
        // Student Exam list
        let studentData: StudentExams[] = [];

        if (course) {
            // Exception Wrapper for API handler
            try {
                console.log(course);
                const courseId = course.courseId
                // Iterate through the course Ids
                const res = await apiHandler(
                    undefined,
                    'GET',
                    `api/course/enrollments/course/${courseId}`,
                    `${BACKEND_API}`,
                    userSession.accessToken
                );
                console.log('Student Course API response');
                console.log(res);

                if (res instanceof Error || (res && res.error)) {
                    console.error('Error fetching student courses:', res.error);
                } else {
                    // Get all the courses
                    studentCoursesData = res.student_courses || res || []; // Once grabbed, it is gone
                    // setStudentCourses(studentCoursesData);
                }
                console.log('This is the student courses data:');
                console.log(studentCoursesData);

                const studentIds : Number[] = studentCoursesData
                    .filter((item) => item.studentId)
                    .map((item) => item.studentId);

                // Iterate through the student Ids
                for (const studentId of studentIds) {
                    console.log(`This is the student Id: ${studentId}`);
                    const examResults: StudentGrade[] = await fetchExamResults(studentId, courseId);
                    console.log(examResults);
                    if (examResults && examResults.length > 0) {
                        // Hydrate only the exam information
                        const exams: Grade[] =
                            examResults.map(
                                ({ examId, courseId, examDifficulty, examDuration, examName,
                                     examOnline, examRequired, examState, expirationDate,
                                     courseName, courseSection, courseYear, courseQuarter,
                                     courseProfessorId, examResultId, examStudentId, examVersion,
                                     examScheduledDate, examTakenDate, examScore}) =>
                                    ({ examId, courseId, examDifficulty, examDuration, examName,
                                        examOnline, examRequired, examState, expirationDate,
                                        courseName, courseSection, courseYear, courseQuarter,
                                        courseProfessorId, examResultId, examStudentId, examVersion,
                                        examScheduledDate, examTakenDate, examScore }));

                        console.log(exams);

                        // let studentItem: StudentExams;
                        // // Check for existing record
                        // const existing = studentData.find((item) =>
                        //     item.studentId === studentId);
                        // if (existing) {
                        //     studentItem = existing;
                        //     if (studentItem.exams && studentItem.exams.length > 0) {
                        //         studentItem.exams.push(...exams);
                        //     }
                        //     else studentItem.exams = exams;
                        //     studentItem.status = determineStudentStatus(studentItem.exams)
                        // }
                        // Check for existing record
                        const existingIndex = studentData.findIndex(item => item.studentId === studentId);

                        if (existingIndex >= 0) {
                            // Create new object without mutation
                            const existingStudent = studentData[existingIndex];
                            const allExams = [...(existingStudent.exams || []), ...exams];
                            // const status = await determineStudentStatus(allExams);

                            const updatedStudent = {
                                ...existingStudent,
                                exams: allExams,
                                // status: status
                            };

                            // Create new array
                            studentData = [
                                ...studentData.slice(0, existingIndex),
                                updatedStudent,
                                ...studentData.slice(existingIndex + 1)
                            ];
                        }
                        else {
                            // Get the first record for the user info (same in all records)
                            const studentRecord = examResults[0];
                            // const status = await determineStudentStatus(exams)
                            const existing = studentData.find((item) =>
                                 item.studentId === studentId);

                            const studentItem: StudentExams = {
                                studentId: studentId as number,
                                firstName: studentRecord.firstName,
                                lastName: studentRecord.lastName,
                                username: studentRecord.username,
                                email: studentRecord.email,
                                exams: exams,
                                status: existing?.status,
                            };
                            console.log(studentItem);
                            // studentData.push(studentItem);
                            studentData = [...studentData, studentItem];
                            console.log(studentData);
                        }
                        console.log('Reduced student results:', studentData);
                    }
                }
            } catch (error) {
                console.error('Error fetching student courses:', error as string);
            } finally {
                // if (studentData.length !== 0) {
                //     console.log('These are the student exam results:');
                //     console.log(studentData);
                //     setStudentResults(studentData);
                // }
                // // Empty result sets
                // else {
                //     // setExamResults([]);
                //     setStudentResults(studentData);
                // }
                console.log('These are the student exam results:');
                console.log(studentData);
                setStudentResults(studentData);
                setLoading(false);
            }
        }
    }

    /**
     * Fetch Courses
     * Implementation for general API handler
     */
    async function fetchExamResults(studentId: Number, courseId: Number) {
        console.log('Fetching data for instructor report page: Student Exam Results data');
        // setLoading(true);
        // Courses List
        let examResultsData: StudentGrade[] = [];
        // Exception Wrapper for API handler
        try {
            // Iterate through the course Ids
            const res = await apiHandler(
                undefined,
                'GET',
                `api/exam/result/instructor/${studentId}/course/${courseId}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );
            console.log('Student Exam Results API response');
            console.log(res);

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching student exam results:', res.error);
            } else {
                // Get all the courses
                examResultsData = res.grades || res || []; // Once grabbed, it is gone
                // setCourses(coursesData);
            }
            console.log('This is the student exam results data:');
            console.log(examResultsData);

        } catch (error) {
            console.error('Error fetching student exam results:', error as string);
        } finally {
            if (examResultsData.length !== 0) {
                const exams = examResultsData;
            }
            // if (examResultsData.length !== 0) {
            //     // Time to update states
            //     // First course retried as default
            //     setCourseFilter(coursesData[0].courseName);
            //     setCourse(coursesData[0]);
            //     setCourses(coursesData);
            // } else {
            //     setCourses([]);
            // }
            return examResultsData;
        }
    }

    return (
        <div className="space-y-6 mb-4">
            {/*Instructor Exam Summary Charts Components*/}
            <div className="text-mentat-gold overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium mb-4">Exam Performance Overview</h2>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex-1 w-1/2 min-w-[300px] min-h-[300px]">
                            {loading ? (
                                    <div className="flex justify-center items-center pt-6">
                                        <RingSpinner size={'sm'} color={'mentat-gold'} />
                                        <p className="ml-3 text-md text-mentat-gold">Generating Graph...</p>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-2 mb-2"
                                    >
                                        <InstructorStatusChart
                                            key={`grade-chart-${course?.courseId}-
                                                                ${userSession.id}`}
                                            data={studentResults}
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
                                ) : (
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        className="space-y-2 mb-2"
                                    >
                                        <InstructorStatisticsChart
                                            key={`progress-chart-${course?.courseId}`}
                                            students={studentResults}
                                            course={course}
                                        />
                                    </motion.div>
                                )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Performance by Grade Strategy */}
            {loading ? (
                <div className="flex justify-center items-center pt-6">
                    <RingSpinner size={'sm'} color={'mentat-gold'} />
                    <p className="ml-3 text-md text-mentat-gold">Analyzing student grades...</p>
                </div>
            ) : !studentResults || studentResults.length === 0 ? (
                <div className="text-center py-6 rounded-xl shadow-sm shadow-crimson-700 border
                    border-mentat-gold/40 mx-5"
                >
                    No student grades found
                </div>
            ) : studentResults && studentResults.length > 0 && (
                <React.Fragment>
                    {/*Student Progress Card*/}
                    <div className="bg-card-color overflow-hidden rounded-lg text-mentat-gold
                    shadow-sm shadow-crimson-700 mx-0.5">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium mb-4">
                                Student Performance by Grade Strategy
                            </h2>
                            <div className="space-y-4">
                                {studentResults.map(student => (
                                    <StudentProgressCard
                                        key={student.studentId}
                                        student={student}
                                        gradeStrategyNew={undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/*Student Performance Status Cards*/}
                    <div className="bg-card-color overflow-hidden rounded-lg text-mentat-gold
                     shadow-sm shadow-crimson-700 mx-0.5">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium mb-4">Student Performance Dashboard</h2>
                            {/* Failing Students Cards */}
                            {failingStudents && failingStudents.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                        <h3 className="text-md font-medium">
                                            Students Needing Attention ({failingStudents.length})
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {failingStudents.map((student => (
                                            <StudentAttentionCard
                                                key={`${student.studentId}-${student.status}`}
                                                student={student}
                                                gradeStrategyNew={undefined}
                                            />
                                        )))}
                                    </div>
                                </div>
                            )}
                            {/* Passing Students Cards */}
                            {passingStudents && passingStudents.length > 0 && (
                                <div>
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                        <h3 className="text-md font-medium">
                                            Students Performing Well ({passingStudents.length})
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {passingStudents.map((student => (
                                            <StudentPerformingCard
                                                key={`${student.studentId}-${student.status}`}
                                                student={student}
                                                gradeStrategyNew={undefined}
                                            />
                                        )))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </React.Fragment>
            )}
            {/* Additional Information Section */}
            {loading ? (
                    <div className="flex justify-center items-center pt-6">
                        <RingSpinner size={'sm'} color={'mentat-gold'} />
                        <p className="ml-3 text-md text-mentat-gold">Generating course statistics...</p>
                    </div>
            ) : !studentResults || studentResults.length === 0 ? (
                <div className="text-center py-6 rounded-xl shadow-sm shadow-crimson-700 border
                        border-mentat-gold/40 mx-5"
                >
                    No grade to generate statistics
                </div>
            ) : studentResults && studentResults.length > 0 && (
                <div className="bg-card-color overflow-hidden rounded-lg text-mentat-gold
                 shadow-sm shadow-crimson-700 mx-0.5">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium mb-4">Course Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card-color/10 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-mentat-gold/80">
                                    Most Challenging Topics
                                </h3>
                                <ul className="mt-2 text-sm text-green-600">
                                    <li className="flex justify-between">
                                        <span>Calculus</span>
                                        <span>68% avg</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Linear Algebra</span>
                                        <span>72% avg</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Probability</span>
                                        <span>75% avg</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-card-color/10 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-mentat-gold/80">
                                    Upcoming Assessments
                                </h3>
                                <ul className="mt-2 text-sm text-red-500">
                                    <li className="flex justify-between">
                                        <span>Quiz 3</span>
                                        <span>Nov 15</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Final Project</span>
                                        <span>Dec 5</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Final Exam</span>
                                        <span>Dec 12</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-card-color/10 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-mentat-gold/80">
                                    Student Engagement
                                </h3>
                                <ul className="mt-2 text-sm text-yellow-600">
                                    <li className="flex justify-between">
                                        <span>Assignment Completion</span>
                                        <span>92%</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Discussion Participation</span>
                                        <span>78%</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Office Hours Attendance</span>
                                        <span>45%</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}