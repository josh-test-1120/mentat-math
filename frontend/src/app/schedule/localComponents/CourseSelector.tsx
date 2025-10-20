import React from 'react';
import { Course } from '../hooks/useTestWindowData';

interface CourseSelectorProps {
    courses: Course[];
    selectedCourseId: number | null | undefined;
    onCourseChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    testWindowsCount?: number;
}

/**
 * Default course for listing all
 */
export const allCourse: Course = {
    courseId: -1,
    courseName: 'All Courses',
    courseProfessorId: -1,
    courseQuarter: 'Default',
    courseSection: '',
    courseYear: -1
}

/**
 * Course selection component
 */
export const CourseSelector: React.FC<CourseSelectorProps> = ({
    courses,
    selectedCourseId,
    onCourseChange,
    testWindowsCount
}) => {



    return (
        <div className="flex items-center gap-3">
            <label htmlFor="course-select" className="text-sm font-medium text-mentat-gold">
                Select Course:
            </label>
            <select
                id="course-select"
                value={selectedCourseId || ''}
                onChange={onCourseChange}
                className="px-3 py-2 bg-white/5 text-mentat-gold border border-mentat-gold/20 rounded-md focus:border-mentat-gold/60 focus:ring-0 focus:outline-none"
            >
                <option key={allCourse.courseId} value={allCourse.courseId}>
                    {allCourse.courseName} - {allCourse.courseSection} ({allCourse.courseQuarter})
                </option>
                {courses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                        {course.courseName} - {course.courseSection} ({course.courseQuarter} {course.courseYear})
                    </option>
                ))}
            </select>
            {selectedCourseId && testWindowsCount && testWindowsCount > 0 && (
                <span className="text-xs text-mentat-gold/70">
                    {testWindowsCount} test window{testWindowsCount !== 1 ? 's' : ''} found
                </span>
            )}
        </div>
    );
};
