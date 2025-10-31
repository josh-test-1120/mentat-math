import ExamResult from "@/components/types/exam_result";

export interface ExamResultExtended extends ExamResult {
    examName: string;
    examState: number;
    examRequired: number;
    examOnline: number;
    examDifficulty: number;
    examDuration: number;
    courseId: number;
    courseName?: string;
    status?: 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending'
}

/**
 * Grade Strategy types and interfaces
 */
export type GradeRequirements = Record<'F' | 'D' | 'C' | 'B' | 'A', {
    total: number;
    requiredA: number;
    optional: String[];
    allOptional: Boolean;
}>;

export type GradeRequirementsJSON = {
    requiredExams: string[];
    optionalExams: string[];
} & Record<'GradeF' | 'GradeD' | 'GradeC' | 'GradeB' | 'GradeA', {
    total: number;
    requiredA: number;
    optional: string[];
    allOptional: boolean;
}>;

export interface GradeStrategy {
    optional : String[];
    allOptional: Boolean;
    total: number;
    requiredA: number;
}

export interface CourseStrategy {
    totalExams: number
    requiredExams: String[];
    optionalExams: String[];
    GradeA: GradeStrategy,
    'GradeA-': GradeStrategy,
    'GradeB+': GradeStrategy,
    GradeB: GradeStrategy,
    'GradeB-': GradeStrategy,
    'GradeC+': GradeStrategy,
    GradeC: GradeStrategy,
    GradeD: GradeStrategy,
    GradeF: GradeStrategy,
}