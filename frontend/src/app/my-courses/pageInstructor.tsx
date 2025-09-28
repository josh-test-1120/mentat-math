'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiHandler } from '@/utils/api';
import Modal from '@/components/UI/calendar/Modal';
import JoinCourseComponent from '@/app/courses/JoinCourse';

type Course = {
  courseID: number;         // matches `getCourseID()` JSON field
  courseName: string;       // `course_name` -> @JsonProperty("courseName")
  courseSection: string;
  courseYear: number;
  courseQuarter: string;
};

export default function MyCoursesPage() {
    // Session information
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

  // Fetch courses
  useEffect(() => {
    // If not authenticated, return
    if (status !== 'authenticated') return;
    // Get student ID
    const id = session?.user?.id?.toString();
    // If no student ID, return
    if (!id) return;

    // Fetch courses
    const fetchCourses = async () => {
      // Try wrapper to handle async exceptions
      try {
        // API Handler
        const res = await apiHandler(
          undefined, // No body for GET request
          'GET',
          `course/enrollments?studentId=${id}`,
          `${BACKEND_API}`,
          session?.user?.accessToken || undefined
        );
        
        // Handle errors
        if (res instanceof Error || (res && res.error)) {
          console.error('Error fetching courses:', res.error);
          setCourses([]);
        } else {
            // Convert object to array
            let coursesData = [];
            
            // If res is an array, set coursesData to res
            if (Array.isArray(res)) {
              coursesData = res;
            // If res is an object, set coursesData to the values of the object
            } else if (res && typeof res === 'object') {
                // Use Object.entries() to get key-value pairs, then map to values
                coursesData = Object.entries(res)
                  .filter(([key, value]) => value !== undefined && value !== null)
                  .map(([key, value]) => value);
            // If res is not an array or object, set coursesData to an empty array
            } else {
              coursesData = [];
            }
            
            // Filter out invalid entries
            coursesData = coursesData.filter(c => c && typeof c === 'object');
            
            console.log('Processed courses data:', coursesData);
            // Set courses to coursesData
            setCourses(coursesData);
          }
      } catch (e) {
        // Error fetching courses
        console.error('Error fetching courses:', e);
        // Set courses to empty array
        setCourses([]);
      } finally {
        // Set loading to false
        setLoading(false);
      }
    };

    // Fetch courses
    fetchCourses();
  }, [status, session, BACKEND_API, refreshTrigger]);

  if (status !== 'authenticated') return <div className="p-6">Please sign in.</div>;
  if (loading) return <div className="p-6">Loading...</div>;



  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Enrolled Courses</h1>
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="text-white font-bold py-2 px-4 rounded-md transition-all duration-200 hover:brightness-110 flex items-center gap-2"
          style={{ backgroundColor: '#A30F32' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Join New Course
        </button>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-zinc-200 text-center py-8">
          <p className="mb-4">You are not enrolled in any courses yet.</p>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="text-white font-bold py-2 px-4 rounded-md transition-all duration-200 hover:brightness-110 flex items-center gap-2 mx-auto"
            style={{ backgroundColor: '#A30F32' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Join Your First Course
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c, index) => {
            // Skip if course is undefined/null
            if (!c || typeof c !== 'object') {
              console.warn(`Skipping invalid course at index ${index}:`, c);
              return null;
            }
            
            return (
              <div key={c.courseID || index} className="border rounded-xl p-4 shadow-sm">
                <div className="text-lg font-bold">
                  {c.courseName || 'Unknown Course'}
                </div>
                <div className="text-sm text-white mt-1">
                  Section: {c.courseSection || 'Not specified'}
                </div>
                <div className="text-sm text-white">
                Quarter: {c.courseQuarter || 'Not specified'} {c.courseYear || ''}
                </div>
              </div>
            );
          }).filter(Boolean)} {/* Remove null entries */}
        </div>
      )}

      {/* Join Course Modal */}
      <Modal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        title="Join New Course"
      >
        <JoinCourseComponent 
          onJoinSuccess={() => {
            setIsJoinModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      </Modal>
    </div>
  );
}