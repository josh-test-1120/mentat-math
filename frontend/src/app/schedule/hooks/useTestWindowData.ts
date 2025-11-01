import { useState, useCallback } from 'react';
import { apiHandler } from '@/utils/api';

// Course type definition
export type Course = {
    courseId: number;
    courseName: string;
    courseSection: string;
    courseYear: number;
    courseQuarter: string;
    courseProfessorId: number;  // Changed from string to number to match backend
};

/**
 * Custom hook for managing instructor courses data
 */
export const useInstructorCourses = (session: any, status: string, backendApi: string) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch instructor courses
     */
    const fetchInstructorCourses = useCallback(async () => {
        if (status !== 'authenticated') {
            console.log('Not authenticated, status:', status);
            return;
        }
        if (session.id && session.accessToken) {
            try {
                setLoading(true);
                setError(null);

                console.log('Session data:', {
                    userId: session.id,
                    accessToken: session.accessToken !== '' ? 'Present' : 'Missing',
                    tokenLength: session.accessToken.length || 0
                });

                const res = await apiHandler(
                    undefined,
                    'GET',
                    `api/course/listCourses?id=${session.id}`,
                    `${backendApi}`,
                    session.accessToken
                );

                if (res?.error) {
                    console.error('List Instructor Courses failed:', res);
                    setError(res.message || 'Failed to fetch courses');
                    return;
                }

                console.log('Instructor courses response:', res);

                // Handle different response formats
                let coursesData = [];

                if (Array.isArray(res)) {
                    coursesData = res;
                } else if (res && Array.isArray(res.data)) {
                    coursesData = res.data;
                } else if (res && Array.isArray(res.result)) {
                    coursesData = res.result;
                } else if (res && typeof res === 'object') {
                    coursesData = Object.values(res).filter(c => c && typeof c === 'object');
                }

                console.log('Processed instructor courses:', coursesData);
                setCourses(coursesData);

            } catch (e) {
                console.error('Error fetching instructor courses:', e);
                setError('Failed to fetch courses');
                setCourses([]);
            } finally {
                setLoading(false);
            }
        } else {
            console.log('Missing required session data:', {
                userId: session.id !== '' ? 'Present' : 'Missing',
                accessToken: session.accessToken !== '' ? 'Present' : 'Missing'
            });
            setError('Missing authentication token');
            setLoading(false);
        }
    }, [session.id, session.accessToken, status, backendApi]);

    return {
        courses,
        loading,
        error,
        fetchInstructorCourses
    };
};

/**
 * Custom hook for managing test windows data
 */
export const useTestWindows = (session: any, backendApi: string) => {
    const [testWindows, setTestWindows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * Fetch test windows for selected course
     */
    const fetchTestWindows = useCallback(async (courseId: number, options?: { silent?: boolean, force?: boolean }) => {
        if (!courseId) {
            console.log('No course ID provided, skipping fetch');
            return;
        }

        if (session.accessToken === '') {
            console.log('No access token available, skipping fetch');
            return;
        }

        try {
            console.log('🔄 Fetching test windows for course:', courseId, options?.force ? '(FORCED)' : '');
            
            // If not silent, set loading to true
            if (!options?.silent) {
                setLoading(true);
            }

            // Add timestamp to prevent caching
            const timestamp = options?.force ? `?t=${Date.now()}` : '';
            const endpoint = `api/test-window/course/${courseId}${timestamp}`;

            const res = await apiHandler(
                undefined,
                'GET',
                endpoint,
                `${backendApi}`,
                session.accessToken
            );

            if (res?.error) {
                console.error('❌ Failed to fetch test windows:', res);
                setTestWindows([]);
                return;
            }

            const testWindowsData = Array.isArray(res) ? res : [];
            console.log(`✅ Fetched ${testWindowsData.length} test windows`);

            // If force refresh, always update state
            if (options?.force) {
                console.log('🔄 Force refresh - updating state regardless of changes');
                setTestWindows(testWindowsData);
                return;
            }

            // Only update state if data has actually changed
            setTestWindows(prevTestWindows => {
                if (prevTestWindows.length !== testWindowsData.length) {
                    console.log('📊 Test windows count changed, updating state');
                    return testWindowsData;
                }

                // Check if any test window data has changed (more comprehensive check)
                const hasChanges = testWindowsData.some((newTw, index) => {
                    const oldTw = prevTestWindows[index];
                    return !oldTw ||
                        oldTw.testWindowId !== newTw.testWindowId ||
                        oldTw.testWindowTitle !== newTw.testWindowTitle ||
                        oldTw.testWindowStartDate !== newTw.testWindowStartDate ||
                        oldTw.testWindowEndDate !== newTw.testWindowEndDate ||
                        oldTw.testStartTime !== newTw.testStartTime ||
                        oldTw.testEndTime !== newTw.testEndTime ||
                        oldTw.weekdays !== newTw.weekdays ||
                        oldTw.isActive !== newTw.isActive;
                });

                if (hasChanges) {
                    console.log('🔄 Test windows data changed, updating state');
                    return testWindowsData;
                }

                console.log('✅ No changes detected, skipping state update');
                return prevTestWindows;
            });

        } catch (e) {
            console.error('❌ Error fetching test windows:', e);
            setTestWindows([]);
        } finally {
            // If not silent, set loading to false
            if (!options?.silent) {
                setLoading(false);
            }
        }
    }, [session.accessToken, backendApi]);

    return {
        testWindows,
        loading,
        fetchTestWindows
    };
};
