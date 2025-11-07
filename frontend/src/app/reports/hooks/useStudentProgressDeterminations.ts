// hooks/useStudentStatusCategorization.ts
import { useMemo } from 'react';
import Course from "@/components/types/course";
import { Report, StudentExams } from "@/app/reports/types/shared";
import { useGradeCalculations } from "@/app/reports/hooks/useGradeCalculations";
import GradeDetermination from "@/app/reports/utils/GradeDetermination";

interface useStudentProgressDeterminationsParams {
    students: StudentExams[];
    course?: Course | undefined
}

export const useStudentProgressDeterminations =
    ({students, course}: useStudentProgressDeterminationsParams) => {

    // Parent pages only need gradeRequirements for student progress classification
    const { gradeRequirements, isLoading } = useGradeCalculations({
        filteredCourses: [course],
        filteredGrades: undefined,
    });

    const determineStudentStatus =
        (exams: Report[] | undefined): "passing" | "failing" | undefined => {
            if (exams && exams.length > 0) {
                // Safe check for exams existence and content
                const hasValidGrades = exams && exams.length > 0;
                let currentGrade = 'F';
                // Grade Strategy determinations
                if (gradeRequirements && hasValidGrades) {
                    currentGrade = GradeDetermination(exams, gradeRequirements);
                // No grade strategy
                } else if (!gradeRequirements && hasValidGrades) {
                    currentGrade = GradeDetermination(exams);
                }
                // Make a determination based on grades
                switch (currentGrade) {
                    case 'A':
                    case 'B':
                    case 'C':
                        return 'passing'
                    case 'D':
                    case 'F':
                        return 'failing'
                }
            }
            // No exams to parse
            else return undefined;
        }

    // Memoized constants for passing and failing students
    const { passingStudents, failingStudents } = useMemo(() => {
        // If nothing was passed into hook
        if (!students || !gradeRequirements) {
            return { passingStudents: [], failingStudents: [] };
        }
        // Default empty arrays
        const passing: StudentExams[] = [];
        const failing: StudentExams[] = [];
        // Map each student and store into passing or failing based on status
        students.forEach(student => {
            if (student.exams && student.exams.length > 0) {
                const status = determineStudentStatus(student?.exams);
                // Add to student record
                student.status = status;
                if (status === 'passing') {
                    passing.push(student);
                } else if (status === 'failing') {
                    failing.push(student);
                }
            }
        });

        return { passingStudents: passing, failingStudents: failing };
    }, [students, gradeRequirements]);

    return {
        passingStudents,
        failingStudents,
        isLoading
    };
};