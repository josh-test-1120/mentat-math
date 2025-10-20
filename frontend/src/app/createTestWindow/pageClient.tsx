// @author Telmen Enkhtuvshin
// @description Create Test Window Component for testWindow page Instructor Calendar
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify';
import { apiHandler } from "@/utils/api";

// Course type definition
type Course = {
    courseId: number;  // Changed from courseID to courseId to match backend data
    courseName: string;
    courseSection: string;
    courseYear: number;
    courseQuarter: string;
    courseProfessorId: number;  // Changed from string to number to match backend
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
    onCancel: () => void;
}

export default function CreateTestWindowClient({ 
    courses = [],
    exams = [],
    initialFormData = {},
    selectedCourseId,
    onTestWindowCreated,
    onCancel
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
        courseId: initialFormData.courseId || (selectedCourseId ? parseInt(selectedCourseId.toString(), 10) : 0),
        examId: initialFormData.examId || 0,
        startDate: initialFormData.startDate || '',
        endDate: initialFormData.endDate || '',
        startTime: initialFormData.startTime || '',
        endTime: initialFormData.endTime || '',
        isActive: initialFormData.isActive !== undefined ? initialFormData.isActive : true
    });

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

    // Update form data when initialFormData changes
    useEffect(() => {
        if (initialFormData && Object.keys(initialFormData).length > 0) {
            setFormData(prev => ({
                ...prev,
                ...initialFormData,
                courseId: selectedCourseId ? parseInt(selectedCourseId.toString(), 10) : (initialFormData.courseId || prev.courseId)
            }));
        }
    }, [selectedCourseId, initialFormData]);

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

    // Debug courses array and initial form data
    useEffect(() => {
        console.log('Courses loaded:', courses);
        console.log('Course IDs:', courses.map(c => ({ id: c.courseId, name: c.courseName, type: typeof c.courseId })));
        console.log('Initial form data received:', initialFormData);
        console.log('Current form data:', formData);
    }, [courses, initialFormData, formData]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        console.log('Input change detected:', { name, value, type, coursesLength: courses.length });
        
        let processedValue;
        if (type === 'checkbox') {
            processedValue = checked;
        } else if (name === 'courseId') {
            // Convert courseId to integer, but only if value is not empty
            const parsedValue = parseInt(value, 10);
            processedValue = isNaN(parsedValue) ? 0 : parsedValue;
            console.log('Course selection changed:', { name, value, processedValue, type: typeof processedValue, isNaN: isNaN(parsedValue) });
        } else if (type === 'date') {
            // Validate date input - ensure year is 4 digits
            if (value && value.length > 0) {
                const year = value.split('-')[0];
                if (year && year.length > 4) {
                    // If year has more than 4 digits, truncate to 4 digits
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
        
        setFormData(prev => {
            // Create a new form data object by spreading the previous state
            // This ensures we don't mutate the original state (React best practice)
            const newFormData = {
                // Copy all existing form fields (windowName, description, etc.)
                ...prev,
                // Update only the specific field that changed
                // name expresses any field name, value expresses the new value
                [name]: processedValue
            };
            // Log the updated form data to help with debugging
            console.log('Form data updated:', newFormData);
            // Return the new form data to update the state
            return newFormData;
        });
    };

    // Handle weekly pattern checkbox changes
    const handleWeeklyPatternChange = (day: string) => {
        setWeeklyPattern(prev => ({
            ...prev,
            [day]: !prev[day as keyof typeof prev]
        }));
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
        const endDateCopy = new Date(endDate);
        
        console.log('Loop details:', {
            startDate: startDate.toDateString(),
            endDate: endDate.toDateString(),
            startTime: startDate.getTime(),
            endTime: endDate.getTime()
        });
        
        // Loop through each day from start to end (inclusive)
        while (currentDate <= endDate) {
            const dayIndex = currentDate.getDay();
            availableDays.add(dayNames[dayIndex]);
            console.log('Adding day:', {
                date: currentDate.toDateString(),
                dayIndex,
                dayName: dayNames[dayIndex],
                isStartDate: currentDate.getTime() === startDate.getTime(),
                isEndDate: currentDate.getTime() === endDate.getTime()
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log('Date range analysis:', {
            startDateString: formData.startDate,
            endDateString: formData.endDate,
            startDate: startDate,
            endDate: endDate,
            startDayOfWeek: dayNames[startDate.getDay()],
            endDayOfWeek: dayNames[endDate.getDay()],
            availableDays: Array.from(availableDays),
            totalDays: availableDays.size
        });

        return Array.from(availableDays);
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
            
            console.log('Start date string:', formData.startDate);
            console.log('Parsed date:', startDate);
            console.log('Day index:', dayIndex);
            console.log('Day name:', dayName);
            console.log('Expected: Tuesday should be index 2');
            
            setWeeklyPattern(prev => ({
                ...prev,
                [dayName]: true
            }));
        }
        setShowWeeklyPattern(!showWeeklyPattern);
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

        // Validate date range (using local timezone parsing)
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

        // Weekly pattern is optional - no need to force selection
        // Users can create test windows without setting a weekly pattern
        
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
                
                console.log('Auto-selecting start date weekday:', dayName);
                finalWeeklyPattern = { ...weeklyPattern, [dayName]: true };
            }
            
            const requestData = {
                windowName: formData.windowName,
                description: formData.description,
                courseId: formData.courseId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
                weekdays: JSON.stringify(finalWeeklyPattern),
                exceptions: "{}",
                isActive: formData.isActive
            };
            
            console.log('Sending test window data:', requestData);
            console.log('Current form data:', formData);
            console.log('Available courses:', courses);
            console.log('User session:', session);
            console.log('User accessToken:', session?.user?.accessToken);
            console.log('AccessToken type:', typeof session?.user?.accessToken);
            console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_API);
            
            const response = await apiHandler(
                requestData,
                'POST',
                'api/test-window/create',
                process.env.NEXT_PUBLIC_BACKEND_API || '',
                session?.user?.accessToken || undefined
            );
            
            console.log('API Response:', response);
            
            if (response?.error) {
                console.error('Error creating test window:', response);
                toast.error(response.message || 'Failed to create test window');
                return;
            }
            
            console.log('Test window created successfully:', response);
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
                    onClick={onCancel}
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