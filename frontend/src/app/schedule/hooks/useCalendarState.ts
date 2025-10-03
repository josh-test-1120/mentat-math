import { useCallback, useRef } from 'react';

/**
 * Custom hook for managing calendar state persistence
 * Handles saving and restoring calendar view position and scroll state
 */
export const useCalendarState = () => {
    const savedCalendarStateRef = useRef<{
        date: Date | null;
        view: string | null;
        scrollTop: number | null;
    }>({
        date: null,
        view: null,
        scrollTop: null
    });

    /**
     * Save current calendar view and scroll position
     * @param calendarApi - FullCalendar API instance
     */
    const saveCalendarState = useCallback((calendarApi: any) => {
        if (!calendarApi) return;
        
        const currentDate = calendarApi.getDate();
        const currentView = calendarApi.view.type;
        const scroller = document.querySelector('.fc .fc-timegrid-body .fc-scroller') as HTMLElement | null;
        const currentScrollTop = scroller ? scroller.scrollTop : null;

        savedCalendarStateRef.current = {
            date: currentDate,
            view: currentView,
            scrollTop: currentScrollTop
        };

        console.log('Saved calendar state (helper):', {
            date: currentDate.toISOString(),
            view: currentView,
            scrollTop: currentScrollTop
        });
    }, []);

    /**
     * Restore previously saved calendar view and scroll position
     * @param calendarApi - FullCalendar API instance
     */
    const restoreCalendarState = useCallback((calendarApi: any) => {
        if (!calendarApi) return;
        
        const { date, view, scrollTop } = savedCalendarStateRef.current;
        if (!date) return;

        try {
            if (view) {
                calendarApi.changeView(view, date);
                console.log('Restored calendar view:', view, date.toISOString());
            } else {
                calendarApi.gotoDate(date);
                console.log('Restored calendar date:', date.toISOString());
            }
        } catch (e) {
            console.warn('Failed to restore calendar view/date immediately, will retry scroll only.', e);
        }

        if (scrollTop !== null) {
            const attemptRestoreScroll = () => {
                const newScroller = document.querySelector('.fc .fc-timegrid-body .fc-scroller') as HTMLElement | null;
                if (newScroller) {
                    newScroller.scrollTop = scrollTop;
                    return true;
                }
                return false;
            };

            // Try immediately and then with small delays to account for DOM updates
            if (!attemptRestoreScroll()) {
                [30, 80, 150, 300, 600].forEach((delay) => {
                    setTimeout(() => {
                        attemptRestoreScroll();
                    }, delay);
                });
            }
        }
    }, []);

    return {
        saveCalendarState,
        restoreCalendarState
    };
};
