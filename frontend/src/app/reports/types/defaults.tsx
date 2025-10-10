/**
 * These are the defaults for Report objects. These can be used as return objects
 * for an empty class, but with some details populated.
 * These are used in the report table generation, for presenting
 * exams that have yet to be scheduled
 * @author Joshua Summers
 */

import {GradeRequirements, GradeStrategy, StatusMap} from './shared'

export const examRequiredDefault = (name: String, course: String) => {
    console.log(`This is the course name: ${course}`);
    return {
        examName: name,
        examRequired: 1,
        examDuration: 1,
        examDifficulty: 0,
        exam_score: undefined,
        course_name: course,
        exam_version: 1,
        exam_id: -99,
        exam_course_id: -99,
        status: StatusMap['pending'],
        exam_scheduled_date: '',
        exam_difficulty: 0,
        exam_duration: 1,
        examId: -99,
        courseId: -99,
        examOnline: 0,
        examState: 1,
        exam_name: name,
        exam_required: 1
    };
};

export const examOptionalDefault =
    (name: String, course: String, optionalRequired: GradeStrategy) => {
    return {
        examName: name,
        examRequired: optionalRequired.optional.includes(name) ? 1 : 0,
        examDuration: 1,
        examDifficulty: 0,
        exam_score: undefined,
        course_name: course,
        exam_version: 1,
        exam_id: -99,
        exam_course_id: -99,
        status: StatusMap['pending'],
        exam_scheduled_date: '',
        exam_difficulty: 0,
        exam_duration: 1,
        examId: -99,
        courseId: -99,
        examOnline: 0,
        examState: 1,
        exam_name: name,
        exam_required: optionalRequired.optional.includes(name) ? 1 : 0
    };
};

// Empty requirements state
export const emptyStrategy: GradeRequirements = {
    A: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    B: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    C: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    D: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    F: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
};