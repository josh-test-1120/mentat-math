"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiHandler } from '@/utils/api';
import { toast } from 'react-toastify';

interface CreateCourseClientProps {
  onCourseCreated?: () => void;
}

export default function CreateCourseClient({ onCourseCreated }: CreateCourseClientProps) {
  const { data: session } = useSession();
    const [formData, setFormData] = useState({
    courseName: '',
    courseSection: '',
    courseQuarter: '',
    courseYear: new Date().getFullYear(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
    const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('Please log in to create a course');
      return;
    }

    setIsSubmitting(true);

    try {
        const courseData = {
        courseName: formData.courseName,
        courseSection: formData.courseSection,
        courseQuarter: formData.courseQuarter,
        courseYear: formData.courseYear,
        userID: session.user.id.toString(),
        };

        // Add debugging
        console.log('Sending course data:', courseData);
        console.log('User ID:', session.user.id);
        console.log('User ID type:', typeof session.user.id);

        console.log("Course name is:", courseData.courseName);
        console.log("Course name type:", typeof courseData.courseName);
        console.log("Course section is:", courseData.courseSection);
        console.log("Course section type:", typeof courseData.courseSection);
        console.log("Course quarter is:", courseData.courseQuarter);
        console.log("Course quarter type:", typeof courseData.courseQuarter);
        console.log("Course year is:", courseData.courseYear);
        console.log("Course year type:", typeof courseData.courseYear);
        console.log("User ID is:", courseData.userID);

        const res = await apiHandler(
            courseData,
            'POST',
            'course/createCourse',
            `${BACKEND_API}`
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

    return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
          Course Name *
        </label>
                    <input
                        type="text"
          id="courseName"
          value={formData.courseName}
          onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
      </div>

      <div>
        <label htmlFor="courseSection" className="block text-sm font-medium text-gray-700 mb-1">
          Section
                </label>
                    <input
                        type="text"
          id="courseSection"
          value={formData.courseSection}
          onChange={(e) => setFormData({ ...formData, courseSection: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="courseQuarter" className="block text-sm font-medium text-gray-700 mb-1">
          Quarter
                </label>
                    <select
          id="courseQuarter"
          value={formData.courseQuarter}
          onChange={(e) => setFormData({ ...formData, courseQuarter: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Quarter</option>
                        <option value="Fall">Fall</option>
                        <option value="Winter">Winter</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                    </select>
      </div>

      <div>
        <label htmlFor="courseYear" className="block text-sm font-medium text-gray-700 mb-1">
          Year *
                </label>
        <input
          type="number"
          id="courseYear"
          value={formData.courseYear}
          onChange={(e) => setFormData({ ...formData, courseYear: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="2020"
          max="2030"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => onCourseCreated?.()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
                <button
                    type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
          {isSubmitting ? 'Creating...' : 'Create Course'}
                </button>
      </div>
            </form>
  );
}