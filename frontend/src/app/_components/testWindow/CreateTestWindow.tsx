"use client";

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { apiHandler } from '@/utils/api';
import Modal from "@/app/_components/UI/Modal";

// Needed to get environment variable for Backend API
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

interface CreateTestWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onTestWindowCreated?: () => void;
  courses?: Array<{ id: number; name: string; section: string }>;
  exams?: Array<{ id: number; name: string; courseId: number }>;
  initialFormData?: Partial<TestWindowFormData>;
}

interface TestWindowFormData {
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
}

export default function CreateTestWindow({ 
  isOpen, 
  onClose, 
  onTestWindowCreated,
  courses = [],
  exams = [],
  initialFormData = {}
}: CreateTestWindowProps) {
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState<TestWindowFormData>({
    windowName: initialFormData.windowName || '',
    description: initialFormData.description || '',
    courseId: initialFormData.courseId || 0,
    examId: initialFormData.examId || 0,
    startDateTime: initialFormData.startDateTime || '',
    endDateTime: initialFormData.endDateTime || '',
    durationMinutes: initialFormData.durationMinutes || 60,
    maxAttempts: initialFormData.maxAttempts || 1,
    isActive: initialFormData.isActive !== undefined ? initialFormData.isActive : true,
    allowLateSubmission: initialFormData.allowLateSubmission || false,
    password: initialFormData.password || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredExams, setFilteredExams] = useState<Array<{ id: number; name: string; courseId: number }>>([]);

  // Update form data when initialFormData changes
  useEffect(() => {
    if (isOpen && initialFormData) {
      setFormData(prev => ({
        ...prev,
        ...initialFormData
      }));
    }
  }, [isOpen, initialFormData]);

  // Filter exams based on selected course
  useEffect(() => {
    if (formData.courseId > 0) {
      const courseExams = exams.filter(exam => exam.courseId === formData.courseId);
      setFilteredExams(courseExams);
      // Reset exam selection when course changes (only if not pre-filled)
      if (!initialFormData.examId) {
        setFormData(prev => ({ ...prev, examId: 0 }));
      }
    } else {
      setFilteredExams([]);
    }
  }, [formData.courseId, exams, initialFormData.examId]);

  // Set default start time to current time
  useEffect(() => {
    if (isOpen && !formData.startDateTime) {
      const now = new Date();
      const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      setFormData(prev => ({
        ...prev,
        startDateTime: startTime.toISOString().slice(0, 16),
        endDateTime: endTime.toISOString().slice(0, 16)
      }));
    }
  }, [isOpen, formData.startDateTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) || 0 : 
              value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.windowName.trim()) {
      toast.error('Test window name is required');
      return false;
    }
    
    if (formData.courseId === 0) {
      toast.error('Please select a course');
      return false;
    }
    
    if (formData.examId === 0) {
      toast.error('Please select an exam');
      return false;
    }
    
    if (!formData.startDateTime) {
      toast.error('Start date and time is required');
      return false;
    }
    
    if (!formData.endDateTime) {
      toast.error('End date and time is required');
      return false;
    }
    
    const startTime = new Date(formData.startDateTime);
    const endTime = new Date(formData.endDateTime);
    
    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return false;
    }
    
    if (formData.durationMinutes <= 0) {
      toast.error('Duration must be greater than 0 minutes');
      return false;
    }
    
    if (formData.maxAttempts <= 0) {
      toast.error('Max attempts must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error('Please log in to create a test window');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const testWindowData = {
        windowName: formData.windowName,
        description: formData.description,
        courseId: formData.courseId,
        examId: formData.examId,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        durationMinutes: formData.durationMinutes,
        maxAttempts: formData.maxAttempts,
        isActive: formData.isActive,
        allowLateSubmission: formData.allowLateSubmission,
        password: formData.password,
        createdBy: session.user.id.toString()
      };

      console.log('Creating test window with data:', testWindowData);

      const response = await apiHandler(
        testWindowData,
        'POST',
        'testWindow/createTestWindow',
        `${BACKEND_API}`
      );

      if (response?.error) {
        console.error('Create test window failed:', response);
        toast.error(response.message || 'Failed to create test window');
        return;
      }

      toast.success('Test window created successfully!');
      
      // Reset form
      setFormData({
        windowName: '',
        description: '',
        courseId: 0,
        examId: 0,
        startDateTime: '',
        endDateTime: '',
        durationMinutes: 60,
        maxAttempts: 1,
        isActive: true,
        allowLateSubmission: false,
        password: ''
      });

      // Close modal and refresh parent
      onClose();
      if (onTestWindowCreated) {
        onTestWindowCreated();
      }

    } catch (error) {
      console.error('Error creating test window:', error);
      toast.error('Failed to create test window');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Test Window">
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Test Window Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="windowName" className="text-sm font-medium">
            Test Window Name *
          </label>
          <input
            type="text"
            id="windowName"
            name="windowName"
            value={formData.windowName}
            onChange={handleInputChange}
            required
            className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
            placeholder="Enter test window name"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2 resize-none"
            placeholder="Enter test window description (optional)"
          />
        </div>

        {/* Course and Exam Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="courseId" className="text-sm font-medium">
              Course *
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              required
              className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
            >
              <option value={0}>Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.section}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="examId" className="text-sm font-medium">
              Exam *
            </label>
            <select
              id="examId"
              name="examId"
              value={formData.examId}
              onChange={handleInputChange}
              required
              disabled={filteredExams.length === 0}
              className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2 disabled:opacity-50"
            >
              <option value={0}>
                {filteredExams.length === 0 ? 'Select Course First' : 'Select Exam'}
              </option>
              {filteredExams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="startDateTime" className="text-sm font-medium">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="startDateTime"
              name="startDateTime"
              value={formData.startDateTime}
              onChange={handleInputChange}
              required
              className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="endDateTime" className="text-sm font-medium">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              id="endDateTime"
              name="endDateTime"
              value={formData.endDateTime}
              onChange={handleInputChange}
              required
              className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
            />
          </div>
        </div>

        {/* Duration and Max Attempts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="durationMinutes" className="text-sm font-medium">
              Duration (minutes) *
            </label>
            <input
              type="number"
              id="durationMinutes"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleInputChange}
              required
              min="1"
              max="480"
              className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="maxAttempts" className="text-sm font-medium">
              Max Attempts *
            </label>
            <input
              type="number"
              id="maxAttempts"
              name="maxAttempts"
              value={formData.maxAttempts}
              onChange={handleInputChange}
              required
              min="1"
              max="10"
              className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
            />
          </div>
        </div>

        {/* Password Protection */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password (Optional)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
            placeholder="Enter password for test window access"
          />
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
            />
            <label htmlFor="isActive" className="select-none text-sm">
              Active Test Window
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="allowLateSubmission"
              type="checkbox"
              name="allowLateSubmission"
              checked={formData.allowLateSubmission}
              onChange={handleInputChange}
              className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
            />
            <label htmlFor="allowLateSubmission" className="select-none text-sm">
              Allow Late Submission
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-mentat-gold/20">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold py-2 px-4 rounded-md border border-mentat-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Test Window'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
