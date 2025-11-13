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

/**
 * This hook will get fetch data from the backend
 * and contains the logic for fetching API information
 */
export const useFetchData = (userSession: any, BACKEND_API: string) => {
    // These are the hook states
    const [exams, setExams] = useState<Grade[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    /**
     * This will fetch all the exams that can be scheduled
     * @param id
     */
    const fetchExams = useCallback(async (id: string) => {
        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/exam/result/grades/${id}`,
                BACKEND_API,
                userSession.accessToken
            );

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching exams:', res.error);
                setExams([]);
            } else {
                const examsData = res?.exams || res || [];
                setExams(Array.isArray(examsData) ? examsData : [examsData]);
            }
        } catch (e) {
            console.error('Error fetching exams:', e);
            setExams([]);
        }
    }, [BACKEND_API, userSession.accessToken]);

    /**
     * Fetch Courses
     * Implementation for general API handler
     */
    const fetchCourses = useCallback(async () => {
        try {
            const res = await apiHandler(
                undefined,
                'GET',
                `api/course/enrollments/${userSession.id}`,
                BACKEND_API,
                userSession.accessToken
            );

            if (!(res instanceof Error) && !res?.error) {
                setCourses([...res]);
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        }
    }, [BACKEND_API, userSession.accessToken, userSession.id]);

    /**
     * Fetch Course and Exams together
     * This will call the both callbacks above
     * and controls the loading state
     */
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchExams(userSession.id),
                fetchCourses()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [fetchExams, fetchCourses, userSession.id]);

    // Return the states for handling in rendering
    return {
        exams,
        courses,
        loading,
        fetchAllData,
        setExams,
        setCourses,
        setLoading
    };
};