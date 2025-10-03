/**
 * Convert test windows to calendar events
 * @param testWindows - Array of test window objects
 * @returns Array of calendar events
 */
export const convertTestWindowsToEvents = (testWindows: any[]) => {
    const events: any[] = [];

    // Color palette for test windows (in order)
    const colorPalette = [
        { bg: '#3b82f6', border: '#1d4ed8', text: '#000000' }, // Blue
        { bg: '#10b981', border: '#059669', text: '#000000' }, // Green
        { bg: '#f97316', border: '#ea580c', text: '#000000' }, // Orange
        { bg: '#ec4899', border: '#db2777', text: '#000000' }, // Pink
        { bg: '#ffffff', border: '#d1d5db', text: '#000000' }, // White
    ];

    testWindows.forEach((testWindow, index) => {
        // Get color for this test window (cycle through palette)
        const colorIndex = index % colorPalette.length;
        const colors = colorPalette[colorIndex];

        console.log(`Test window ${index + 1}: "${testWindow.testWindowTitle}" assigned color ${colorIndex} (${colors.bg})`);

        try {
            // Parse weekdays pattern and exceptions
            const weekdays = JSON.parse(testWindow.weekdays || '{}');
            let exceptions: string[] = [];
            try {
                const raw = testWindow.exceptions;
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        exceptions = parsed;
                    }
                }
            } catch (_) {
                // ignore malformed exceptions
            }
            const activeDays = Object.keys(weekdays).filter(day => weekdays[day]);

            console.log(`Weekdays object for "${testWindow.testWindowTitle}":`, weekdays);
            console.log(`Active days:`, activeDays);

            if (activeDays.length === 0) {
                // No recurring pattern - skip this test window (don't show on calendar)
                console.log(`Skipping test window with no weekday pattern: "${testWindow.testWindowTitle}"`);
                console.log(`Date: ${testWindow.testWindowStartDate} to ${testWindow.testWindowEndDate}`);
                console.log(`Reason: No active weekdays selected`);
            } else {
                // Create recurring events for each active day
                // Parse dates in local timezone to avoid UTC conversion issues
                const [startYear, startMonth, startDay] = testWindow.testWindowStartDate.split('-').map(Number);
                const [endYear, endMonth, endDay] = testWindow.testWindowEndDate.split('-').map(Number);

                const startDate = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
                const endDate = new Date(endYear, endMonth - 1, endDay);
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

                console.log(`Processing recurring test window: "${testWindow.testWindowTitle}"`);
                console.log(`Date range: ${testWindow.testWindowStartDate} to ${testWindow.testWindowEndDate}`);
                console.log(`Active days:`, activeDays);
                console.log(`Parsed start date:`, startDate.toDateString());
                console.log(`Parsed end date:`, endDate.toDateString());

                // Generate events for each day in the range
                const currentDate = new Date(startDate);
                let eventCount = 0;
                while (currentDate <= endDate) {
                    const dayIndex = currentDate.getDay();
                    const dayName = dayNames[dayIndex];

                    // Format date as YYYY-MM-DD in local timezone
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;

                    console.log(`  Checking ${dayName} (${dateStr}): weekdays[${dayName}] = ${weekdays[dayName]}`);

                    // Skip if date is in exceptions
                    const isException = exceptions.includes(dateStr);
                    if (weekdays[dayName] && !isException) {
                        const startDateTime = `${dateStr}T${testWindow.testStartTime}`;
                        const endDateTime = `${dateStr}T${testWindow.testEndTime}`;

                        eventCount++;
                        console.log(`  Creating event ${eventCount} for ${dayName} (${dateStr}): ${startDateTime} - ${endDateTime}`);

                        events.push({
                            id: `test-window-${testWindow.testWindowId}-${dateStr}`,
                            title: testWindow.testWindowTitle,
                            start: startDateTime,
                            end: endDateTime,
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                            textColor: colors.text,
                            extendedProps: {
                                description: testWindow.description,
                                courseId: testWindow.courseId,
                                isActive: testWindow.isActive,
                                type: 'test-window',
                                originalId: testWindow.testWindowId,
                                colorIndex: colorIndex
                            }
                        });
                    }

                    currentDate.setDate(currentDate.getDate() + 1);
                }
                console.log(`  Total events created for "${testWindow.testWindowTitle}": ${eventCount}`);
            }
        } catch (e) {
            console.error('Error processing test window:', testWindow, e);
        }
    });

    console.log('Converted test windows to events:', events);
    console.log(`Total events created: ${events.length}`);
    console.log('Events by test window:');
    events.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: event.backgroundColor,
            originalId: event.extendedProps?.originalId || 'single-event'
        });
    });
    return events;
};

/**
 * Format date in local timezone to avoid UTC conversion issues
 * @param date - Date object to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Process calendar event creation data from drag and drop
 * @param info - Calendar selection info
 * @param selectedCourseId - Currently selected course ID
 * @returns Processed time data for test window creation
 */
export const processEventCreateData = (info: { start: string; end: string; allDay: boolean }, selectedCourseId: number | null) => {
    const startDate = new Date(info.start);
    const endDate = new Date(info.end);

    return {
        startDate: formatLocalDate(startDate),
        endDate: formatLocalDate(endDate),
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        courseId: selectedCourseId
    };
};
