/**
 * These are the defaults for Report objects. These can be used as return objects
 * for an empty class, but with some details populated.
 * These are used in the report table generation, for presenting
 * exams that have yet to be scheduled
 * @author Joshua Summers
 */

import {GradeRequirements, GradeStrategy, StatusMap} from './shared'

export const examRequiredDefault = (name: string, course: string) => {
    console.log(`This is the course name: ${course}`);
    return {
        examName: name,
        examRequired: 1,
        examDuration: 1,
        examDifficulty: 0,
        examScore: undefined,
        courseName: course,
        examVersion: 1,
        examId: -99,
        status: StatusMap['pending'],
        examScheduledDate: new Date(),
        courseId: -99,
        examOnline: 0,
        examState: 1,
        examResultId: 1,
        examStudentId: 1,
        courseProfessorId: 1,
        courseQuarter: '',
        courseSection: '',
        courseYear: 2025
    };
};

export const examOptionalDefault =
    (name: string, course: string, optionalRequired: GradeStrategy) => {
    return {
        examName: name,
        examRequired: optionalRequired.optional.includes(name) ? 1 : 0,
        examDuration: 1,
        examDifficulty: 0,
        examScore: undefined,
        courseName: course,
        examVersion: 1,
        examId: -99,
        courseId: -99,
        status: StatusMap['pending'],
        examScheduledDate: new Date(),
        examOnline: 0,
        examState: 1,
        examResultId: 1,
        examStudentId: 1,
        courseProfessorId: 1,
        courseQuarter: '',
        courseSection: '',
        courseYear: 2025
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