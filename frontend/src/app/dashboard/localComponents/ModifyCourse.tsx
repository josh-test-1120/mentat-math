'use client'

import React, {useEffect, useState} from 'react';
import { useSession } from "next-auth/react";
import { apiHandler } from "@/utils/api";
import { toast } from "react-toastify";
import Course from "@/components/types/course";

interface ModifyCourseComponentProps {
    course: Course | undefined
    cancelAction: () => void
    updateAction: () => void
}

/**
 * This is the Modify course action component, which will show the
 * Course details, and allow updates to the course details
 * to take place
 * @param examResult
 * @param cancelAction
 * @param updateAction
 * @constructor
 * @author Joshua Summers
 */
export default function ModifyCourseComponent({ course,
                                                 cancelAction, updateAction } : ModifyCourseComponentProps) {
    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;
    // Course Form state
    const [courseData, setCourseData] = useState({
        courseId: course?.courseId,
        courseName: course?.courseName ?? '',
        courseProfessorId: `${course?.courseProfessorId ?? ''}`,
        courseQuarter: `${course?.courseQuarter ?? ''}`,
        courseSection: `${course?.courseSection ?? ''}`,
        courseYear: `${course?.courseYear ?? ''}`,
        gradeStrategy: `${course?.gradeStrategy ?? ''}`,
    });

    // These are the session state variables
    const { data: session, status } = useSession();
    // Session user information
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: '',
        accessToken: '',
    });

    /**
     * useAffects that bind the page to refreshes and updates
     */
    // Page and Session Hydration
    useEffect(() => {
        if (status !== "authenticated") return;
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                accessToken: session?.user.accessToken || ''
            };

            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]); // Added status to dependencies

    /**
     * This is the modify course result action handler
     * @param event
     */
    const handleUpdate = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        console.log(course);

        if (courseData) {
            // Prepare the payload for the PATCH request
            const updatePayload: any = {
                courseId: courseData.courseId,
                courseName: courseData.courseName,
                courseProfessorId: courseData.courseProfessorId,
                courseQuarter: courseData.courseQuarter,
                courseSection: courseData.courseSection,
                courseYear: courseData.courseYear,
                gradeStrategy: courseData.gradeStrategy
            };

            // API Handler call
            try {
                console.log("Modifying Course");
                console.log(session);
                // API Handler
                const res = await apiHandler(
                    updatePayload,
                    "PATCH",
                    `api/course/${course?.courseId}`,
                    `${BACKEND_API}`,
                    userSession.accessToken || undefined
                );

                // Handle errors properly
                if (res instanceof Error || (res && res.error)) {
                    toast.error(res?.message || "Failed to modify the course");
                } else {
                    toast.success("Successfully modified the course!");
                    console.log("Course Modification Succeeded.");
                    console.log(res.toString());
                }
            } catch (e) {
                toast.error("Course Modification Failed");
            } finally {
                // Run the cancel/close callback
                updateAction();
            }
        }
        else {
            toast.error('No valid course is assigned');
        }
    }

    /**
     * This is the delete course result action handler
     * @param event
     */
    const handleDelete = async (event: React.FormEvent) => {
        // Prevent default events
        event.preventDefault();
        // API Handler call
        try {
            console.log("Deleting Course");
            console.log(session);
            // API Handler
            const res = await apiHandler(
                undefined,
                "DELETE",
                `api/course/${course?.courseId}`,
                `${BACKEND_API}`,
                userSession.accessToken || undefined
            );

            // Handle errors properly
            if (res instanceof Error || (res && res.error)) {
                toast.error(res?.message || "Failed to delete the course");
            } else {
                toast.success("Successfully deleted the course!");
                console.log("Course Deletion Succeeded.");
                console.log(res.toString());
            }
        } catch (e) {
            toast.error("Course Deletion Failed");
        } finally {
            // Run the cancel/close callback
            updateAction();
        }
    }

    return (
        <div className="flex inset-0 justify-center items-center">
            <form id="ExamActionForm" className="w-full space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseName" className="text-sm">Course Name</label>
                        <input
                            type="text"
                            id="courseName"
                            name="courseName"
                            value={courseData.courseName}
                            onChange={(e) =>
                                setCourseData({ ...courseData, courseName: e.target.value })}
                            className="w-full rounded-md bg-white/5 text-mentat-gold
                                placeholder-mentat-gold/60 border border-mentat-gold/20
                                focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseProfessorId" className="text-sm">Course Instructor ID</label>
                        <input
                            id="courseProfessorId"
                            type="text"
                            name="courseProfessorId"
                            value={courseData.courseProfessorId}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0
                                px-3 py-2"
                            readOnly={true}
                        >
                        </input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseSection" className="text-sm">Course Section</label>
                        <input
                            id="courseSection"
                            type="text"
                            name="courseSection"
                            value={courseData.courseSection}
                            onChange={(e) =>
                                setCourseData({ ...courseData, courseSection: e.target.value })}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
                        >
                        </input>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="courseQuarter" className="text-sm">Course Quarter</label>
                        <input
                            id="courseQuarter"
                            type="text"
                            name="courseQuarter"
                            value={courseData.courseQuarter}
                            onChange={(e) =>
                                setCourseData({ ...courseData, courseQuarter: e.target.value })}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="exam_date_scheduled" className="text-sm">Course Year</label>
                        <input
                            id="courseYear"
                            type="text"
                            name="courseYear"
                            value={courseData.courseYear}
                            onChange={(e) =>
                                setCourseData({ ...courseData, courseYear: e.target.value })}
                            // onChange={data}
                            className="w-full rounded-md bg-white/5 text-mentat-gold border
                                border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3
                                py-2"
                        />
                    </div>

                    {/*<div className="flex flex-col gap-2 justify-center">*/}
                    {/*    <div className="flex items-center gap-3">*/}
                    {/*        <input*/}
                    {/*            id="courseGradeStrategy"*/}
                    {/*            type="checkbox"*/}
                    {/*            name="is_required"*/}
                    {/*            checked={course !== undefined*/}
                    {/*                ? course.gradeStrategy === 1 : false}*/}
                    {/*            // onChange={data}*/}
                    {/*            className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5*/}
                    {/*                text-mentat-gold focus:ring-mentat-gold"*/}
                    {/*            readOnly={true}*/}
                    {/*        />*/}
                    {/*        <label htmlFor="is_required" className="select-none">Is Exam Required</label>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={cancelAction}
                        className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold
                            py-2 px-4 rounded-md border border-mentat-gold/20"
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-crimson hover:bg-crimson-700 text-mentat-gold font-bold
                            py-2 px-4 rounded-md shadow-sm shadow-mentat-gold-700"
                        type="submit"
                        onClick={handleDelete}
                    >
                        Delete Course
                    </button>
                    <button
                        className="bg-mentat-gold hover:bg-mentat-gold-700 text-crimson font-bold
                            py-2 px-4 rounded-md shadow-sm shadow-crimson-700"
                        type="submit"
                        onClick={handleUpdate}
                    >
                        Modify Course
                    </button>
                </div>
            </form>
        </div>
    );
}