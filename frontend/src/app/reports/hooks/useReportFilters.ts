/**
 * This component will be used to memoize
 * the exams, courses, grades, and gradeStrategy
 * according to a filter that is used to limit
 * the course being viewed. All logic associated
 * with the memos is included in here as well.
 * @author Joshua Summers
 */

import { useEffect, useMemo, useState } from 'react';
import Course from "@/components/types/course";
import Grade from "@/components/types/grade";
import { GradeRequirementsJSON, GradeStrategy, Report } from "@/app/reports/types/shared";
import GradeDetermination, { getGradeStatus } from "@/app/reports/utils/GradeDetermination";
import { allCourse } from "@/components/services/CourseSelector";

/**
 * This hook will contain the memoized states for the exams, courses
 * grade strategies, and grade calculations.
 * This also manages the filter states, which the memos depend on
 */
export const useReportFilters = (
    courses: Course[],
    selectedCourse: Course | undefined,
    // Simple function type match for state
    setSelectedCourse: (course: Course | ((prev: Course) => Course)) => void
) => {
    /**
     * Object states managed within the hook and exposed
     * to rendering pages
     */
    const [courseGrades, setCourseGrades] = useState<Report[]>([]);
    const [currentGrade, setCurrentGrade] = useState<String>('A');
    const [gradeStrategy, setGradeStrategy] = useState<GradeStrategy>();
    /**
     * Filter states managed within the hook and exposed
     * to rendering pages
     */
    const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'pending'>('all');
    const [courseFilter, setCourseFilter] = useState<string>(selectedCourse?.courseName ?? '');
    const [gradeFilter, setGradeFilter] = useState<'A' | 'B' | 'C' | 'D' | 'F'>('A');

    /**
     * This is the Memoized list of grades (exam_results)
     * that are filtered based on the exam status filter
     */
    const filteredGrades = useMemo(() => {
        if (!courseGrades || courseGrades.length === 0) return [];
        if (filter === 'all') return courseGrades;
        return courseGrades.filter(grade => getGradeStatus(grade as Grade) === filter);
    }, [courseGrades, filter]);

    /**
     * This is the Memoized list of courses
     * that are filtered based on the filer state and courses
     */
    const filteredCourse = useMemo(() => {
        if (!courses || courses.length === 0) return undefined;
        return courses.find(course => course.courseName === courseFilter);
    }, [courses, courseFilter]);

    /**
     * This is the Memoized grade strategy
     * this will filter the specific strategy based on gradeFilter
     */
    const filteredGradeStrategy = useMemo(() => {
        // Return null if there is no course or assigned strategy
        if (!filteredCourse || !filteredCourse?.gradeStrategy) return null;
        // Now let's get the strategy for the filtered grade
        try {
            const strategy: GradeRequirementsJSON = JSON.parse(filteredCourse.gradeStrategy);
            let selectedStrategy: GradeStrategy;

            switch (gradeFilter) {
                case 'A': selectedStrategy = strategy.GradeA; break;
                case 'B': selectedStrategy = strategy.GradeB; break;
                case 'C': selectedStrategy = strategy.GradeC; break;
                case 'D': selectedStrategy = strategy.GradeD; break;
                default: selectedStrategy = strategy.GradeF;
            }

            return {
                required: strategy.requiredExams,
                optional: strategy.optionalExams,
                strategy: selectedStrategy
            };
        } catch (error) {
            console.error('Error parsing grade strategy:', error);
            return null;
        }
    }, [filteredCourse?.courseId, gradeFilter]);

    /**
     * This is a utility function for loading new
     * grade strategy object
     * @param strategy
     */
    const loadGradeStrategy = (strategy: GradeStrategy) => {
        // Define the grade letter strategy
        let newStrategy: GradeStrategy = {
            total: strategy?.total || 0,
            requiredA: strategy?.requiredA || 0,
            optional: strategy?.optional || [],
            allOptional: strategy?.allOptional || false
        }
        // Return the new Grade Strategy
        return newStrategy;
    }

    /**
     * This is the Memoized grade requirements
     * this will transfer the details from JSON to object
     */
    const gradeRequirements = useMemo(() => {
        // Return null if there is no course or assigned strategy
        if (!filteredCourse || !filteredCourse?.gradeStrategy) return null;
        // Now let's get the strategy for the filtered grade
        try {
            const strategyJSON: GradeRequirementsJSON = JSON.parse(filteredCourse.gradeStrategy);
            return {
                A: loadGradeStrategy(strategyJSON.GradeA),
                B: loadGradeStrategy(strategyJSON.GradeB),
                C: loadGradeStrategy(strategyJSON.GradeC),
                D: loadGradeStrategy(strategyJSON.GradeD),
                F: loadGradeStrategy(strategyJSON.GradeF)
            };
        } catch (error) {
            console.error('Error calculating grade requirements:', error);
            return null;
        }
    }, [filteredCourse]);

    /**
     * This is the Memoized current calculated grade
     * this will store the calculated grade once for all components
     * to use
     */
    const calculatedCurrentGrade = useMemo(() => {
        // If we have grades to make a grade determination on
        if (gradeRequirements && filteredGrades && filteredGrades.length > 0)
            return GradeDetermination(filteredGrades, gradeRequirements);
        else if (!gradeRequirements && filteredGrades && filteredGrades.length > 0) {
            console.log('No Strategy Grade Determination');
            return GradeDetermination(filteredGrades);
        }
        // If neither of those exist, return F
        else return 'F'
    }, [filteredGrades, gradeRequirements, gradeFilter]);

    /**
     * This is the handler to update the active course
     * @param courseId
     */
    const updateCourseHandler = async (courseId: string) => {
        // Turn the string into an integer
        let courseIdInt = parseInt(courseId);
        // First case is the default All course
        if (courseIdInt === -1) {
            setCourseFilter('all')
            setSelectedCourse(allCourse);
        }
        // This is the new selected course
        else {
            let reduced = courses.find(course =>
                course.courseId === courseIdInt);
            // If that course exists
            if (reduced) {
                setCourseFilter(reduced.courseName);
                setSelectedCourse(reduced);
            }
        }
    }

    /**
     * This useEffect will update the grade strategy
     * state when the filteredGradeStrategy memo changes
     */
    useEffect(() => {
        if (filteredGradeStrategy) {
            console.log('Inside the filtered grade strategy useEffect');
            setGradeStrategy(filteredGradeStrategy.strategy);
        }
    }, [filteredGradeStrategy]);

    /**
     * This useEffect will update the current grade
     * state when the calculatedCurrentGrade memo changes
     */
    useEffect(() => {
        console.log('Calculate current grade:');
        console.log(calculatedCurrentGrade)
        setCurrentGrade(calculatedCurrentGrade);
    }, [calculatedCurrentGrade]);

    /**
     * Reset the filter to all and unset
     * the current course
     *
     * Reset action
     */
    const resetFilter = () => {
        setFilter('all');
        setSelectedCourse(allCourse);
    };

    // Return the states for handling in rendering
    return {
        // States
        filter,
        courseFilter,
        gradeFilter,
        currentGrade,
        gradeStrategy,
        courseGrades,

        // Actions
        setFilter,
        setGradeStrategy,
        setCourseFilter,
        setCurrentGrade,
        setGradeFilter,
        setCourseGrades,
        updateCourseHandler,
        resetFilter,

        // Memos
        filteredGrades,
        filteredCourse,
        filteredGradeStrategy,
        gradeRequirements,
        calculatedCurrentGrade
    };
};