"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiHandler } from '@/utils/api';
import { toast } from 'react-toastify';

interface CreateCourseClientProps {
  onCourseCreated?: () => void;
  onCancel?: () => void;
}

export default function CreateCourseClient({ onCourseCreated, onCancel }: CreateCourseClientProps) {
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
            `${BACKEND_API}`,
            session?.user?.accessToken || undefined
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
          className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
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
          className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
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
          className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
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
          className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
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
          className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold py-2 px-4 rounded-md border border-mentat-gold/20"
        >
          Cancel
        </button>
                <button
                    type="submit"
          disabled={isSubmitting}
          className="bg-crimson hover:bg-crimson-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
          {isSubmitting ? 'Creating...' : 'Create Course'}
                </button>
      </div>
            </form>
  );
}