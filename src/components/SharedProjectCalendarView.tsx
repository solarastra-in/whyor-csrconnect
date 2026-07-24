import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, HeartHandshake, 
  ChevronLeft, ChevronRight, Filter, Sparkles, CheckCircle2, 
  Share2, CalendarDays, ExternalLink, Plus, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/src/pages/DiscoverProjects';

export interface CalendarDriveEvent {
  id: string;
  projectId: string;
  title: string;
  charity: string;
  dateStr: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  category: 'Environment' | 'Education' | 'Healthcare' | 'Clean Energy' | 'Community';
  type: 'On-site Drive' | 'Remote Webinar' | 'Orientation' | 'Registration Deadline';
  spotsTotal: number;
  spotsPledged: number;
  description: string;
}

const INITIAL_CALENDAR_EVENTS: CalendarDriveEvent[] = [
  {
    id: 'cal-1',
    projectId: 'proj-1',
    title: 'Riverbank Clean Ganga Cleanup Drive',
    charity: 'EcoBharat Foundation',
    dateStr: '2026-07-25',
    startTime: '08:00 AM',
    endTime: '12:00 PM',
    location: 'Ganga Ghats, Varanasi, UP',
    category: 'Environment',
    type: 'On-site Drive',
    spotsTotal: 50,
    spotsPledged: 38,
    description: 'On-site morning riverbank cleanup crew with water quality sampling workshops.'
  },
  {
    id: 'cal-2',
    projectId: 'proj-2',
    title: 'Python Coding Mentor Orientation',
    charity: 'Shiksha India Trust',
    dateStr: '2026-07-26',
    startTime: '04:00 PM',
    endTime: '05:30 PM',
    location: 'Remote (Google Meet)',
    category: 'Education',
    type: 'Remote Webinar',
    spotsTotal: 25,
    spotsPledged: 20,
    description: 'Online orientation for volunteer tutors teaching Python basics to high school students.'
  },
  {
    id: 'cal-3',
    projectId: 'proj-3',
    title: 'Miyawaki Micro-Forest Sapling Planting',
    charity: 'Green Canopy Initiative',
    dateStr: '2026-07-28',
    startTime: '07:30 AM',
    endTime: '11:00 AM',
    location: 'Central Biodiversity Park, Gurugram',
    category: 'Environment',
    type: 'On-site Drive',
    spotsTotal: 40,
    spotsPledged: 35,
    description: 'Soil preparation and planting of 500 native sapling species.'
  },
  {
    id: 'cal-4',
    projectId: 'proj-4',
    title: 'Solar Micro-Grid Installation Workshop',
    charity: 'Surya Jyoti Alliance',
    dateStr: '2026-07-30',
    startTime: '09:00 AM',
    endTime: '03:00 PM',
    location: 'Ranchi Vocational Centre, Jharkhand',
    category: 'Clean Energy',
    type: 'On-site Drive',
    spotsTotal: 20,
    spotsPledged: 14,
    description: 'Hands-on technical workshop for mounting off-grid village solar lighting kits.'
  },
  {
    id: 'cal-5',
    projectId: 'proj-5',
    title: 'Preventive Health Screening Camp',
    charity: 'HealthFirst India',
    dateStr: '2026-08-01',
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    location: 'Community Centre, Pune',
    category: 'Healthcare',
    type: 'On-site Drive',
    spotsTotal: 30,
    spotsPledged: 28,
    description: 'Registration, eye testing, and health check support for daily wage workers.'
  },
  {
    id: 'cal-6',
    projectId: 'proj-2',
    title: 'Youth Coding Bootcamp - Week 1 Class',
    charity: 'Shiksha India Trust',
    dateStr: '2026-08-02',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Remote (Zoom)',
    category: 'Education',
    type: 'Remote Webinar',
    spotsTotal: 15,
    spotsPledged: 12,
    description: 'Live breakout teaching sessions on programming logic and HTML.'
  }
];

interface SharedProjectCalendarViewProps {
  projects?: Project[];
}

export function SharedProjectCalendarView({ projects }: SharedProjectCalendarViewProps) {
  const [events, setEvents] = useState<CalendarDriveEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarDriveEvent | null>(null);
  const [pledgedEvents, setPledgedEvents] = useState<string[]>([]);

  // Current display month state (Defaulting to July 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed: 6 is July

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const filteredEvents = events.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  const handlePledgeDrive = (evt: CalendarDriveEvent) => {
    if (pledgedEvents.includes(evt.id)) {
      toast.info('You have already pledged for this upcoming drive session!');
      return;
    }

    setPledgedEvents(prev => [...prev, evt.id]);
    setEvents(prev => prev.map(item => item.id === evt.id ? { ...item, spotsPledged: item.spotsPledged + 1 } : item));
    toast.success(`Registered for ${evt.title}!`, {
      description: `Added to your volunteer calendar. Location: ${evt.location}`
    });
    setSelectedEvent(null);
  };

  // Generate Calendar Grid Days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const calendarGrid = [];
  // Padding for previous month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarGrid.push({ dayNumber: null, dateStr: '' });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    calendarGrid.push({ dayNumber: d, dateStr });
  }

  const categoryColors = {
    Environment: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200',
    Education: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
    Healthcare: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
    'Clean Energy': 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
    Community: 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200',
  };

  return (
    <Card className="border border-indigo-100 shadow-md bg-white overflow-hidden my-6">
      <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-400 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 border-0 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" /> Shared Project Calendar
              </Badge>
              <span className="text-xs text-indigo-200 font-medium">Visual Volunteer Schedule</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Upcoming Volunteer Drives & Sessions
            </CardTitle>
            <CardDescription className="text-xs text-indigo-200">
              Browse company-wide CSR events, reserve slots, and sync schedules directly with your personal calendar.
            </CardDescription>
          </div>

          {/* Month Navigation & Category Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white/10 text-white border-white/20 font-medium text-xs h-9 w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Causes</SelectItem>
                <SelectItem value="Environment">🌱 Environment</SelectItem>
                <SelectItem value="Education">📚 Education</SelectItem>
                <SelectItem value="Healthcare">🏥 Healthcare</SelectItem>
                <SelectItem value="Clean Energy">⚡ Clean Energy</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
              <Button
                onClick={handlePrevMonth}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-xs font-bold px-2 text-amber-300 min-w-[100px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>

              <Button
                onClick={handleNextMonth}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 uppercase pb-2 border-b border-slate-200">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 auto-rows-fr">
          {calendarGrid.map((cell, index) => {
            if (!cell.dayNumber) {
              return (
                <div key={`empty-${index}`} className="min-h-[90px] sm:min-h-[110px] bg-slate-50/50 rounded-xl p-1.5 border border-slate-100" />
              );
            }

            const dayEvents = filteredEvents.filter(e => e.dateStr === cell.dateStr);
            const isToday = cell.dateStr === '2026-07-24';

            return (
              <div
                key={cell.dateStr}
                className={`min-h-[90px] sm:min-h-[110px] rounded-xl p-1.5 sm:p-2 border transition-all flex flex-col justify-between ${
                  isToday 
                    ? 'bg-indigo-50/60 border-indigo-400 ring-1 ring-indigo-300' 
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                  }`}>
                    {cell.dayNumber}
                  </span>
                  {dayEvents.length > 0 && (
                    <Badge variant="outline" className="text-[9px] bg-indigo-50 text-indigo-700 border-indigo-200 px-1 py-0 font-bold">
                      {dayEvents.length} {dayEvents.length === 1 ? 'drive' : 'drives'}
                    </Badge>
                  )}
                </div>

                {/* Events list in cell */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-[75px] scrollbar-thin">
                  {dayEvents.map(evt => {
                    const isPledged = pledgedEvents.includes(evt.id);
                    const colorStyle = categoryColors[evt.category] || 'bg-slate-100 text-slate-800 border-slate-300';

                    return (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left p-1 sm:p-1.5 rounded-lg border text-[10px] font-semibold transition-all truncate block shadow-2xs ${colorStyle} ${
                          isPledged ? 'ring-2 ring-emerald-500 font-extrabold' : ''
                        }`}
                        title={`${evt.title} (${evt.startTime})`}
                      >
                        <div className="truncate font-bold leading-tight">
                          {isPledged && '✓ '}{evt.title}
                        </div>
                        <div className="text-[9px] opacity-80 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" /> {evt.startTime}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Agenda View / List of Upcoming Drives */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Upcoming Volunteer Drives Agenda
            </h4>
            <span className="text-xs text-slate-500">Showing {filteredEvents.length} events</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEvents.map(evt => {
              const isPledged = pledgedEvents.includes(evt.id);

              return (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[10px] bg-white font-bold text-indigo-800 border-indigo-200">
                        {evt.category}
                      </Badge>
                      <Badge className="bg-slate-900 text-white text-[10px]">
                        {evt.type}
                      </Badge>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900 group-hover:text-indigo-900 transition-colors">
                      {evt.title}
                    </h5>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{evt.dateStr} ({evt.startTime} - {evt.endTime})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        <strong>{evt.spotsPledged}</strong> / {evt.spotsTotal} pledged
                      </span>

                      <Button
                        onClick={() => handlePledgeDrive(evt)}
                        disabled={isPledged}
                        size="sm"
                        className={`text-xs h-7 font-bold px-3 ${
                          isPledged 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-100' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isPledged ? '✓ Pledged' : 'Join Drive'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px] border-0">
                  {selectedEvent.category}
                </Badge>
                <span className="text-xs text-indigo-200">{selectedEvent.type}</span>
              </div>
              <DialogTitle className="text-lg font-extrabold text-white mt-1">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-indigo-200">
                Organized by {selectedEvent.charity}
              </DialogDescription>
            </div>

            <div className="p-5 space-y-4 bg-white text-xs leading-relaxed text-slate-700">
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedEvent.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  <span>Date: {selectedEvent.dateStr}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Time: {selectedEvent.startTime} – {selectedEvent.endTime}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Location: {selectedEvent.location}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Capacity: {selectedEvent.spotsPledged} / {selectedEvent.spotsTotal} spots filled</span>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.success('Calendar event downloaded (.ics format)');
                  }}
                  className="text-xs gap-1.5 w-full sm:w-auto"
                >
                  <Share2 className="w-3.5 h-3.5" /> Export to iCal / Outlook
                </Button>

                <Button
                  onClick={() => handlePledgeDrive(selectedEvent)}
                  disabled={pledgedEvents.includes(selectedEvent.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 w-full sm:w-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 
                  {pledgedEvents.includes(selectedEvent.id) ? 'Already Pledged' : 'Confirm Volunteer Pledge'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}
