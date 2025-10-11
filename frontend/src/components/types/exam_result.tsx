export default interface ExamResult {
    exam_result_id: number;
    exam_id: number;
    exam_course_id: number;
    exam_student_id: number;
    exam_version: number;
    exam_scheduled_date: string;
    exam_taken_date?: string | undefined;
    exam_score?: string | undefined;
}