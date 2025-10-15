export default interface ExamResult {
    examResultId: number;
    examId: number;
    examStudentId: number;
    examVersion: number;
    examScheduledDate: Date;
    examTakenDate?: Date | undefined;
    examScore?: string | undefined;
}