import { CourseStrategy } from "@/app/dashboard/types/shared";

// Empty requirements state
export const emptyGradeStrategy: CourseStrategy = {
    totalExams: 0,
    requiredExams: [],
    optionalExams: [],
    GradeA: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    'GradeA-': {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    'GradeB+': {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    GradeB: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    'GradeB-': {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    'GradeC+': {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    GradeC: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    GradeD: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
    GradeF: {
        total: 0,
        requiredA: 0,
        optional: [],
        allOptional: false
    },
};