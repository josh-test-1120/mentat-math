/**
 * This component will be used to memoize
 * the exams and courses according to a filter
 * that is used to limit the course being viewed
 * @author Joshua Summers
 */

import {useMemo, useState} from 'react';
import Course from "@/components/types/course";
import Grade from "@/components/types/grade";
import { getExamPropCourse, getExamPropStatus } from "@/app/schedule/localComponents/ExamCard";

// These are the valid statuses for showing scheduled exams
const ValidStatus = ['pending', 'upcoming', 'missing'];

/**
 * This hook will contain the memoized states for the exams
 * and courses that are filtered based on the filter state
 */
export const useExamFilters = (
    exams: Grade[],
    courses: Course[],
    validStatus: string[] = ValidStatus
) => {
    /**
     * Filter states managed within the hook and exposed
     * to rendering pages
     */
    const [filter, setFilter] = useState<'all' | string>('all');
    const [selectedCourse, setSelectedCourse] = useState<Course>();
    /**
     * This is the Memoized list of exams
     * that are filtered based on the filter state and exams
     */
    const filteredExams = useMemo(() => {
        let result = filter === 'all'
            ? exams
            : exams.filter(exam => getExamPropCourse(exam) === filter);

        return result.filter(exam => validStatus.includes(getExamPropStatus(exam)));
    }, [filter, exams, validStatus]);
    /**
     * This is the Memoized list of courses
     * that are filtered based on the filer state and courses
     */
    const filteredCourses = useMemo(() => {
        if (!courses) return [];

        return filter === 'all'
            ? courses
            : courses.filter(course => course.courseName === filter);
    }, [filter, courses]);

    /**
     * This is the handler to update the active course
     * @param courseId
     */
    const updateCourseHandler = (courseId: string) => {
        const courseIdInt = parseInt(courseId);

        if (courseIdInt === -1) {
            setFilter('all');
            setSelectedCourse(undefined);
        } else {
            const course = courses.find(c => c.courseId === courseIdInt);
            if (course) {
                setFilter(course.courseName);
                setSelectedCourse(course);
            }
        }
    };

    /**
     * Reset the filter to all and unset
     * the current course
     *
     * Reset action
     */
    const resetFilter = () => {
        setFilter('all');
        setSelectedCourse(undefined);
    };

    // Return the states for handling in rendering
    return {
        // States
        filter,
        selectedCourse,

        // Actions
        setFilter,
        setSelectedCourse,
        updateCourseHandler,
        resetFilter,

        // Memos
        filteredExams,
        filteredCourses
    };
};