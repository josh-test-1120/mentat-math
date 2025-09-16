// @author Telmen Enkhtuvshin
// @description Create Test Window Component for testWindow page Instructor Calendar
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react'
import Modal from "../UI/Modal";

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
    isOpen: boolean;
    onClose: () => void;
    onTestWindowCreated: () => void;
    courses?: Course[];
    exams?: any[];
    initialFormData?: Partial<TestWindowFormData>;
    selectedCourseId?: number | null;
}

export default function CreateTestWindow({ 
    isOpen, 
    onClose, 
    onTestWindowCreated,
    courses = [],
    exams = [],
    initialFormData = {},
    selectedCourseId
}: CreateTestWindowProps) {
    const { data: session } = useSession();
    
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
        if (isOpen && initialFormData) {
            setFormData(prev => ({
                ...prev,
                ...initialFormData,
                courseId: selectedCourseId || initialFormData.courseId || prev.courseId
            }));
        }
    }, [isOpen, initialFormData, selectedCourseId]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.windowName.trim()) {
            alert('Please enter a window name');
            return;
        }
        
        if (!formData.courseId) {
            alert('Please select a course');
            return;
        }
        
        // Here you would typically send the data to your backend
        console.log('Test window data:', formData);
        
        // Call the success callback
        onTestWindowCreated();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Test Window">
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
                        onClick={onClose}
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
        </Modal>
    );
}
