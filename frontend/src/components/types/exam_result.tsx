export default interface ExamResult {
    examResultId: number;
    examId: number;
    examStudentId: number;
    examVersion: number;
    examScheduledDate: string;
    examTakenDate?: string | undefined;
    examScore?: string | undefined;
}