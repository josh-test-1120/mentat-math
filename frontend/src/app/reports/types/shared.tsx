import Course from "@/components/types/course";
import ExamResult from "@/components/types/exam_result";
import User from "@/components/types/user";
import Grade from "@/components/types/grade";

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
    examStatus?: "active" | "inactive" | undefined;
}

export interface ExamAttempt extends Exam {
    attempts?: number | null | undefined;
    bestScore?: string | null | undefined;
}

export interface Report extends Exam, Course, ExamResult {
    status?: 'passed' | 'failed' | 'pending';
    attempts?: number | null | undefined;
    bestScore?: string | null | undefined;
}

export const StatusMap: Record<string, "pending" | "passed" | "failed" | undefined> = {
    "pending": "pending",
    "passed": "passed",
    "failed": "failed"
};

export interface ExamAndResult extends Exam, ExamResult {}

/**
 * Used by instructors to include the student information
 * alongside the exam result details for that student
 */
export interface StudentExams extends User {
    exams?: Grade[];
    status?: "passing" | "failing" | undefined;
}

export interface StudentGrade extends User, Grade {
    status?: 'passed' | 'failed' | 'pending';
}