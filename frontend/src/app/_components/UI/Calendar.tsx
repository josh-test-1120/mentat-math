'use client';

import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';

interface CalendarProps {
  events?: { title: string; start: string; end?: string; id?: string }[];
  onDateClick?: (info: { dateStr: string }) => void;
  onEventClick?: (info: any) => void;
  onEventCreate?: (info: { start: string; end: string; allDay: boolean }) => void;
  onEventUpdate?: (info: { id: string; start: string; end: string }) => void;
  onEventDelete?: (info: { id: string }) => void;
  editable?: boolean;
  selectable?: boolean;
  selectMirror?: boolean;
  dayMaxEvents?: boolean | number;
  weekends?: boolean;
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
}

export default function Calendar({
  events = [],
  onDateClick,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  editable = true,
  selectable = true,
  selectMirror = true,
  dayMaxEvents = true,
  weekends = true,
  initialView = 'dayGridMonth',
}: CalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Handle date selection (click and drag)
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onEventCreate) {
      const { start, end, allDay } = selectInfo;
      
      // Convert to ISO strings for consistency
      const startStr = start.toISOString();
      const endStr = end.toISOString();
      
      onEventCreate({
        start: startStr,
        end: endStr,
        allDay: allDay
      });
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

  // Handle event delete (when event is dropped outside calendar)
  const handleEventRemove = (removeInfo: any) => {
    if (onEventDelete) {
      onEventDelete({ id: removeInfo.event.id });
    }
  };

  return (
    <div className="bg-mentat-black text-mentat-gold border border-mentat-gold/20 rounded-none p-4 h-full w-full">
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
          background-color: transparent !important;
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

        /* Today: red text in header + day number */
        .fc .fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion,
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #ef4444 !important; /* Tailwind red-500 */
        }

        /* Today: red border (dayGrid cell + timeGrid column) */
                /* Today: red border (dayGrid cell + timeGrid column) */
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-frame,
        .fc .fc-timegrid-col.fc-day-today {
          box-shadow: inset 0 0 0 1px #ef4444 !important; /* thinner */
          border-color: #ef4444 !important;
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
        selectMirror={selectMirror}
        editable={editable}
        droppable={true}
        
        // Event handlers
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventRemove={handleEventRemove}
        
        // Display settings
        dayMaxEvents={dayMaxEvents}
        weekends={weekends}
        
        // Styling
        themeSystem="standard"
        
        // Custom CSS classes
        eventClassNames={(arg) => {
          return ['cursor-pointer', 'hover:opacity-80'];
        }}
        
        // Selection styling
        selectOverlap={false}
        selectConstraint={{
          start: '00:00',
          end: '24:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // All days
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
        
        // Business hours (optional)
        // businessHours={{
        //   daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
        //   startTime: '08:00',
        //   endTime: '18:00',
        // }}
      />
    </div>
  );
}