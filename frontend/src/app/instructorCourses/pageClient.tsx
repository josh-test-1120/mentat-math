'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiHandler } from '@/utils/api';
import Modal from '../_components/UI/Modal';
import CreateCourseClient from '../courses/createCourse/pageClient';
import { toast } from 'react-toastify';

type Course = {
    courseID: number;
    courseName: string;
    courseSection: string;
    courseYear: number;
    courseQuarter: string;
    courseProfessorId: string;
};

export default function InstructorCoursesClient() {
    const { data: session, status } = useSession();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    // Move fetchInstructorCourses outside useEffect
    const fetchInstructorCourses = useCallback(async () => {
        if (status !== 'authenticated') return;
        const id = session?.user?.id?.toString();
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            
            const res = await apiHandler(
                undefined,
                'GET',
                `course/listCourses?id=${id}`,
                `${BACKEND_API}`
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
                let coursesData = [];
                
                if (Array.isArray(res)) {
                    coursesData = res;
                } else if (res && Array.isArray(res.data)) {
                    coursesData = res.data;
                } else if (res && Array.isArray(res.result)) {
                    coursesData = res.result;
                } else if (res && typeof res === 'object') {
                    coursesData = Object.values(res).filter(c => c && typeof c === 'object');
                }
                
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

    // Use useEffect to call fetchInstructorCourses on mount
    useEffect(() => {
        fetchInstructorCourses();
    }, [fetchInstructorCourses]);

    if (status !== 'authenticated') {
        return (
            <div className="p-6 text-center">
                <div className="text-gray-600">Please sign in to view your courses.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="text-gray-600">Loading your courses...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="text-red-600">Error: {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    const handleCreateCourse = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCourseCreated = () => {
        // Refresh the courses list when a new course is created
        // Now this will work because fetchInstructorCourses is accessible
        fetchInstructorCourses();
        setIsCreateModalOpen(false);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-mentat-gold">My Created Courses</h1>
                <p className="text-white mt-2">
                    Manage and view all courses you have created as an instructor.
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No courses found</div>
                    <p className="text-gray-400">
                        You haven't created any courses yet.
                        <a href="/courses/create" className="text-yellow-300 bg-red-700 hover:underline ml-1">
                            Create your first course
                        </a>
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div key={course.courseID} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                                    {course.courseName || 'Untitled Course'}
                                </h3>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  ID: {course.courseID}
                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
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
                                    <button className="flex-1 px-3 py-2 text-yellow-300 bg-red-700 hover:bg-red-600 text-sm rounded-lg transition-colors">
                                        View Details
                                    </button>
                                    <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                                        Edit Course
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 text-center">
                <button 
                    onClick={handleCreateCourse}
                    className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Course
                </button>
            </div>

            {/* Create Course Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                title="Create New Course"
            >
                <CreateCourseClient onCourseCreated={handleCourseCreated} />
            </Modal>
        </div>
    );
}