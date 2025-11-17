/**
 * This component will be used to handle backend API
 * data handling. This will handle fetch calls for the
 * data hydration inside the page
 * @author Joshua Summers
 */

import { useState, useEffect, useMemo } from 'react';
import { apiHandler } from "@/utils/api";
import Course from "@/components/types/course";
import {StudentGrade} from "@/app/grades/types/shared";
import StudentCourse from "@/components/types/student_course";
import User from "@/components/types/user";
import { allCourse } from "@/components/services/CourseSelector";
import { toast } from "react-toastify";

/**
 * Interface for representing students
 * enrolled in a course(s)
 */
interface StudentDetails {
    studentId: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    courses: StudentCourse[];
}

/**
 * Interface for representing students
 * enrolled in a course along with
 * detailed user information
 */
interface StudentEnrolled extends User, StudentCourse {}

/**
 * For use in Adjust Grade component
 *
 * This hook will get fetch data from the backend
 * and contains the logic for fetching API information
 * @param userSession
 * @param BACKEND_API
 * @param courses
 * @param course
 */
export const useAdjustFetchData =
    (userSession: any,
     BACKEND_API: string,
     courses: Course[] | undefined,
     course: Course | undefined
     ) => {
    // These are the hook states
    const [studentResults, setStudentResults] = useState<StudentDetails[]>();
    const [studentExams, setStudentExams] = useState<StudentGrade[]>();
    const [studentLoading, setStudentLoading] = useState(false);
    const [examResultLoading, setExamResultLoading] = useState(false);
    const [studentsFetchError, setStudentsFetchError] = useState<string | null>(null);
    const [studentExamsError, setStudentExamsError] = useState<string | null>(null);
    // Form data state
    const [formData, setFormData] = useState({
        // For display in selects
        studentName: "",
        examName: "",
        // For the actual payload
        studentId: null as number | null,
        examResultId: null as number | null,
        // Score field
        examScore: ""
    });
    // Form variable mapping
    const { studentName, examName, studentId, examResultId, examScore } = formData;
    // Modify action state
    const [isAdjusting, setIsAdjusting] = useState(false);

    // Do not include the All courses course if selected
    if (course && course.courseId === allCourse.courseId) course = undefined;

    /**
     * UseEffect for hydrating exams when student
     * changes
     */
    useEffect(() => {
        console.log(`Student Id: ${studentId}`);
        // Exit if studentId not ready
        if (!studentId) return;

        // Wrapper for async function
        const fetchData = async () => {
            try {
                await fetchExamResults(studentId);
            } catch (error) {
                console.error('Error fetching Student Exams:', error);
            }
        };
        fetchData();
    }, [studentId]);

    /**
     * Form Validation memoized state
     */
    const isFormValid = useMemo(() => {
        return studentName !== '' && examResultId !== null;
    }, [studentName, examResultId]); // Recalculates when these dependencies change

    /**
     * Fetch Students based on course
     * Implementation for general API handler
     */
    async function fetchStudents() {
        console.log('Fetching data for instructor adjust grade component: Get Students');
        setStudentLoading(true);
        // Define and collect the courseIds
        let courseIdList : Number[] = []
        if (course) courseIdList = [course.courseId]
        else if (courses) courseIdList = courses
            .filter((item) => item.courseId)
            .map((item) => item.courseId)
            .reduce((unique: number[], id: number) => {
                return unique.includes(id) ? unique : [...unique, id];
            }, []);

        // Courses List
        let studentCoursesData: StudentEnrolled[] = [];
        // Student Exam list
        let studentData: StudentDetails[] = [];
        // Exception Wrapper for API handler
        try {
            for (const courseId of courseIdList) {
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
                    const studentCourseData = res.student_courses || res || []; // Once grabbed, it is gone
                    console.log('This is the student courses data:');
                    console.log(studentCourseData);

                    studentCoursesData.push(...studentCourseData)
                }
            }
            console.log(studentCoursesData);
            // Reduce the student courses into a single student with multiple courses
            const studentMap = studentCoursesData
                .reduce((map, current) => {
                    if (!map.has(current.studentId)) {
                        map.set(current.studentId, {
                            studentId: current.studentId,
                            firstName: current.firstName,
                            lastName: current.lastName,
                            username: current.username,
                            email: current.email,
                            courses: []
                        });
                    }

                    const student = map.get(current.studentId);
                    student!.courses.push({
                        courseId: current.courseId,
                        studentId: current.studentId,
                        studentDateRegistered: current.studentDateRegistered,
                        studentCourseGrade: current.studentCourseGrade
                    });

                    return map;
                }, new Map<number, StudentDetails>());
            // Update the student data array
            studentData = Array.from(studentMap.values());
        // Handle errors
        } catch (error) {
            console.error('Error fetching student courses:', error as string);
            setStudentsFetchError(error as string || 'Failed to fetch courses');
        // Cleanup after processing
        } finally {
            // Set the initial form data to the first student and their first exam
            if (studentData.length !== 0) {
                // Get the first student record
                const firstStudent = studentData[0];
                // Update the form data
                setFormData(prev => ({
                    ...prev,
                    studentId: firstStudent.studentId,
                    studentName: `${firstStudent.firstName} ${firstStudent.lastName}`,
                }));
            }
            console.log('These are the student exam results:');
            console.log(studentData);
            // Update the student results
            setStudentResults(studentData);
            setStudentLoading(false);
        }
    }

    /**
     * Fetch examResults from the backend
     */
    async function fetchExamResults(studentId: Number) {
        console.log('Fetching data for instructor adjust grade component: Student Exam Results data');
        // Set the exam loading status
        setExamResultLoading(true);

        const studentWithCourses = studentResults?.find((item) =>
            item.studentId === studentId);
        let courseIdList: StudentCourse[] | undefined = studentWithCourses?.courses;

        // Courses List
        let examResultsData: StudentGrade[] = [];
        // Exception Wrapper for API handler
        try {
            if (courseIdList)
                for (const course of courseIdList) {
                    // Get the course Id
                    const courseid = course.courseId;
                    // Iterate through the course Ids
                    const res = await apiHandler(
                        undefined,
                        'GET',
                        `api/exam/result/instructor/${studentId}/course/${courseid}`,
                        `${BACKEND_API}`,
                        userSession.accessToken
                    );
                    console.log('Student Exam Results API response');
                    console.log(res);

                    if (res instanceof Error || (res && res.error)) {
                        console.error('Error fetching student exam results:', res.error);
                    } else {
                        // Get all the courses
                        let examResultsLocal: StudentGrade[] = res.grades || res || []; // Once grabbed, it is gone

                        // Reduce the exams to those that have been taken
                        examResultsLocal = examResultsLocal.filter((exam) =>
                            exam.examTakenDate !== null);

                        examResultsData.push(...examResultsLocal);
                    }
                    console.log('This is the student exam results data:');
                    console.log(examResultsData);
                }
        } catch (error) {
            console.error('Error fetching student exam results:', error as string);
            setStudentExamsError(error as string || 'Failed to fetch student exams');
        } finally {
            if (examResultsData.length !== 0) {
                const firstExam = examResultsData[0];
                // Update the form data
                setFormData(prev => ({
                    ...prev,
                    examResultId: firstExam?.examResultId || null,
                    examName: firstExam?.examName || "",
                    examScore: firstExam?.examScore || "",
                }));
            }
            setStudentExams(examResultsData);
            setExamResultLoading(false);
        }
    }

    /**
     * Update the state information from the form when changed
     * @param e
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Update the form state
        setFormData(prevFormData => {
            // For student select - update both display name and ID
            if (name === 'studentId') {
                const selectedStudent = studentResults?.find(student =>
                    student.studentId === parseInt(value));
                return {
                    ...prevFormData,
                    studentId: value ? parseInt(value) : null,
                    studentName: selectedStudent ?
                        `${selectedStudent.firstName} ${selectedStudent.lastName}` : ""
                };
            }
            // For exam select - update both display name and ID
            if (name === 'examResultId') {
                const selectedExam = studentExams?.find(exam =>
                    exam.examResultId === parseInt(value));
                return {
                    ...prevFormData,
                    examResultId: value ? parseInt(value) : null,
                    examName: selectedExam?.examName || "",
                    examScore: selectedExam?.examScore || ""
                };
            }
            // All other fields
            return {
                ...prevFormData,
                [name]: value
            };
        });
    };

    /**
     * Patch handler for sending data
     * to backend API
     */
    const submitPatch = async () => {
        // Update create state
        setIsAdjusting(true);

        // Try wrapper to handle async exceptions
        try {
            // Validate student name field
            if (!studentName || studentName.trim() === '') {
                toast.error("Student Name is required");
                return;
            }
            // Validate exam result Id fields
            if (!examResultId) {
                toast.error("Please select a student exam result");
                return;
            }
            // Validate that exam result Id is a number and positive
            if (isNaN(examResultId) || examResultId < 0) {
                toast.error("Invalid student exam result selection");
                return;
            }
            // Gernerate the payload
            const payload: any = { examScore: examScore };
            // Call backend API
            const response = await apiHandler(
                payload,
                'PATCH',
                `api/exam/result/${examResultId}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );
            console.log(`This is the response:`);
            console.log(response);
            // Response handler
            if (response?.error) {
                toast.error(response.message || "Failed to adjust student exam grade");
            } else {
                toast.success("Student exam grade adjusted successfully");
            }
            // Error handler
        } catch (error) {
            toast.error("Failed to adjust Student exam grade");
        }
            // Cleanup after processing
        finally {
            // Update create state
            setIsAdjusting(false);
            // Reset the exam score field, but retan the previous values
            setFormData((prev) => {
                return {
                    ...prev,
                    examScore: ''
                }
            })
        }
    };

    // Return the states for handling in rendering
    return {
        studentResults,
        studentExams,
        studentLoading,
        examResultLoading,
        studentsFetchError,
        studentExamsError,
        formData,
        setFormData,
        studentName,
        examName,
        studentId,
        examResultId,
        examScore,
        isAdjusting,
        isFormValid,
        setIsAdjusting,
        submitPatch,
        handleChange,
        fetchStudents
    };
}