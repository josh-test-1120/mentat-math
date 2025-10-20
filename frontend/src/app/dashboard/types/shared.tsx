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