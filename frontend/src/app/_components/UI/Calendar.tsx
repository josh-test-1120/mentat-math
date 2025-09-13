'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// import '@fullcalendar/core/index.css';
// import '@fullcalendar/daygrid/index.css';
// import '@fullcalendar/timegrid/index.css';

export default function Calendar({
  events = [],
  onDateClick,
  onEventClick,
}: {
  events?: { title: string; start: string; end?: string }[];
  onDateClick?: (info: { dateStr: string }) => void;
  onEventClick?: (info: any) => void;
}) {
  return (
    <div className="bg-mentat-black text-mentat-gold border border-mentat-gold/20 rounded-xl p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        height="auto"
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
        themeSystem="standard"
      />
    </div>
  );
}