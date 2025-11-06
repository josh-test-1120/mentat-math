"use client";

import React, {useEffect, useState} from "react";
import {GradeStrategy, StudentExams, StudentGrade} from "@/app/reports/types/shared";
import { useSession } from "next-auth/react";
import Course from "@/components/types/course";
import Grade from "@/components/types/grade";
import StudentCourse from "@/components/types/student_course";
import { apiHandler } from "@/utils/api";

interface InstructorExamStatisticsProps {
    courses: Course[] | undefined;
    gradeStrategyNew: GradeStrategy | undefined;
}

/**
 * Instructor Exam Statistics Component
 * Shows instructors some insight into exam scheduling and student analysis
 */
export default function InstructorExamStatistics({courses,
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
    const [examResults, setExamResults] = useState<Grade[]>([]);
    const [examStats, setExamStats] = useState({
        passing: 0,
        failing: 0,
        averageScore: 0,
        totalStudents: 0
    });
    // Toggle states
    const [loading, setLoading] = useState(true);

    // This is the Backend Data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    // Grade strategy visualization
    const gradeStrategy = {
        F: { min: 0, max: 59, color: 'bg-red-500' },
        D: { min: 60, max: 69, color: 'bg-orange-500' },
        C: { min: 70, max: 79, color: 'bg-yellow-500' },
        B: { min: 80, max: 89, color: 'bg-blue-500' },
        A: { min: 90, max: 100, color: 'bg-green-500' },
    };

    // Mock data - in a real app, this would come from API calls
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
        if (!courses?.[0] || loading) return;

        const updateStudentExamData = async () => {
            console.log('Fetching students for course');
            // Fetch exams for this course
            await fetchStudents();
        };

        updateStudentExamData();
    }, [courses?.[0]?.courseId, loading]);

    // useEffect(() => {
    //     if (studentResults) {
    //         console.log('Updating student results');
    //     }
    //
    // }, [studentResults]);

    // Get failing students (priority for dashboard)
    const failingStudents = studentResults &&
        studentResults.filter(student => {
            let results: any[];
            student.exams && student.exams.length > 0
                ? results = student.exams.filter((exam) =>
                    exam.status === 'failed')
                : results = [];
            return results;
        });

    const passingStudents = studentResults &&
        studentResults.filter(student => {
        let results: any[];
        student.exams && student.exams.length > 0
            ? results = student.exams.filter((exam) =>
                exam.status === 'passed')
            : results = [];
        return results;
    });

    /**
     * Fetch Students based on course
     * Implementation for general API handler
     */
    async function fetchStudents() {
        console.log('Fetching data for instructor report page: Studen course data');
        // setLoading(true);
        // Courses List
        let studentCoursesData: StudentCourse[] = [];
        let studentExamResultsData: Grade[] = [];
        let studentData: StudentExams[] = [];

        if (courses) {
            // Exception Wrapper for API handler
            try {
                for (const course of courses) {
                    console.log(course);
                    // Iterate through the course Ids
                    const res = await apiHandler(
                        undefined,
                        'GET',
                        `api/course/enrollments/course/${course.courseId}`,
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
                        const examResults: StudentGrade[] = await fetchExamResults(studentId);
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
                            // // Push the exams to the list
                            // studentExamResultsData.push(...exams);

                            let studentItem: StudentExams;
                            // Check for existing record
                            const existing = studentData.find((item) =>
                                item.studentId === studentId);
                            if (existing) {
                                studentItem = existing;
                                if (studentItem.exams && studentItem.exams.length > 0) {
                                    studentItem.exams.push(...exams);
                                }
                                else studentItem.exams = exams;
                            }
                            else {
                                // Get the first record for the user info (same in all records)
                                const studentRecord = examResults[0];
                                studentItem = {
                                    studentId: studentId as number,
                                    firstName: studentRecord.firstName,
                                    lastName: studentRecord.lastName,
                                    username: studentRecord.username,
                                    email: studentRecord.email,
                                    exams: exams
                                };
                                console.log(studentItem);
                                studentData.push(studentItem);
                                console.log(studentData);
                            }
                            console.log('Reduced student results:', studentData);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching student courses:', error as string);
            } finally {
                if (studentData.length !== 0) {
                    // Time to update states
                    // First course retried as default
                    // setCourseFilter(coursesData[0].courseName);
                    // setSelectedCourse(coursesData[0]);
                    // setCourses(coursesData);
                    // console.log('These are the student exam results:');
                    // console.log(studentExamResultsData);
                    console.log('These are the student exam results:');
                    console.log(studentData);
                    setExamResults(studentExamResultsData);
                    setStudentResults(studentData);
                }
            }
        }
    }

    /**
     * Fetch Courses
     * Implementation for general API handler
     */
    async function fetchExamResults(studentId: Number) {
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
                `api/exam/result/instructor/${studentId}`,
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
        <div className="space-y-6">
            {/* Exam Statistics Chart */}
            <div className="text-mentat-gold overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium mb-4">Exam Performance Overview</h2>
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/2 p-4">
                            <div className="flex items-center justify-center h-64">
                                {/* Pie Chart - would be replaced with actual chart library */}
                                <div className="relative w-48 h-48 rounded-full bg-gray-200">
                                    <div
                                        className="absolute top-0 left-0 w-full h-full rounded-full bg-green-500"
                                        style={{
                                            clipPath: `inset(0 0 0 50%)`
                                        }}
                                    ></div>
                                    <div
                                        className="absolute top-0 left-0 w-full h-full rounded-full bg-red-500"
                                        style={{
                                            clipPath: `inset(0 0 0 50%)`,
                                            transform: `rotate(${(examStats.passing / examStats.totalStudents) * 360}deg)`
                                        }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <span className="block text-2xl font-bold">{examStats.passing}/{examStats.totalStudents}</span>
                                            <span className="block text-sm">Passing</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2 p-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium">Passing Rate</h3>
                                    <p className="text-2xl font-semibold">
                                        {((examStats.passing / examStats.totalStudents) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium">Average Score</h3>
                                    <p className="text-2xl font-semibold">{examStats.averageScore}%</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-card-color p-3 rounded-lg">
                                        <p className="text-sm font-medium">Passing</p>
                                        <p className="text-2xl font-bold text-green-600">{examStats.passing}</p>
                                    </div>
                                    <div className="bg-card-color p-3 rounded-lg">
                                        <p className="text-sm font-medium">Failing</p>
                                        <p className="text-2xl font-bold text-red-600">{examStats.failing}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Performance by Grade Strategy */}
            {studentResults && (
                <div className="bg-card-color overflow-hidden shadow rounded-lg text-mentat-gold
                shadow-sm shadow-crimson-700">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium mb-4">
                            Student Performance by Grade Strategy
                        </h2>
                        <div className="space-y-4">
                            {studentResults.map(student => {
                                // Determine which grade bracket the student falls into
                                let currentGrade = 'F';
                                for (const [grade, range] of Object.entries(gradeStrategy)) {
                                    if (student.examScore >= range.min && student.examScore <= range.max) {
                                        currentGrade = grade;
                                        break;
                                    }
                                }

                                return (
                                    <div
                                        key={student.studentId}
                                        className="border border-mentat-gold/20 rounded-lg p-4
                                        bg-card-color/10"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium">
                                                {student.firstName} {student.lastName}
                                            </h3>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                student.status === 'passed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {student.status === 'passed' ? 'Passing' : 'Failing'}
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
                                                {Object.entries(gradeStrategy).map(([grade, data]) => (
                                                    <div
                                                        key={grade}
                                                        className={`${data.color} relative flex-1`}
                                                    >
                                                        {currentGrade === grade && (
                                                            <div
                                                                className="absolute -top-1 transform -translate-x-1/2
                                                                w-0 h-0 border-l-4 border-r-4 border-b-4 border-b-black
                                                                border-transparent"
                                                                style={{ left: `${((student.examScore - data.min) /
                                                                        (data.max - data.min)) * 100}%` }}
                                                            ></div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>Current: {student.examScore}% ({currentGrade})</span>
                                            </div>
                                        </div>

                                        {/* Exam scores */}
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            {student.exams && student.exams.map(exam => (
                                                <div
                                                    key={`${exam.examId}-${exam.examName}-${exam.examVersion}`}
                                                    className="text-xs"
                                                >
                                                    <span className="font-medium">
                                                        {exam.examName}:
                                                    </span>
                                                    {exam.examScore}/{exam.maxScore}
                                                    ({((exam.examScore / exam.maxScore) * 100)
                                                    .toFixed(1)}%)
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}


            {/* Student Dashboard - Failing Students Highlighted */}
            <div className="bg-card-color overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium mb-4">Student Performance Dashboard</h2>

                    {/* Failing Students Section */}
                    {failingStudents && failingStudents.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center mb-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <h3 className="text-md font-medium">
                                    Students Needing Attention ({failingStudents.length})
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {failingStudents.map(student => (
                                    <div key={student.studentId} className="border border-mentat-gold/20
                                         rounded-lg bg-card-color/10 p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">
                                                    {student.firstName} {student.lastName}
                                                </h4>
                                                <p className="text-sm">
                                                    Current Grade: <span className="font-medium text-red-600">
                                                        {student.grade}%</span>
                                                </p>
                                            </div>
                                            <button className="text-sm bg-white border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded">
                                                Contact
                                            </button>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-xs text-mentat-gold/40 mb-1">Exam Performance:</p>
                                            <div className="space-y-1">
                                                {student.exams && student.exams.map(exam => (
                                                    <div
                                                        key={`${exam.examId}-${exam.examName}-${exam.examVersion}`}
                                                        className="flex justify-between text-xs"
                                                    >
                                                        <span>{exam.examName}</span>
                                                        <span className={exam.examScore < 70
                                                            ? 'text-red-600 font-medium' : ''}
                                                        >
                                                                {exam.examScore}/{exam.maxScore}
                                                            </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Passing Students Section */}
                    {passingStudents && passingStudents.length > 0 && (
                        <div>
                            <div className="flex items-center mb-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <h3 className="text-md font-medium">Students Performing Well ({passingStudents.length})</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {passingStudents.map(student => (
                                    <div key={student.studentId}
                                         className="border border-mentat-gold/20 rounded-lg p-4 bg-card-color/10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">
                                                    {student.firstName} {student.lastName}
                                                </h4>
                                                <p className="text-sm">
                                                    Current Grade: <span className="font-medium text-green-600">
                                                        {student.grade}%</span>
                                                </p>
                                            </div>
                                            <button className="text-sm bg-white border border-green-300
                                                text-green-600 hover:bg-green-50 px-3 py-1 rounded">
                                                Message
                                            </button>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-xs text-mentat-gold/40 mb-1">Exam Performance:</p>
                                            <div className="space-y-1">
                                                {student.exams && student.exams.map(exam => (
                                                    <div
                                                        key={`${exam.examId}-${exam.examName}-${exam.examVersion}`}
                                                        className="flex justify-between text-xs"
                                                    >
                                                        <span>{exam.examName}</span>
                                                        <span className={exam.examScore >= 90
                                                            ? 'text-green-600 font-medium' : ''}
                                                        >
                                                                {exam.examScore}/{exam.maxScore}
                                                            </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-card-color overflow-hidden shadow rounded-lg">
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
        </div>
    );
}