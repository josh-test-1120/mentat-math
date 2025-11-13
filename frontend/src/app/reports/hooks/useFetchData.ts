/**
 * This component will be used to handle backend API
 * data handling. This will handle fetch calls for the
 * data hydration inside the page
 * @author Joshua Summers
 */

import { useState, useCallback } from 'react';
import { apiHandler } from "@/utils/api";
import Course from "@/components/types/course";
import Grade from "@/components/types/grade";
import { getGradeStatus } from "@/app/reports/utils/GradeDetermination";
import { Report } from "@/app/reports/types/shared"
import Exam from "@/components/types/exam";
import { allCourse } from "@/components/services/CourseSelector";

/**
 * This hook will get fetch data from the backend
 * and contains the logic for fetching API information
 */
export const useFetchData = (userSession: any, BACKEND_API: string) => {
    /**
     * Object states managed within the hook and exposed
     * to rendering pages
     */
    const [grades, setGrades] = useState<Report[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course>(allCourse);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch Grades
     * Implementation for general API handler
     */
    const fetchGrades = useCallback(async () => {
        // Exam results we collect
        let examsRaw: Report[] = [];

        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/exam/result/grades/${userSession.id}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching grades:', res.error);
            } else {
                // Get all the grades
                examsRaw = res.grades || res || []; // Once grabbed, it is gone
                // Ensure each grade has a proper status
                examsRaw = examsRaw.map(grade => ({
                    ...grade,
                    status: getGradeStatus(grade as Grade)
                }));
            }
        } catch (error) {
            console.error('Error fetching student grades:', error as string);
        } finally {
            setGrades(Array.isArray(examsRaw) ? examsRaw : [examsRaw]);
            // return for immediate usage in next function (state updates as async)
            return examsRaw;
        }
    },[BACKEND_API, userSession.accessToken, userSession.id]);

    /**
     * Fetch Courses
     * Implementation for general API handler
     */
    const fetchCourses = useCallback(async (exams: Report[]) => {
        // Determine courses based on exams
        let courseIdList = exams.reduce((unique: string[], grade) => {
            const courseId = grade.courseId;
            if (courseId && !unique.includes(courseId.toString())) {
                unique.push(courseId.toString());
            }
            return unique;
        }, []);
        // Courses List
        let coursesData: Course[] = [];
        // Iterate through the course id list
        for (const courseId of courseIdList) {
            try {
                const res = await apiHandler(
                    undefined,
                    'GET',
                    `api/course/${courseId}`,
                    `${BACKEND_API}`,
                    userSession.accessToken
                );

                if (!(res instanceof Error) && !res?.error) {
                    coursesData.push(res);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
            finally {
                setCourses(coursesData);
                // Time to update default course (first fetched and shown in list)
                if (coursesData.length !== 0) setSelectedCourse(coursesData[0]);
            }
        }

    }, [BACKEND_API, userSession.accessToken]);

    /**
     * Fetch Exams
     * Implementation for general API handler
     */
    const fetchExams = useCallback(async (course: Course) => {
        // Try - Catch Handler
        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/exam/course/${course.courseId}`,
                `${BACKEND_API}`,
                userSession.accessToken
            );

            if (res instanceof Error || (res && res.error)) {
                console.error(`Error fetching exams for course: ${course?.courseId}`, res.error);
                // We could have no exams for this course, so we set to empty when no results
                setExams([]);
            } else {
                const examsData = res?.exams || res || [];
                setExams(Array.isArray(examsData) ? examsData : [examsData]);
            }
        } catch (e) {
            console.error(`Error fetching exams for course: ${course?.courseId}`, e);
            setExams([]);
        }
    }, [BACKEND_API, userSession.accessToken])

    /**
     * Fetch Grades, Courses, and Exams together
     * This will call the three callbacks above
     * and controls the loading state
     */
    const fetchAllData = useCallback(async () => {
        // Update the loading state
        setLoading(true);
        try {
            const gradesData = await fetchGrades();
            await fetchCourses(gradesData);

        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            // Update the loading state
            setLoading(false);
        }
    }, [fetchExams, fetchCourses, userSession.id]);

    // Return the states for handling in rendering
    return {
        // States
        grades,
        exams,
        courses,
        selectedCourse,
        loading,
        // Setters
        setGrades,
        setExams,
        setCourses,
        setSelectedCourse,
        setLoading,
        // Functions
        fetchAllData,
        fetchExams,
    };
};