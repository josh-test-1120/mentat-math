import { ExamResult } from "@/components/types/exams";

/**
 * Define some types and interfaces for the reports and report charts
 */
export type GradeRequirements = Record<'F' | 'D' | 'C' | 'B' | 'A', {
    total: number;
    requiredA: number;
    optional: String[];
    allOptional: Boolean;
}>;

export type GradeRequirementsJSON = Record<'GradeF' | 'GradeD' | 'GradeC' | 'GradeB' | 'GradeA', {
    total: number;
    requiredA: number;
    optional: String[];
    allOptional: Boolean;
}>;

export interface GradeStrategy {
    optional : String[];
    allOptional: Boolean;
    total: number;
    requiredA: number;
}

export interface CourseStrategy {
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

export interface ExamAttempt extends ExamResult {
    attempts?: number | null | undefined;
    bestScore?: string | null | undefined;
}