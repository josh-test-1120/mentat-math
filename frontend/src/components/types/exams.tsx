export interface Exam {
    exam_id: number;
    exam_name: string;
    exam_course_id: number;
    exam_difficulty: number;
    exam_required: number;
    exam_duration: string;
    exam_state: number;
    exam_online: number;
    status?: 'active' | 'inactive';
}

export interface ExamResult {
    exam_id: number;
    exam_name: String;
    exam_course_id: number;
    exam_required: number;
    exam_scheduled_date: string;
    exam_taken_date?: string | undefined;
    exam_score?: string | undefined;
    status: 'passed' | 'failed' | 'pending' | undefined;
}

export interface ExamProper {
    exam_id: number;
    exam_name: string;
    exam_state: number;
    exam_course_id: string;
    exam_difficulty: number;
    exam_required: number;
    exam_scheduled_date: string;
    exam_version: number;
    exam_taken_date: string;
    exam_course_name: string;
    location: string;
    status: 'active' | 'inactive';
    exam_score?: string;
    exam_hour?: number;
    exam_minutes?: number;
}

export interface ExamProp {
    exam_id: number;
    exam_name: string;
    exam_state: number;
    exam_course_id: number;
    exam_difficulty: number;
    exam_required: number;
    exam_scheduled_date: string;
    exam_version: number;
    exam_taken_date: string;
    exam_course_name: string;
    exam_result_id: number;
    location: string;
    status: 'active' | 'inactive';
    exam_score?: string;
    exam_hour: number;
    exam_online: number;
    exam_minutes?: number;
    exam_duration?: string;
}

export interface Course {
    course_id: string;
    course_name: string;
    course_professor_id: string;
    course_year: string;
    course_quarter: string;
    course_section: string;
}

export interface Class {
    id: string;
    name: string;
    grade: string;
    teacher: string;
}