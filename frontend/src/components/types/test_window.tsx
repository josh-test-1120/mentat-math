export default interface TestWindow {
    testWindowId: number;
    testStartTime: string;
    testEndTime: string;
    testWindowCreatedDatetime: string;
    testWindowStartDate?: string;
    testWindowEndDate?: string;
    courseId: number;
    description?: string;
    testWindowTitle: string;
    weekDays: string[];
    exceptions: string[];
    isActive: number;
}