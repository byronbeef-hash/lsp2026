"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassInput, GlassSelect } from "@/components/glass";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  X,
  Save,
} from "lucide-react";
import type { CalendarEvent } from "@/types";
import { useCalendarStore } from "@/stores/modules";

const EVENT_TYPE_COLORS: Record<CalendarEvent["type"], { dot: string; badge: string; badgeVariant: "info" | "warning" | "default" | "success" | "danger" }> = {
  medical: { dot: "bg-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-400/20", badgeVariant: "info" },
  sale: { dot: "bg-amber-400", badge: "bg-amber-500/20 text-amber-300 border-amber-400/20", badgeVariant: "warning" },
  inspection: { dot: "bg-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-400/20", badgeVariant: "default" },
  maintenance: { dot: "bg-orange-400", badge: "bg-orange-500/20 text-orange-300 border-orange-400/20", badgeVariant: "warning" },
  other: { dot: "bg-gray-400", badge: "bg-gray-500/20 text-gray-300 border-gray-400/20", badgeVariant: "default" },
};

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // getDay() returns 0=Sun, we want 0=Mon
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  return { totalDays, startDow };
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const {
    events,
    selectedDate,
    viewMonth,
    viewYear,
    addEvent,
    deleteEvent,
    toggleComplete,
    setSelectedDate,
    setMonth,
    getEventsForDate,
    getEventsForMonth,
  } = useCalendarStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "other" as CalendarEvent["type"],
    date: new Date().toISOString().split("T")[0],
    time: "",
    description: "",
  });

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const { totalDays, startDow } = getMonthData(viewYear, viewMonth);

  // Build calendar cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEvents = getEventsForMonth(viewMonth, viewYear);
  const upcomingEvents = [...monthEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setMonth(11, viewYear - 1);
    } else {
      setMonth(viewMonth - 1, viewYear);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setMonth(0, viewYear + 1);
    } else {
      setMonth(viewMonth + 1, viewYear);
    }
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    const dateStr = toDateString(viewYear, viewMonth, day);
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) return;
    await addEvent({
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      time: newEvent.time || null,
      description: newEvent.description || null,
      completed: false,
    });
    setNewEvent({
      title: "",
      type: "other",
      date: new Date().toISOString().split("T")[0],
      time: "",
      description: "",
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-white/50 mt-1">Farm events and schedule</p>
        </div>
        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Event
        </GlassButton>
      </div>

      {/* Add Event Inline Form */}
      {showAddForm && (
        <GlassCard className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              New Event
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Title *"
              name="event_title"
              placeholder="Event title..."
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <GlassSelect
              label="Type"
              name="event_type"
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent((prev) => ({
                  ...prev,
                  type: e.target.value as CalendarEvent["type"],
                }))
              }
              options={[
                { value: "medical", label: "Medical" },
                { value: "sale", label: "Sale" },
                { value: "inspection", label: "Inspection" },
                { value: "maintenance", label: "Maintenance" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Date *"
              name="event_date"
              type="date"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, date: e.target.value }))
              }
            />
            <GlassInput
              label="Time"
              name="event_time"
              type="time"
              value={newEvent.time}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, time: e.target.value }))
              }
            />
          </div>
          <GlassInput
            label="Description"
            name="event_description"
            placeholder="Optional description..."
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <div className="flex justify-end">
            <GlassButton
              variant="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleAddEvent}
            >
              Save Event
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Month Navigation */}
      <div className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
            </div>
            <button
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-white/40 uppercase tracking-wider py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dateStr = toDateString(viewYear, viewMonth, day);
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200
                    ${isToday
                      ? "bg-white/20 ring-2 ring-white/50 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                      : isSelected
                        ? "bg-white/15"
                        : "hover:bg-white/10"
                    }
                  `}
                >
                  <span
                    className={`text-sm font-medium ${
                      isToday ? "text-white font-bold" : "text-white/80"
                    }`}
                  >
                    {day}
                  </span>

                  {/* Event dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPE_COLORS[ev.type].dot}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-white/10">
            {(["medical", "sale", "inspection", "maintenance", "other"] as const).map(
              (type) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${EVENT_TYPE_COLORS[type].dot}`} />
                  <span className="text-xs text-white/50 capitalize">{type}</span>
                </div>
              )
            )}
          </div>
        </GlassCard>
      </div>

      {/* Selected Day Events */}
      {selectedDate && selectedDayEvents.length > 0 && (
        <div className="animate-fade-in-up">
          <h2 className="text-lg font-semibold text-white mb-4">
            Events on {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
          <div className="space-y-3">
            {selectedDayEvents.map((event) => {
              const typeColor = EVENT_TYPE_COLORS[event.type];
              return (
                <GlassCard key={event.id} className={event.completed ? "opacity-60" : ""}>
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleComplete(event.id)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {event.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/20 hover:text-white/50 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-white ${event.completed ? "line-through text-white/50" : ""}`}>
                          {event.title}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/10 ${typeColor.badge}`}>
                          {event.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {event.time && (
                          <span className="text-sm text-white/50 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {event.time}
                          </span>
                        )}
                        {event.description && (
                          <span className="text-sm text-white/40 truncate">
                            {event.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-300 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events for the month */}
      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {MONTH_NAMES[viewMonth]} Events
          </h2>
        </div>

        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <GlassCard className="text-center py-8">
              <p className="text-white/40 text-sm">No events this month</p>
            </GlassCard>
          ) : (
            upcomingEvents.map((event, i) => {
              const typeColor = EVENT_TYPE_COLORS[event.type];
              const eventDate = new Date(event.date + "T00:00:00");
              const dayNum = eventDate.getDate();
              const monthShort = eventDate.toLocaleDateString("en-AU", {
                month: "short",
              });

              return (
                <div
                  key={event.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${150 + i * 50}ms` }}
                >
                  <GlassCard className={event.completed ? "opacity-60" : ""}>
                    <div className="flex items-start gap-4">
                      {/* Date badge */}
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white/50 leading-none uppercase">
                          {monthShort}
                        </span>
                        <span className="text-lg font-bold text-white leading-tight">
                          {dayNum}
                        </span>
                      </div>

                      {/* Event info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`font-semibold text-white ${
                              event.completed ? "line-through text-white/50" : ""
                            }`}
                          >
                            {event.title}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/10 ${typeColor.badge}`}
                          >
                            {event.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                          {event.time && (
                            <span className="text-sm text-white/50 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {event.time}
                            </span>
                          )}
                          {event.description && (
                            <span className="text-sm text-white/40 truncate">
                              {event.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleComplete(event.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          title={event.completed ? "Mark incomplete" : "Mark complete"}
                        >
                          {event.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-white/20 hover:text-white/50 transition-colors" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-300 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
