// @author AI Assistant
// @description Modify Pattern Modal Component for updating existing test windows
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify';
import { apiHandler } from "@/utils/api";
import { motion } from 'framer-motion';

// Course type definition
type Course = {
    courseId: number;
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
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
};

// Props interface
interface ModifyPatternModalProps {
    isOpen: boolean;
    onClose: () => void;
    testWindowId: number;
    testWindowTitle: string;
    courses?: Course[];
    onTestWindowUpdated?: () => void;
}

export default function ModifyPatternModal({ 
    isOpen,
    onClose,
    testWindowId,
    testWindowTitle,
    courses = [],
    onTestWindowUpdated
}: ModifyPatternModalProps) {
    const { data: session, status } = useSession();
    const [sessionReady, setSessionReady] = useState(false);
    const [userSession, setSession] = useState({
        id: '',
        username: '',
        email: ''
    });

    const [formData, setFormData] = useState<TestWindowFormData>({
        windowName: '',
        description: '',
        courseId: 0,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    // Weekly pattern state
    const [showWeeklyPattern, setShowWeeklyPattern] = useState(false);
    const [weeklyPattern, setWeeklyPattern] = useState({
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false
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
        }
    }, [session, status]);

    // Fetch test window data when modal opens
    useEffect(() => {
        if (isOpen && testWindowId && session?.user?.accessToken) {
            fetchTestWindowData();
        }
    }, [isOpen, testWindowId, session?.user?.accessToken]);

    const fetchTestWindowData = async () => {
        if (!session?.user?.accessToken) return;
        
        setFetchingData(true);
        try {
            const response = await apiHandler(
                undefined,
                'GET',
                `api/test-window/${testWindowId}`,
                process.env.NEXT_PUBLIC_BACKEND_API || '',
                session.user.accessToken
            );

            if (response?.error) {
                toast.error(response.message || 'Failed to fetch test window data');
                return;
            }

            // Map the response data to form data
            const testWindow = response;
            setFormData({
                windowName: testWindow.testWindowTitle || '',
                description: testWindow.description || '',
                courseId: testWindow.courseId || 0,
                startDate: testWindow.testWindowStartDate || '',
                endDate: testWindow.testWindowEndDate || '',
                startTime: testWindow.testStartTime || '',
                endTime: testWindow.testEndTime || '',
                isActive: testWindow.isActive !== undefined ? testWindow.isActive : true
            });

            // Parse and set weekly pattern from existing data
            if (testWindow.weekdays) {
                try {
                    const parsedWeekdays = JSON.parse(testWindow.weekdays);
                    setWeeklyPattern(parsedWeekdays);
                    // Show weekly pattern if any days are selected
                    const hasSelectedDays = Object.values(parsedWeekdays).some(Boolean);
                    setShowWeeklyPattern(hasSelectedDays);
                } catch (error) {
                    console.error('Error parsing weekdays:', error);
                    // Keep default empty pattern
                }
            }

        } catch (error) {
            console.error('Error fetching test window data:', error);
            toast.error('Failed to fetch test window data');
        } finally {
            setFetchingData(false);
        }
    };

    // Helper function to get available weekdays for the date range
    const getAvailableWeekdays = () => {
        if (!formData.startDate || !formData.endDate) {
            return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        }

        // Parse dates in local timezone to avoid UTC conversion issues
        const [startYear, startMonth, startDay] = formData.startDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = formData.endDate.split('-').map(Number);
        
        const startDate = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
        const endDate = new Date(endYear, endMonth - 1, endDay);
        
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const availableDays = new Set<string>();

        // Add all days within the date range (inclusive of both start and end dates)
        const currentDate = new Date(startDate);
        
        // Loop through each day from start to end (inclusive)
        while (currentDate <= endDate) {
            const dayIndex = currentDate.getDay();
            availableDays.add(dayNames[dayIndex]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return Array.from(availableDays);
    };

    // Handle weekly pattern checkbox changes
    const handleWeeklyPatternChange = (day: string) => {
        setWeeklyPattern(prev => ({
            ...prev,
            [day]: !prev[day as keyof typeof prev]
        }));
    };

    // Auto-select starting date's weekday when pattern is opened
    const handleToggleWeeklyPattern = () => {
        if (!showWeeklyPattern && formData.startDate) {
            // Parse date in local timezone to avoid UTC conversion issues
            const [year, month, day] = formData.startDate.split('-').map(Number);
            // Create date in local timezone
            const startDate = new Date(year, month - 1, day); // month is 0-indexed
            // Day names
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            // Get day index
            const dayIndex = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            // Get day name
            const dayName = dayNames[dayIndex];
            
            setWeeklyPattern(prev => ({
                ...prev,
                [dayName]: true
            }));
        }
        setShowWeeklyPattern(!showWeeklyPattern);
    };

    // Clear invalid weekday selections when date range changes
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const availableWeekdays = getAvailableWeekdays();
            setWeeklyPattern(prev => {
                const updated = { ...prev };
                // Clear selections for days not in the available range
                Object.keys(updated).forEach(day => {
                    if (!availableWeekdays.includes(day)) {
                        updated[day as keyof typeof updated] = false;
                    }
                });
                return updated;
            });
        }
    }, [formData.startDate, formData.endDate]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        let processedValue;
        if (type === 'checkbox') {
            processedValue = checked;
        } else if (name === 'courseId') {
            const parsedValue = parseInt(value, 10);
            processedValue = isNaN(parsedValue) ? 0 : parsedValue;
        } else if (type === 'date') {
            if (value && value.length > 0) {
                const year = value.split('-')[0];
                if (year && year.length > 4) {
                    const truncatedYear = year.substring(0, 4);
                    const [month, day] = value.split('-').slice(1);
                    processedValue = `${truncatedYear}-${month || ''}-${day || ''}`;
                } else {
                    processedValue = value;
                }
            } else {
                processedValue = value;
            }
        } else {
            processedValue = value;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (status === "loading") {
            toast.info("Loading...");
            return;
        }
        
        if (status === "unauthenticated" || !session) {
            toast.error("Please log in to modify test windows");
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

        // Validate date range
        const [startYear, startMonth, startDay] = formData.startDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = formData.endDate.split('-').map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        
        if (startDate > endDate) {
            toast.error('End date must be after start date');
            return;
        }

        // Validate time range
        if (formData.startTime && formData.endTime) {
            const startTime = new Date(`2000-01-01T${formData.startTime}`);
            const endTime = new Date(`2000-01-01T${formData.endTime}`);
            if (startTime >= endTime) {
                toast.error('End time must be after start time');
                return;
            }
        }

        // Validate weekly pattern based on date range
        const availableWeekdays = getAvailableWeekdays();
        const selectedDays = Object.entries(weeklyPattern)
            .filter(([day, selected]) => selected)
            .map(([day]) => day);
        
        // Check if any selected days are not in the available range
        const invalidDays = selectedDays.filter(day => !availableWeekdays.includes(day));
        if (invalidDays.length > 0) {
            toast.error(`Selected days (${invalidDays.join(', ')}) are not within the test window date range.`);
            return;
        }

        // For single-day windows, only allow one day selection (if any days are selected)
        const isSingleDay = formData.startDate === formData.endDate;
        if (isSingleDay && selectedDays.length > 1) {
            toast.error('Single-day test windows cannot repeat on multiple days. Please select only one day or extend the date range.');
            return;
        }

        setLoading(true);
        
        try {
            // Auto-select start date weekday if no weekly pattern is set
            let finalWeeklyPattern = weeklyPattern;
            if (!showWeeklyPattern && formData.startDate) {
                // Parse date in local timezone to avoid UTC conversion issues
                const [year, month, day] = formData.startDate.split('-').map(Number);
                const startDate = new Date(year, month - 1, day); // month is 0-indexed
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayIndex = startDate.getDay();
                const dayName = dayNames[dayIndex];
                
                // Auto-select start date weekday
                finalWeeklyPattern = { ...weeklyPattern, [dayName]: true };
            }
            
            // Format times to HH:mm (remove seconds if present)
            const formatTime = (time: string) => {
                if (!time) return '';
                // If time includes seconds (HH:mm:ss), remove them
                return time.length > 5 ? time.substring(0, 5) : time;
            };

            const requestData = {
                windowName: formData.windowName,
                description: formData.description,
                courseId: formData.courseId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                startTime: formatTime(formData.startTime),
                endTime: formatTime(formData.endTime),
                weekdays: JSON.stringify(finalWeeklyPattern),
                exceptions: "{}", // Keep existing exceptions for now
                isActive: formData.isActive
            };
            
            
            const response = await apiHandler(
                requestData,
                'PUT',
                `api/test-window/${testWindowId}`,
                process.env.NEXT_PUBLIC_BACKEND_API || '',
                session?.user?.accessToken || undefined
            );
            
            console.log('API Response:', response);
            
            if (response?.error) {
                console.error('Error updating test window:', response);
                toast.error(response.message || 'Failed to update test window');
                return;
            }
            
            console.log('Test window updated successfully:', response);
            onTestWindowUpdated?.();
            onClose();
            
        } catch (error) {
            console.error('Error updating test window:', error);
            toast.error('Error updating test window');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-mentat-black border border-mentat-gold/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-mentat-gold/20">
                    <h2 className="text-xl font-bold text-mentat-gold">Modify Pattern</h2>
                    <button
                        onClick={onClose}
                        className="text-mentat-gold/60 hover:text-mentat-gold transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {fetchingData ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-mentat-gold">Loading test window data...</div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        <option key={course.courseId} value={course.courseId}>
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
                                        min="1900-01-01"
                                        max="9999-12-31"
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
                                        min="1900-01-01"
                                        max="9999-12-31"
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

                            {/* Weekly Pattern Section */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-mentat-gold">
                                            Weekly Pattern (Optional)
                                        </label>
                                        <span className="text-xs text-mentat-gold/60">
                                            Set up recurring days for multi-day test windows
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleWeeklyPattern}
                                        className="px-3 py-1.5 bg-mentat-gold/20 hover:bg-mentat-gold/30 text-mentat-gold border border-mentat-gold/40 rounded-md text-sm font-medium transition-colors"
                                    >
                                        {showWeeklyPattern ? 'Hide Pattern' : 'Set Pattern'}
                                    </button>
                                </div>

                                {showWeeklyPattern && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-mentat-gold/20 rounded-md">
                                            {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => {
                                                const isSelected = weeklyPattern[day as keyof typeof weeklyPattern];
                                                const availableWeekdays = getAvailableWeekdays();
                                                const isAvailable = availableWeekdays.includes(day);
                                                const isSingleDay = formData.startDate === formData.endDate;
                                                const selectedDays = Object.values(weeklyPattern).filter(Boolean).length;
                                                const isDisabled = !isAvailable || (isSingleDay && selectedDays >= 1 && !isSelected);
                                                
                                                return (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => handleWeeklyPatternChange(day)}
                                                        disabled={isDisabled}
                                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                                                            isSelected
                                                                ? 'bg-mentat-gold text-mentat-black border-mentat-gold shadow-lg'
                                                                : isDisabled
                                                                ? 'bg-white/5 text-mentat-gold/30 border-mentat-gold/20 cursor-not-allowed'
                                                                : 'bg-white/5 text-mentat-gold border-mentat-gold/40 hover:border-mentat-gold/60 hover:bg-white/10'
                                                        }`}
                                                        title={!isAvailable ? `Not available in date range (${formData.startDate} to ${formData.endDate})` : ''}
                                                    >
                                                        {day.charAt(0).toUpperCase()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Validation feedback */}
                                        {formData.startDate === formData.endDate && (
                                            <div className="text-xs text-mentat-gold/70 text-center">
                                                💡 Single-day windows can only repeat on one day (or leave empty for no repetition)
                                            </div>
                                        )}
                                        
                                        {formData.startDate !== formData.endDate && (
                                            <div className="text-xs text-mentat-gold/70 text-center">
                                                💡 Multi-day windows can repeat on multiple days within the date range (or leave empty for no repetition)
                                            </div>
                                        )}
                                        
                                        {/* Show available days info */}
                                        {formData.startDate && formData.endDate && (
                                            <div className="text-xs text-mentat-gold/60 text-center">
                                                Available days: {getAvailableWeekdays().map(day => day.charAt(0).toUpperCase()).join(', ')}
                                                <br />
                                                <span className="text-mentat-gold/40">
                                                    Range: {formData.startDate} to {formData.endDate}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Show status when weekly pattern is not set */}
                                {!showWeeklyPattern && formData.startDate && formData.endDate && (
                                    <div className="text-xs text-mentat-gold/50 text-center bg-white/5 border border-mentat-gold/10 rounded-md p-2">
                                        ✅ No weekly pattern set - test window will run for the entire date range
                                    </div>
                                )}
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
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
