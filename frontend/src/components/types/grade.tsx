import Course from "@/components/types/course";
import ExamResult from "@/components/types/exam_result";
import Exam from "@/components/types/exam";

export default interface Grade extends Exam, Course, ExamResult {
    status?: 'passed' | 'failed' | 'pending';
}