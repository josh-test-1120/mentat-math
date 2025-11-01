import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { apiHandler } from '@/utils/api';

export type DeleteScope = 'single' | 'following' | 'all';

export type ActiveTestWindow = {
    id: number;
    title: string;
    clickedDate?: string;
};

/**
 * Custom hook for managing delete functionality and modal state
 */
export const useDeleteActions = (
    session: any,
    backendApi: string,
    selectedCourseId: number | null,
    fetchTestWindows: (courseId: number, options?: { silent?: boolean }) => Promise<void>,
    restoreCalendarState: (calendarApi: any) => void,
    saveCalendarState: (calendarApi: any) => void,
    updateCalendarEvents: (updater: (prev: any[]) => any[]) => void
) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteScope, setDeleteScope] = useState<DeleteScope>('single');
    const [activeTestWindow, setActiveTestWindow] = useState<ActiveTestWindow | null>(null);

    /**
     * Handle delete confirmation for different scopes
     */
    const handleConfirmDelete = useCallback(async (calendarApi: any) => {
        if (!activeTestWindow) return;
        
        try {
            // Persist current calendar position before any updates
            saveCalendarState(calendarApi);
            
            if (deleteScope === 'all') {
                // Call backend to delete entire test window series
                const res = await apiHandler(
                    undefined,
                    'DELETE',
                    `api/test-window/${activeTestWindow.id}`,
                    `${backendApi}`,
                    session.accessToken
                );

                if (res?.error) {
                    toast.error(res.message || 'Failed to delete test window');
                } else {
                    // Optimistically remove from UI to avoid full rerender
                    updateCalendarEvents((prev) => prev.filter(e => e.extendedProps?.originalId !== activeTestWindow.id));
                    toast.success('Test window deleted', { autoClose: 5000 });
                    // Restore the calendar state immediately after optimistic update
                    restoreCalendarState(calendarApi);
                    // Silent background refresh to ensure consistency
                    if (selectedCourseId) {
                        fetchTestWindows(selectedCourseId, { silent: true }).then(() => {
                            // Re-apply restoration after the background fetch updates events
                            restoreCalendarState(calendarApi);
                        });
                    }
                }
            } else if (deleteScope === 'single') {
                // Use the date from the clicked event stored earlier
                if (!activeTestWindow?.clickedDate) {
                    toast.error('Could not find the clicked event date');
                    return;
                }
                const eventDateStr = activeTestWindow.clickedDate;

                // Backend: add this date to exceptions array
                const res = await apiHandler(
                    { date: eventDateStr },
                    'PATCH',
                    `api/test-window/${activeTestWindow.id}/add-exception`,
                    `${backendApi}`,
                    session.accessToken
                );

                if (res?.error) {
                    toast.error(res.message || 'Failed to delete this event');
                } else {
                    // Optimistically remove only this date's occurrences for this window
                    updateCalendarEvents((prev) => prev.filter(e =>
                        !(e.extendedProps?.originalId === activeTestWindow.id && typeof e.start === 'string' && e.start.startsWith(eventDateStr))
                    ));
                    toast.success('Current day test window successfully deleted', { autoClose: 5000 });
                    // Restore calendar state post optimistic update
                    restoreCalendarState(calendarApi);

                    // Silent background refresh
                    if (selectedCourseId) {
                        fetchTestWindows(selectedCourseId, { silent: true }).then(() => {
                            restoreCalendarState(calendarApi);
                        });
                    }
                }
            } else if (deleteScope === 'following') {
                // Use the stored clicked date from the event click
                if (!activeTestWindow?.clickedDate) {
                    toast.error('Could not find the clicked event date');
                    return;
                }
            
                // Since endDate is inclusive, we need to set it to one day BEFORE the clicked date
                // This way the clicked date and all following dates will be deleted
                // Parse the date in local timezone to avoid UTC conversion issues
                const [year, month, day] = activeTestWindow.clickedDate.split('-').map(Number);
                const clickedDate = new Date(year, month - 1, day); // month is 0-indexed
                clickedDate.setDate(clickedDate.getDate() - 1);
                
                // Format back to YYYY-MM-DD in local timezone
                const eventYear = clickedDate.getFullYear();
                const eventMonth = String(clickedDate.getMonth() + 1).padStart(2, '0');
                const eventDay = String(clickedDate.getDate()).padStart(2, '0');
                const eventDateStr = `${eventYear}-${eventMonth}-${eventDay}`;
                
                console.log('!!!!!!Clicked date:', activeTestWindow.clickedDate);
                console.log('!!!!!!Setting endDate to (one day before):', eventDateStr);
            
                // For "This and following events", set endDate to the clicked event date
                // This will keep all events before and including the clicked event
                const res = await apiHandler(
                    { endDate: eventDateStr },
                    'PATCH',
                    `api/test-window/${activeTestWindow.id}/update-end-date`,
                    `${backendApi}`,
                    session.accessToken
                );
            
                if (res?.error) {
                    toast.error(res.message || 'Failed to delete future events');
                } else {
                    // Optimistically remove future events from UI
                    updateCalendarEvents((prev) => prev.filter(e =>
                        !(e.extendedProps?.originalId === activeTestWindow.id && 
                          e.start >= eventDateStr)
                    ));
                    toast.success('Future events deleted successfully');
                    // Restore calendar state post optimistic update
                    restoreCalendarState(calendarApi);
                    
                    // Silent background refresh
                    if (selectedCourseId) {
                        fetchTestWindows(selectedCourseId, { silent: true }).then(() => {
                            restoreCalendarState(calendarApi);
                        });
                    }
                }
            } else {
                toast.info('Only "All events" and "This event" are implemented right now.');
            }
        } catch (e) {
            toast.error('Error deleting test window');
        } finally {
            setDeleteModalOpen(false);
        }
    }, [
        activeTestWindow,
        deleteScope,
        session.accessToken,
        backendApi,
        selectedCourseId,
        fetchTestWindows,
        restoreCalendarState,
        saveCalendarState
    ]);

    /**
     * Handle opening delete modal
     */
    const handleDeleteTestWindow = useCallback((calendarApi: any) => {
        if (!activeTestWindow) return;
        // Persist calendar position before opening delete modal
        saveCalendarState(calendarApi);
        // Open delete confirmation modal with scope options
        setDeleteModalOpen(true);
    }, [activeTestWindow, saveCalendarState]);

    return {
        deleteModalOpen,
        setDeleteModalOpen,
        deleteScope,
        setDeleteScope,
        activeTestWindow,
        setActiveTestWindow,
        handleConfirmDelete,
        handleDeleteTestWindow
    };
};
