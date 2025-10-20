'use client';

import React, {useEffect, useState, useCallback, useRef} from 'react';
import { useSession } from 'next-auth/react';
import { apiHandler } from '@/utils/api';
import Modal from '@/components/services/Modal';
import Course from "@/components/types/course"
import CreateCourseClient from '@/app/dashboard/localComponents/CreateCourse';
import { toast } from 'react-toastify';
import { Plus } from "lucide-react";
import { RingSpinner } from "@/components/UI/Spinners";

/**
 * This is the Dashboard page for the Students
 * This will include snapshots of upcoming exams
 * and which courses the student has joined
 * @author Telmen Enkhtuvshin
 */
export default function InstructorCoursesClient() {
    // These are the state variables used in the page
    const { data: session, status } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Refresh trigger (to re-render page)
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Reference to control React double render of useEffect
    const hasFetched = useRef(false);
    // Modal state checks
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    /**
     * Fetch the courses for the Instructor
     */
    const fetchInstructorCourses = useCallback(async (id: string) => {
        // Try - Catch Handler
        try {
            setLoading(true);
            setError(null);

            const res = await apiHandler(
                undefined,
                'GET',
                `api/course/listCourses?id=${id}`,
                `${BACKEND_API}`,
                session?.user?.accessToken || undefined
            );

            if (res?.error) {
                console.error('List Instructor Courses failed:', res);
                toast.error(res.message || 'List Instructor Courses failed');
                return;
            }

            console.log('Instructor courses response:', res);

            if (res instanceof Error || (res && res.error)) {
                console.error('Error fetching instructor courses:', res.error);
                setError(res.error || 'Failed to fetch courses');
                setCourses([]);
            } else {
                // Handle different response formats
                let coursesData : Course[] = [];

                // Get the response data
                coursesData = res?.courses || res || [];
                // Ensure it's an array
                coursesData = Array.isArray(coursesData) ? coursesData : [coursesData];

                console.log('Processed instructor courses:', coursesData);
                setCourses(coursesData);
            }
        } catch (e) {
            console.error('Error fetching instructor courses:', e);
            setError('Failed to fetch courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [status, session, BACKEND_API]);

    /**
     * useAffects that bind the page to refreshes and updates
     */
    useEffect(() => {
        if (status !== 'authenticated' || !session || hasFetched.current) return;
        // Get student ID
        const id = session?.user?.id;
        // If no student ID, return
        if (!id) return;

        const fetchData = async () => {
            hasFetched.current = true;
            setLoading(true);
            // Try - Catch handler
            try {
                // Fetch the courses assigned to the Instructor
                fetchInstructorCourses(id);
            } catch (error) {
                console.error('Error fetching grade and course data:', error);
            } finally {
                setLoading(false);
            }
        };
        // Run the async handler to fetch data
        fetchData();
    }, [session, status, refreshTrigger]);

    const handleCreateCourse = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCourseCreated = () => {
        // Refresh the courses list when a new course is created
        // Now this will work because fetchInstructorCourses is accessible
        if (session?.user?.id) {
            fetchInstructorCourses(session?.user?.id);
            setIsCreateModalOpen(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-mentat-gold">My Created Courses</h1>
                    <div className="mt-4 mb-6 text-center items-center">
                        <button
                            onClick={handleCreateCourse}
                            className="inline-flex items-center px-4 py-2 bg-crimson
                                text-mentat-gold rounded-lg hover:bg-crimson-700 transition-colors"
                        >
                            <span className="inline-flex items-center mr-1">
                                <Plus className="w-5 h-5" />
                            </span>
                            <span>Create New Course</span>
                        </button>
                    </div>
                </div>
                <p className="mt-2">
                    Manage and view all courses you have created as an instructor.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center pt-6">
                    <RingSpinner size={'sm'} color={'mentat-gold'} />
                    <p className="ml-3 text-md text-mentat-gold">Loading courses...</p>
                </div>
                ) : !courses ? (
                <div className="text-center py-12">
                    <div className="text-lg mb-4">No courses found</div>
                    <p>
                        You haven't created any courses yet.
                        <a href="/courses/create" className="text-yellow-300 bg-red-700 hover:underline ml-1">
                            Create your first course
                        </a>
                    </p>
                </div>
            ) : courses && courses.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
                    {courses.map((course, index) => (
                        <div key={`${course?.courseId ?? 'no-id'}-${index}`} className="bg-white/5 border border-mentat-gold/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-mentat-gold line-clamp-2">
                                    {course.courseName || 'Untitled Course'}
                                </h3>
                                <span className="bg-mentat-gold/20 text-mentat-gold text-xs px-2 py-1 rounded-full border border-mentat-gold/30">
                                    ID: {course.courseId}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-mentat-gold/80">
                                <div className="flex items-center">
                                    <span className="font-medium w-20">Section:</span>
                                    <span>{course.courseSection || 'Not specified'}</span>
                                </div>

                                <div className="flex items-center">
                                    <span className="font-medium w-20">Quarter:</span>
                                    <span>{course.courseQuarter || 'Not specified'}</span>
                                </div>

                                <div className="flex items-center">
                                    <span className="font-medium w-20">Year:</span>
                                    <span>{course.courseYear || 'Not specified'}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex space-x-2">
                                    <button className="flex-1 px-3 py-2 bg-[#A30F32] text-sm rounded-lg
                                        hover:bg-crimson-700 transition-colors">
                                        View Details
                                    </button>
                                    <button className="flex-1 px-3 py-2 bg-mentat-gold text-crimson
                                        text-sm rounded-lg hover:bg-mentat-gold-700 transition-colors">
                                        Edit Course
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Course Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                title="Create New Course"
            >
                <CreateCourseClient onCourseCreated={handleCourseCreated} onCancel={handleCloseModal} />
            </Modal>
        </div>
    );
}