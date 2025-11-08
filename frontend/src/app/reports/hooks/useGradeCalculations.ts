/**
 * This is a hook for managing shared grade strategy access
 * This can be used separately within components, or shared
 * for access to the grade strategy and grade determination
 * @author Joshua Summers
 */

import { useMemo, useState, useEffect } from 'react';
import GradeDetermination from "@/app/reports/utils/GradeDetermination";
import { GradeRequirements, GradeRequirementsJSON, GradeStrategy } from "@/app/reports/types/shared";

interface useGradeCalculationsParams {
    filteredCourses?: any[];
    filteredGrades?: any[];
}

/**
 * Custom hook for making grade determinations
 * Handles loading the grade strategy and serializing the details
 * Loading states are handled for this as well, to signal when
 * the grade strategy is ready
 */
export const useGradeCalculations = ({
                                         filteredCourses,
                                         filteredGrades
                                     }: useGradeCalculationsParams) => {
    const [isLoading, setIsLoading] = useState(true);

    // Helper function with better undefined handling
    const loadGradeStrategy = (strategy?: GradeStrategy): GradeStrategy => {
        if (!strategy) {
            return {
                total: 0,
                requiredA: 0,
                optional: [],
                allOptional: false
            };
        }

        return {
            total: strategy?.total ?? 0,
            requiredA: strategy?.requiredA ?? 0,
            optional: strategy?.optional ?? [],
            allOptional: strategy?.allOptional ?? false
        };
    };

    // Memoized grade requirements calculation with safe access
    const gradeRequirements = useMemo(() => {
        const firstCourse = filteredCourses?.[0];
        if (!firstCourse?.gradeStrategy) {
            console.log('No grade strategy found in filtered courses');
            return null;
        }
        // Try wrapper
        try {
            const strategyJSON: GradeRequirementsJSON = JSON.parse(firstCourse.gradeStrategy);

            const requirements: GradeRequirements = {
                A: loadGradeStrategy(strategyJSON.GradeA),
                B: loadGradeStrategy(strategyJSON.GradeB),
                C: loadGradeStrategy(strategyJSON.GradeC),
                D: loadGradeStrategy(strategyJSON.GradeD),
                F: loadGradeStrategy(strategyJSON.GradeF)
            };

            console.log('gradeRequirements calculated successfully');
            return requirements;
        } catch (error) {
            console.error('Error parsing grade requirements:', error);
            return null;
        }
    }, [filteredCourses]);

    // Memoized current grade calculation with safe access
    const calculatedCurrentGrade = useMemo(() => {
        console.log('Calculating current grade...');
        console.log('gradeRequirements:', gradeRequirements);
        console.log('filteredGrades:', filteredGrades);
        console.log('filteredGrades length:', filteredGrades?.length);

        // Safe check for filteredGrades existence and content
        const hasValidGrades = filteredGrades && filteredGrades.length > 0;

        if (gradeRequirements && hasValidGrades) {
            return GradeDetermination(filteredGrades, gradeRequirements);
        } else if (!gradeRequirements && hasValidGrades) {
            console.log('No Strategy Grade Determination');
            return GradeDetermination(filteredGrades);
        } else {
            console.log('No valid grades found, returning default F');
            return 'F';
        }
    }, [filteredGrades, gradeRequirements]);

    // Effect to track when calculations are complete
    useEffect(() => {
        console.log('useGradeCalculations loading state update:', {
            hasGradeRequirements: !!gradeRequirements,
            hasFilteredCourses: !!filteredCourses?.length,
            hasFilteredGrades: !!filteredGrades?.length
        });

        // Boolean state for grade Requirement being ready
        const calculationsComplete = gradeRequirements !== undefined;

        if (calculationsComplete && isLoading) {
            console.log('useGradeCalculations loading complete');
            setIsLoading(false);
        } else if (!calculationsComplete && !isLoading) {
            console.log('useGradeCalculations loading started');
            setIsLoading(true);
        }
    }, [gradeRequirements, filteredCourses, filteredGrades, isLoading]);

    return {
        gradeRequirements,
        calculatedCurrentGrade,
        isLoading
    };
};