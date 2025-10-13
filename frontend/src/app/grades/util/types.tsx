import Exam from "@/components/types/exam";


export interface ExamResult extends Exam {
    status?: 'active' | 'inactive';
}

export interface ExamExtended extends ExamResult {
    courseName?: string;
}