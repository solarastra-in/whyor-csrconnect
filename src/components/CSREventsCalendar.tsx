import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, MapPin, Users, Video } from 'lucide-react';

type EventType = 'volunteer_drive' | 'webinar' | 'social';

interface CSREvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  location: string;
  attendees: number;
}

const INITIAL_EVENTS: Record<string, CSREvent[]> = {
  'upcoming': [
    { id: 'e1', title: 'Riverbank Cleanup Drive', type: 'volunteer_drive', date: 'Oct 15, 2026', time: '09:00 AM', location: 'Mula-Mutha River', attendees: 45 },
    { id: 'e2', title: 'Tech for Good Webinar', type: 'webinar', date: 'Oct 22, 2026', time: '04:00 PM', location: 'Online', attendees: 120 }
  ],
  'planning': [
    { id: 'e3', title: 'Winter Clothes Donation', type: 'social', date: 'Nov 10, 2026', time: 'All Day', location: 'Main Office Lobby', attendees: 0 }
  ],
  'completed': [
    { id: 'e4', title: 'Tree Plantation Drive', type: 'volunteer_drive', date: 'Sep 05, 2026', time: '08:00 AM', location: 'City Park', attendees: 85 }
  ]
};

const getEventColor = (type: EventType) => {
  switch (type) {
    case 'volunteer_drive': return 'bg-green-100 text-green-800 border-green-200';
    case 'webinar': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'social': return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'volunteer_drive': return <Users className="w-3 h-3 mr-1" />;
    case 'webinar': return <Video className="w-3 h-3 mr-1" />;
    case 'social': return <Calendar className="w-3 h-3 mr-1" />;
  }
};

export function CSREventsCalendar() {
  const [columns, setColumns] = useState(INITIAL_EVENTS);
  const [draggedEvent, setDraggedEvent] = useState<{ id: string, sourceCol: string } | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string, sourceCol: string) => {
    setDraggedEvent({ id, sourceCol });
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag ghost to generate before we might modify styles
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('opacity-50');
    setDraggedEvent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCol: string) => {
    e.preventDefault();
    if (!draggedEvent || draggedEvent.sourceCol === targetCol) return;

    const sourceEvents = [...columns[draggedEvent.sourceCol]];
    const targetEvents = [...columns[targetCol]];
    
    const eventIndex = sourceEvents.findIndex(ev => ev.id === draggedEvent.id);
    if (eventIndex === -1) return;
    
    const [movedEvent] = sourceEvents.splice(eventIndex, 1);
    targetEvents.push(movedEvent);

    setColumns({
      ...columns,
      [draggedEvent.sourceCol]: sourceEvents,
      [targetCol]: targetEvents
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>CSR Events Calendar</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage your corporate social events</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries({
            'planning': 'Planning / Drafts',
            'upcoming': 'Upcoming Events',
            'completed': 'Completed'
          }).map(([colKey, colTitle]) => (
            <div 
              key={colKey} 
              className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 min-h-[500px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, colKey)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{colTitle}</h3>
                <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                  {columns[colKey].length}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {columns[colKey].map((event) => (
                  <div
                    key={event.id}
                    id={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event.id, colKey)}
                    onDragEnd={(e) => handleDragEnd(e, event.id)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`flex items-center text-[10px] uppercase tracking-wider font-semibold ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 leading-tight">{event.title}</h4>
                    
                    <div className="space-y-1.5 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-2 text-gray-400" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center text-xs font-medium text-gray-600">
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        {event.attendees} registered
                      </div>
                      <button className="text-indigo-600 text-xs font-semibold hover:underline">Edit</button>
                    </div>
                  </div>
                ))}
                
                {columns[colKey].length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    Drag events here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
