// @author Telmen Enkhtuvshin
// @description Create Test Window Component for testWindow page Instructor Calendar
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify';
import { apiHandler } from "@/utils/api";

// Course type definition
type Course = {
    courseID: number;
    courseName: string;
    courseSection: string;
    courseYear: number;
    courseQuarter: string;
    courseProfessorId: string;
};

// Form data type
type TestWindowFormData = {
    windowName: string;
    description: string;
    courseId: number;
    examId: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
};

// Props interface
interface CreateTestWindowProps {
    courses?: Course[];
    exams?: any[];
    initialFormData?: Partial<TestWindowFormData>;
    selectedCourseId?: number | null;
    onTestWindowCreated: () => void;
}

export default function CreateTestWindowClient({ 
    courses = [],
    exams = [],
    initialFormData = {},
    selectedCourseId,
    onTestWindowCreated
}: CreateTestWindowProps) {

    const { data: session, status } = useSession();
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    // Session Hydration
    useEffect(() => {
        if (status !== "authenticated") return;
    
        if (session) {
            const newUserSession = {
                id: session?.user.id?.toString() || '',
                username: session?.user.username || '',
                email: session?.user.email || ''
            };
            
            setSession(newUserSession);
            setSessionReady(newUserSession.id !== "");
            
            console.log("User session NAME: " + session.user.username);
            console.log("User session ID: " + newUserSession.id);
        }
    }, [session, status]); // Added status to dependencies

    
    
    const [formData, setFormData] = useState<TestWindowFormData>({
        windowName: initialFormData.windowName || '',
        description: initialFormData.description || '',
        courseId: initialFormData.courseId || selectedCourseId || 0,
        examId: initialFormData.examId || 0,
        startDate: initialFormData.startDate || '',
        endDate: initialFormData.endDate || '',
        startTime: initialFormData.startTime || '',
        endTime: initialFormData.endTime || '',
        isActive: initialFormData.isActive !== undefined ? initialFormData.isActive : true
    });

    // Update form data when initialFormData changes
    useEffect(() => {
        if (initialFormData) {
            setFormData(prev => ({
                ...prev,
                ...initialFormData,
                courseId: selectedCourseId || initialFormData.courseId || prev.courseId
            }));
        }
    }, [selectedCourseId]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission with session authentication
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if user is authenticated
        if (status === "loading") {
            toast.info("Loading...");
            return;
        }
        
        if (status === "unauthenticated" || !session) {
            toast.error("Please log in to create test windows");
            return;
        }
        
        // Basic validation
        if (!formData.windowName.trim()) {
            toast.error('Please enter a window name');
            return;
        }
        
        if (!formData.courseId) {
            toast.error('Please select a course');
            return;
        }
        
        try {
            const requestData = {
                windowName: formData.windowName,
                description: formData.description,
                courseId: formData.courseId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
                weekdays: JSON.stringify({
                    monday: false,
                    tuesday: true,
                    wednesday: false,
                    thursday: true,
                    friday: false,
                    saturday: false,
                    sunday: false
                }),
                exceptions: "{}",
                isActive: formData.isActive
            };
            
            console.log('Sending test window data:', requestData);
            console.log('User session:', session);
            
            const response = await apiHandler(
                requestData,
                'POST',
                'api/test-window/create',
                process.env.NEXT_PUBLIC_BACKEND_API || ''
            );
            
            if (response?.error) {
                console.error('Error creating test window:', response);
                toast.error(response.message || 'Failed to create test window');
                return;
            }
            
            console.log('Test window created successfully:', response);
            toast.success('Test window created successfully!');
            onTestWindowCreated();
            
        } catch (error) {
            console.error('Error creating test window:', error);
            toast.error('Error creating test window');
        }
    };

    // Show loading state while session is loading
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-mentat-gold">Loading...</div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (status === "unauthenticated" || !session) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-mentat-gold text-center">
                    Please log in to create test windows
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Window Name */}
            <div className="flex flex-col gap-2">
                <label htmlFor="windowName" className="text-sm font-medium text-mentat-gold">
                    Window Name *
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
                <label htmlFor="description" className="text-sm font-medium text-mentat-gold">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-md bg-white/5 text-mentat-gold placeholder-mentat-gold/60 border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                    placeholder="Enter test window description"
                />
            </div>

            {/* Course Selection */}
            <div className="flex flex-col gap-2">
                <label htmlFor="courseId" className="text-sm font-medium text-mentat-gold">
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
                    <option value={0}>Select a course</option>
                    {courses.map((course) => (
                        <option key={course.courseID} value={course.courseID}>
                            {course.courseName} - {course.courseSection} ({course.courseQuarter} {course.courseYear})
                        </option>
                    ))}
                </select>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="startDate" className="text-sm font-medium text-mentat-gold">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="endDate" className="text-sm font-medium text-mentat-gold">
                        End Date *
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                    />
                </div>
            </div>

            {/* Time Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="startTime" className="text-sm font-medium text-mentat-gold">
                        Start Time *
                    </label>
                    <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="endTime" className="text-sm font-medium text-mentat-gold">
                        End Time *
                    </label>
                    <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md bg-white/5 text-mentat-gold border border-mentat-gold/20 focus:border-mentat-gold/60 focus:ring-0 px-3 py-2"
                    />
                </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-mentat-gold/40 bg-white/5 text-mentat-gold focus:ring-mentat-gold"
                />
                <label htmlFor="isActive" className="text-sm text-mentat-gold">
                    Active (test window is currently available)
                </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => onTestWindowCreated()}
                    className="bg-white/5 hover:bg-white/10 text-mentat-gold font-semibold py-2 px-4 rounded-md border border-mentat-gold/20"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-md"
                >
                    Create Test Window
                </button>
            </div>
        </form>
    );
}