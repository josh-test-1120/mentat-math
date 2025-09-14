"use client";

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { apiHandler } from '@/utils/api';
import CreateTestWindow from "@/app/_components/testWindow/CreateTestWindow";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

interface Course {
  id: number;
  name: string;
  section: string;
  courseYear: number;
  courseQuarter: string;
}

interface Exam {
  id: number;
  name: string;
  courseId: number;
  difficulty: number;
  isPublished: boolean;
  isRequired: boolean;
}

interface TestWindow {
  id: number;
  windowName: string;
  description: string;
  courseId: number;
  examId: number;
  startDateTime: string;
  endDateTime: string;
  durationMinutes: number;
  maxAttempts: number;
  isActive: boolean;
  allowLateSubmission: boolean;
  password: string;
  createdBy: string;
  createdAt: string;
}

export default function TestWindowsPageClient() {
  const { data: session } = useSession();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [testWindows, setTestWindows] = useState<TestWindow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [userSession, setUserSession] = useState({
    id: '',
    username: '',
    email: ''
  });

  // Session handling
  useEffect(() => {
    if (session) {
      setUserSession({
        id: session?.user.id?.toString() || '',
        username: session?.user.username || '',
        email: session?.user.email || ''
      });
      setSessionReady(true);
    }
  }, [session]);

  // Load data when session is ready
  useEffect(() => {
    if (sessionReady) {
      loadData();
    }
  }, [sessionReady]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadCourses(),
        loadExams(),
        loadTestWindows()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await apiHandler(
        {},
        'GET',
        'course/getAllCourses',
        `${BACKEND_API}`
      );

      if (response?.error) {
        console.error('Failed to load courses:', response);
        return;
      }

      setCourses(response || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadExams = async () => {
    try {
      const response = await apiHandler(
        {},
        'GET',
        'exam/getAllExams',
        `${BACKEND_API}`
      );

      if (response?.error) {
        console.error('Failed to load exams:', response);
        return;
      }

      setExams(response || []);
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const loadTestWindows = async () => {
    try {
      const response = await apiHandler(
        {},
        'GET',
        'testWindow/getAllTestWindows',
        `${BACKEND_API}`
      );

      if (response?.error) {
        console.error('Failed to load test windows:', response);
        return;
      }

      setTestWindows(response || []);
    } catch (error) {
      console.error('Error loading test windows:', error);
    }
  };

  const handleTestWindowCreated = () => {
    loadTestWindows();
    toast.success('Test window created successfully!');
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  const getStatusBadge = (testWindow: TestWindow) => {
    const now = new Date();
    const startTime = new Date(testWindow.startDateTime);
    const endTime = new Date(testWindow.endDateTime);

    if (now < startTime) {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Scheduled</span>;
    } else if (now >= startTime && now <= endTime) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">Closed</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mentat-black text-mentat-gold flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mentat-gold mx-auto mb-4"></div>
          <p>Loading test windows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mentat-black text-mentat-gold">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Test Windows Management</h1>
            <p className="text-mentat-gold/80">
              Create and manage test windows for your courses and exams.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-6 rounded-md transition-colors"
          >
            Create Test Window
          </button>
        </div>

        {/* Test Windows List */}
        <div className="bg-white/5 rounded-lg border border-mentat-gold/20 overflow-hidden">
          {testWindows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No Test Windows Found</h3>
              <p className="text-mentat-gold/60 mb-6">
                Create your first test window to get started.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-md"
              >
                Create Test Window
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-mentat-gold/20">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold">Test Window</th>
                    <th className="text-left py-4 px-6 font-semibold">Course</th>
                    <th className="text-left py-4 px-6 font-semibold">Exam</th>
                    <th className="text-left py-4 px-6 font-semibold">Start Time</th>
                    <th className="text-left py-4 px-6 font-semibold">End Time</th>
                    <th className="text-left py-4 px-6 font-semibold">Duration</th>
                    <th className="text-left py-4 px-6 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testWindows.map((testWindow) => {
                    const course = courses.find(c => c.id === testWindow.courseId);
                    const exam = exams.find(e => e.id === testWindow.examId);
                    
                    return (
                      <tr key={testWindow.id} className="border-b border-mentat-gold/10 hover:bg-white/5">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium">{testWindow.windowName}</div>
                            {testWindow.description && (
                              <div className="text-sm text-mentat-gold/60 mt-1">
                                {testWindow.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {course ? `${course.name} - ${course.section}` : 'Unknown Course'}
                        </td>
                        <td className="py-4 px-6">
                          {exam ? exam.name : 'Unknown Exam'}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {formatDateTime(testWindow.startDateTime)}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {formatDateTime(testWindow.endDateTime)}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {testWindow.durationMinutes} min
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(testWindow)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              Edit
                            </button>
                            <button className="text-red-400 hover:text-red-300 text-sm">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Test Window Modal */}
        <CreateTestWindow
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTestWindowCreated={handleTestWindowCreated}
          courses={courses}
          exams={exams}
        />
      </div>
    </div>
  );
}
