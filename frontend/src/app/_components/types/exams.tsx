export interface Exam {
    id: string;
    name: string;
    course: string;
    difficulty: number;
    date: string;
    version: number;
    duration: string;
    type: string;
    location: string;
    status: 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending';
    score?: string;
}

export interface ExamProp {
    exam_id: string;
    exam_name: string;
    exam_course_id: string;
    exam_difficulty: number;
    exam_required: number;
    exam_scheduled_date: string;
    exam_version: number;
    exam_taken_date: string;
    course: string;
    location: string;
    status: 'completed' | 'upcoming' | 'missing' | 'canceled' | 'pending';
    score?: string;
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