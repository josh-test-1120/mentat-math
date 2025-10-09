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

export interface Exam extends ExamResult{
    examId: number;
    courseId: number;
    examDifficulty: number;
    examDuration: number;
    examName: String;
    examOnline: number;
    examRequired: number;
    examState: number;
    status?: 'active' | 'inactive';
}

export interface ExamAttempt extends Exam {
    attempts?: number | null | undefined;
    bestScore?: string | null | undefined;
}

interface ExamResultComplete extends Exam {
    exam_version: number;
    exam_difficulty: number;
    exam_duration: number;
}

export interface Report extends ExamResultComplete {
    course_name: string;
    exam_online?: number;
}