'use client';

import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';

interface TestWindowEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    courseId?: number;
    examId?: number;
    description?: string;
    maxAttempts?: number;
    isActive?: boolean;
  };
}

interface TestWindowCalendarProps {
  events?: TestWindowEvent[];
  onEventCreate?: (info: { start: string; end: string; allDay: boolean }) => void;
  onEventClick?: (info: EventClickArg) => void;
  onEventUpdate?: (info: { id: string; start: string; end: string }) => void;
  onEventDelete?: (info: { id: string }) => void;
  onDateClick?: (info: { dateStr: string }) => void;
  editable?: boolean;
  selectable?: boolean;
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  height?: string | number;
}

export default function TestWindowCalendar({
  events = [],
  onEventCreate,
  onEventClick,
  onEventUpdate,
  onEventDelete,
  onDateClick,
  editable = true,
  selectable = true,
  initialView = 'timeGridWeek',
  height = 'auto',
}: TestWindowCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle date selection (click and drag to create)
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onEventCreate) {
      const { start, end, allDay } = selectInfo;
      
      // Calculate duration
      const duration = end.getTime() - start.getTime();
      const minDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      // Only create if selection is at least 30 minutes
      if (duration >= minDuration) {
        onEventCreate({
          start: start.toISOString(),
          end: end.toISOString(),
          allDay: allDay
        });
      } else {
        // Show toast for minimum duration
        console.warn('Minimum selection duration is 30 minutes');
      }
    }
    
    // Clear the selection
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.unselect();
    }
  };

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    if (onEventClick) {
      onEventClick(clickInfo);
    }
  };

  // Handle event drop (move event)
  const handleEventDrop = (dropInfo: EventDropArg) => {
    if (onEventUpdate) {
      const { event } = dropInfo;
      onEventUpdate({
        id: event.id,
        start: event.start?.toISOString() || '',
        end: event.end?.toISOString() || ''
      });
    }
  };

  // Handle event resize
  const handleEventResize = (resizeInfo: any) => {
    if (onEventUpdate) {
      const { event } = resizeInfo;
      onEventUpdate({
        id: event.id,
        start: event.start?.toISOString() || '',
        end: event.end?.toISOString() || ''
      });
    }
  };

  // Handle event delete
  const handleEventRemove = (removeInfo: any) => {
    if (onEventDelete) {
      onEventDelete({ id: removeInfo.event.id });
    }
  };

  // Handle date click
  const handleDateClick = (info: any) => {
    if (onDateClick) {
      onDateClick({ dateStr: info.dateStr });
    }
  };

  // Custom event rendering
  const eventContent = (arg: any) => {
    const { event } = arg;
    const isActive = event.extendedProps?.isActive !== false;
    
    return (
      <div className={`p-1 text-xs ${isActive ? 'text-white' : 'text-gray-400'}`}>
        <div className="font-semibold truncate">{event.title}</div>
        {event.extendedProps?.description && (
          <div className="text-xs opacity-75 truncate">
            {event.extendedProps.description}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-mentat-black text-mentat-gold border border-mentat-gold/20 rounded-xl p-4 h-[600px] w-full overflow-hidden">
      <style jsx global>{`
        /* Custom FullCalendar Styling */
        .fc {
          --fc-border-color: rgba(255, 215, 0, 0.1) !important; /* Dimmed gold borders */
          --fc-today-bg-color: rgba(255, 215, 0, 0.05) !important; /* Dimmed today background */
          --fc-neutral-bg-color: rgba(255, 215, 0, 0.02) !important; /* Dimmed neutral background */
          --fc-list-event-hover-bg-color: rgba(255, 215, 0, 0.1) !important; /* Dimmed hover */
        }
        
        /* Grid lines - make them solid instead of dashed */
        .fc .fc-daygrid-day-frame,
        .fc .fc-timegrid-slot,
        .fc .fc-timegrid-slot-lane,
        .fc .fc-timegrid-slot-minor,
        .fc .fc-col-header-cell,
        .fc .fc-scrollgrid-sync-table,
        .fc .fc-scrollgrid-section > * {
          border-style: solid !important;
          border-color: rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Day grid borders */
        .fc .fc-daygrid-day {
          border-color: rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Time grid borders */
        .fc .fc-timegrid-slot {
          border-color: rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Column headers */
        .fc .fc-col-header-cell {
          border-color: rgba(255, 215, 0, 0.1) !important;
          background-color: rgba(255, 215, 0, 0.05) !important;
        }
        
        /* Event borders */
        .fc .fc-event {
          border-color: rgba(255, 215, 0, 0.2) !important;
        }
        
        /* Selection styling */
        .fc .fc-highlight {
          background-color: rgba(255, 215, 0, 0.1) !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
        }
        
        /* Button styling */
        .fc .fc-button {
          background-color: rgba(255, 215, 0, 0.1) !important;
          border-color: rgba(255, 215, 0, 0.2) !important;
          color: #ffd700 !important;
        }
        
        .fc .fc-button:hover {
          background-color: rgba(255, 215, 0, 0.2) !important;
          border-color: rgba(255, 215, 0, 0.3) !important;
        }
        
        .fc .fc-button:focus {
          box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3) !important;
        }
        
        /* Text colors */
        .fc .fc-col-header-cell-cushion,
        .fc .fc-daygrid-day-number,
        .fc .fc-timegrid-slot-label {
          color: rgba(255, 215, 0, 0.8) !important;
        }
        
        /* Time label alignment fixes */
        .fc .fc-timegrid-slot-label {
          text-align: right !important;
          padding-right: 8px !important;
          vertical-align: top !important;
          line-height: 1 !important;
          font-size: 12px !important;
        }
        
        /* Align time labels with their corresponding slots */
        .fc .fc-timegrid-slot-label-frame {
          display: flex !important;
          align-items: flex-start !important;
          justify-content: flex-end !important;
          height: 100% !important;
          padding-top: 2px !important;
        }
        
        /* Ensure time slots align properly */
        .fc .fc-timegrid-slot {
          height: 2em !important;
          min-height: 2em !important;
        }
        
        /* Minor time slots alignment */
        .fc .fc-timegrid-slot-minor {
          height: 1em !important;
          min-height: 1em !important;
        }
        
        /* Time axis column width */
        .fc .fc-timegrid-axis {
          width: 60px !important;
          min-width: 60px !important;
        }
        
        /* Ensure proper alignment for time labels */
        .fc .fc-timegrid-slot-label-cushion {
          display: block !important;
          transform: translateY(-1px) !important;
        }
        
        /* Today styling */
        .fc .fc-day-today {
          background-color: rgba(255, 215, 0, 0.05) !important;
        }
        
        /* Event text */
        .fc .fc-event-title {
          color: #ffffff !important;
        }
        
        /* Remove dashed lines completely */
        .fc .fc-timegrid-slot-minor {
          border-top: 1px solid rgba(255, 215, 0, 0.1) !important;
        }
        
        /* Make all grid lines solid */
        .fc .fc-scrollgrid {
          border-style: solid !important;
        }
        
        .fc .fc-scrollgrid-section > * {
          border-style: solid !important;
        }
        
        /* Calendar container height and scrolling */
        .fc {
          height: 100% !important;
          max-height: 100% !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* Responsive calendar layout */
        .fc .fc-scrollgrid {
          width: 100% !important;
          table-layout: fixed !important;
        }
        
        .fc .fc-col-header-cell {
          width: auto !important;
          min-width: 0 !important;
        }
        
        .fc .fc-timegrid-slot {
          width: 100% !important;
        }
        
        /* Make calendar scrollable */
        .fc .fc-scroller {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        /* Time grid specific scrolling */
        .fc .fc-timegrid-body {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        /* Ensure proper height for 24-hour view */
        .fc .fc-timegrid-slot {
          height: 1.5em !important;
          min-height: 1.5em !important;
        }
        
        .fc .fc-timegrid-slot-minor {
          height: 0.75em !important;
          min-height: 0.75em !important;
        }
      `}</style>
      
      {/* Instructions */}
      <div className="mb-4 p-3 bg-mentat-gold/10 rounded-lg border border-mentat-gold/20">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-mentat-gold">💡</span>
          <span>
            <strong>Tip:</strong> Click and drag on the calendar to create test windows. 
            Minimum duration is 30 minutes.
          </span>
        </div>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        height="100%"
        events={events}
        
        // Interaction settings
        selectable={selectable}
        selectMirror={true}
        editable={editable}
        droppable={true}
        
        // Event handlers
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventRemove={handleEventRemove}
        dateClick={handleDateClick}
        
        // Display settings
        dayMaxEvents={3}
        weekends={true}
        
        // Styling
        themeSystem="standard"
        
        // Custom event content
        eventContent={eventContent}
        
        // Selection styling
        selectOverlap={false}
        selectConstraint={{
          start: '06:00',
          end: '22:00',
          daysOfWeek: [1, 2, 3, 4, 5, 6, 0] // All days
        }}
        
        // Time grid settings for 24-hour view
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        slotDuration="01:00:00"
        snapDuration="00:15:00"
        slotLabelInterval="01:00:00"
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }}
        
        // Business hours
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: '08:00',
          endTime: '18:00',
        }}
        
        // Event styling
        eventClassNames={(arg) => {
          const isActive = arg.event.extendedProps?.isActive !== false;
          return [
            'cursor-pointer',
            'hover:opacity-80',
            'transition-opacity',
            isActive ? 'opacity-100' : 'opacity-60'
          ];
        }}
        
        // Selection styling
        selectLongPressDelay={100}
        selectMinDistance={5}
        
        // Event overlap settings
        eventOverlap={false}
        eventConstraint={{
          start: '06:00',
          end: '22:00',
          daysOfWeek: [1, 2, 3, 4, 5, 6, 0]
        }}
        
        // Custom CSS
        eventDisplay="block"
        eventStartEditable={editable}
        eventDurationEditable={editable}
        eventResizableFromStart={false}
        
        // Timezone
        timeZone="local"
        
        // Locale
        locale="en"
        
        // Week numbers
        weekNumbers={true}
        weekNumberFormat={{ week: 'short' }}
        
        // Day cell content
        dayCellContent={(arg) => {
          return (
            <div className="text-center">
              <div className="font-semibold">{arg.dayNumberText}</div>
            </div>
          );
        }}
      />
    </div>
  );
}
