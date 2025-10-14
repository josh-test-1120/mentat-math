import Exam from "@/components/types/exam";
import Course from "@/components/types/course";
import ExamResult from "@/components/types/exam_result";

export interface ExamStatus extends Exam {
    status?: 'active' | 'inactive';
}

export interface ExamExtended extends ExamStatus {
    courseName?: string;
}

export interface Grade extends Exam, Course, ExamResult {
    status?: 'passed' | 'failed' | 'pending';
}

export interface GradeCardExtendedProps {
    grade: Grade;
    index: number;
    onclick?: (e: any) => void;
}