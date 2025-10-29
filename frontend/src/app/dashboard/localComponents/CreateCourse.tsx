"use client";

import {useEffect, useState} from 'react';
import { useSession } from 'next-auth/react';
import { apiHandler } from '@/utils/api';
import { toast } from 'react-toastify';

interface CreateCourseProps {
  onCourseCreated?: () => void;
  onCancel?: () => void;
}

/**
 * This is the Create Course component, which will handle
 * the data form and the creation of a new course
 * for an instructor
 * @param onCourseCreated
 * @param onCancel
 * @constructor
 * @author Telmen Enkhtuvshin
 */
export default function CreateCourse({ onCourseCreated, onCancel }: CreateCourseProps) {
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
    // Layout state variables
    const [formData, setFormData] = useState({
        courseName: '',
        courseSection: '',
        courseQuarter: '',
        courseYear: new Date().getFullYear(),
    });

    // These are the loading states
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Form validation - only exam name and course are required
    const isFormValid = formData.courseName.trim() !== '' &&
        formData.courseSection.trim() !== '' &&
        formData.courseQuarter.trim() !== '' &&
        formData.courseYear !== undefined;
    // Backend API for data
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    /**
     * useAffects that bind the page to refreshes and updates
     */
    useEffect(() => {
        if (status !== "authenticated") return;
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || '',
                accessToken: session?.user.accessToken || '',
            };

            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
        }
    }, [session, status]); // Added status to dependencies

    /**
     * This function will handle form submissions
     * to create the new course
     * @param e
     */
    const handleSubmit = async (e: React.FormEvent) => {
        // Prevent default even propagation
        e.preventDefault();
        // Set the submission state
        setIsSubmitting(true);
        // Try - Catch handler
        try {
            const courseData = {
                courseName: formData.courseName,
                courseSection: formData.courseSection,
                courseQuarter: formData.courseQuarter,
                courseYear: formData.courseYear,
                userID: userSession.id,
            };

            const res = await apiHandler(
                courseData,
                'POST',
                'api/course/createCourse',
                `${BACKEND_API}`,
                userSession.accessToken || undefined
            );

            if (res?.error) {
                console.error('Create failed:', res);
                toast.error(res.message || 'Create failed');
                return;
            }

            if (res instanceof Error || (res && res.error)) {
                toast.error(res.error || 'Failed to create course');
            } else {
                toast.success('Course created successfully!');
                setFormData({
                    courseName: '',
                    courseSection: '',
                    courseQuarter: '',
                    courseYear: new Date().getFullYear(),
                });

                // Call the callback to refresh the parent component
                if (onCourseCreated) {
                    onCourseCreated();
                }
            }
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error('Failed to create course');
        } finally {
            setIsSubmitting(false);
        }
    };

    console.log(`Current Form valid state: ${isFormValid}`);

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
                <label htmlFor="courseName" className="text-sm font-medium text-mentat-gold">
                    Course Name *
                </label>
                <input
                    type="text"
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60
                     border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                    placeholder="Enter course name"
                    required
                />
            </div>

            <div>
                <label htmlFor="courseSection" className="text-sm font-medium text-mentat-gold">
                    Section
                </label>
                <input
                    type="text"
                    id="courseSection"
                    value={formData.courseSection}
                    onChange={(e) => setFormData({ ...formData, courseSection: e.target.value })}
                    className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60
                    border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                    placeholder="Enter section (e.g., 001)"
                />
            </div>

            <div>
                <label htmlFor="courseQuarter" className="text-sm font-medium text-mentat-gold">
                    Quarter
                </label>
                <select
                    id="courseQuarter"
                    value={formData.courseQuarter}
                    onChange={(e) => setFormData({ ...formData, courseQuarter: e.target.value })}
                    className="w-full rounded-md bg-white/5 text-mentat-gold border
                    border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                >
                    <option value="">Select Quarter</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                </select>
            </div>

            <div>
                <label htmlFor="courseYear" className="text-sm font-medium text-mentat-gold">
                    Year *
                </label>
                <input
                  type="number"
                  id="courseYear"
                  value={formData.courseYear}
                  onChange={(e) => setFormData({ ...formData, courseYear: parseInt(e.target.value) })}
                  className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60
                  border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                  placeholder="Enter year"
                  min="2020"
                  max="2030"
                  required
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => onCancel?.()}
                    className="bg-mentat-gold hover:bg-mentat-gold-700 text-crimson-700 font-semibold py-2 px-4
                    rounded-md shadow-sm shadow-crimson-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`font-bold py-2 px-4 rounded-md transition-colors shadow-sm shadow-mentat-gold-700
                     ${isFormValid
                        ? 'bg-crimson hover:bg-crimson-700 text-mentat-gold'
                        : 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed'}`}
                >
                    {isSubmitting ? 'Creating...' : 'Create Course'}
                </button>
            </div>
        </form>
  );
}