export default interface TestWindow {
    testWindowId: number;
    testStartTime: string;
    testEndTime: string;
    testWindowCreatedDatetime: Date;
    testWindowStartDate?: Date;
    testWindowEndDate?: Date;
    courseId: number;
    description?: string;
    testWindowTitle: string;
    weekDays: string[];
    exceptions: string[];
    isActive: number;
}