import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// Simplified Calendar Preview Component
function CalendarPreview() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [mode, setMode] = useState<'single' | 'range'>('single');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (mode === 'single') {
      return selectedDate?.toDateString() === date.toDateString();
    } else {
      if (!rangeStart) return false;
      if (!rangeEnd) return date.toDateString() === rangeStart.toDateString();
      return date >= rangeStart && date <= rangeEnd;
    }
  };

  const isRangeStart = (date: Date) => {
    return rangeStart?.toDateString() === date.toDateString();
  };

  const isRangeEnd = (date: Date) => {
    return rangeEnd?.toDateString() === date.toDateString();
  };

  const isRangeMiddle = (date: Date) => {
    if (!rangeStart || !rangeEnd) return false;
    return date > rangeStart && date < rangeEnd;
  };

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;

    if (mode === 'single') {
      setSelectedDate(date);
    } else {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(date);
        setRangeEnd(null);
      } else {
        if (date < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(date);
        } else {
          setRangeEnd(date);
        }
      }
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Calendar Component</h1>
          <p className="text-slate-600">Interactive date picker with single and range selection modes</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Single Date Selection */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Single Date Selection</h2>
              <p className="text-sm text-slate-600">Click any date to select</p>
              {selectedDate && (
                <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    Selected: {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setMode('single')}
              className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Switch to Single Mode
            </button>

            <div className="bg-slate-50 rounded-xl p-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                
                <h3 className="text-base font-semibold text-slate-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                    const today = isToday(day.date);
                    const selected = isSelected(day.date) && mode === 'single';
                    const rangeStartDay = isRangeStart(day.date) && mode === 'range';
                    const rangeEndDay = isRangeEnd(day.date) && mode === 'range';
                    const rangeMiddleDay = isRangeMiddle(day.date) && mode === 'range';

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                        disabled={!day.isCurrentMonth}
                        className={`
                          aspect-square rounded-lg font-medium text-sm transition-all duration-150
                          ${!day.isCurrentMonth ? 'text-slate-300 cursor-not-allowed' : 'text-slate-900'}
                          ${today ? 'ring-2 ring-blue-500/30 bg-blue-50 text-blue-700 font-semibold' : ''}
                          ${selected ? 'bg-blue-600 text-white font-semibold' : ''}
                          ${rangeStartDay || rangeEndDay ? 'bg-blue-600 text-white font-semibold' : ''}
                          ${rangeMiddleDay ? 'bg-blue-100 text-blue-900' : ''}
                          ${!selected && !today && !rangeStartDay && !rangeEndDay && !rangeMiddleDay && day.isCurrentMonth ? 'hover:bg-slate-200' : ''}
                        `}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Range Date Selection */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Range Selection</h2>
              <p className="text-sm text-slate-600">Click start date, then end date</p>
              {rangeStart && (
                <div className="mt-2 space-y-2">
                  <div className="px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm font-medium text-emerald-900">
                      Start: {rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {rangeEnd && (
                    <div className="px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-medium text-purple-900">
                        End: {rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        Duration: {Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setMode('range')}
              className="w-full mb-4 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Switch to Range Mode
            </button>

            <div className="bg-slate-50 rounded-xl p-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                
                <h3 className="text-base font-semibold text-slate-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wide py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                    const today = isToday(day.date);
                    const selected = isSelected(day.date);
                    const rangeStartDay = isRangeStart(day.date);
                    const rangeEndDay = isRangeEnd(day.date);
                    const rangeMiddleDay = isRangeMiddle(day.date);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                        disabled={!day.isCurrentMonth}
                        className={`
                          aspect-square rounded-lg font-medium text-sm transition-all duration-150
                          ${!day.isCurrentMonth ? 'text-slate-300 cursor-not-allowed' : 'text-slate-900'}
                          ${today ? 'ring-2 ring-emerald-500/30 bg-emerald-50 text-emerald-700 font-semibold' : ''}
                          ${rangeStartDay || rangeEndDay ? 'bg-emerald-600 text-white font-semibold' : ''}
                          ${rangeMiddleDay ? 'bg-emerald-100 text-emerald-900' : ''}
                          ${!selected && !today && !rangeStartDay && !rangeEndDay && !rangeMiddleDay && day.isCurrentMonth ? 'hover:bg-slate-200' : ''}
                        `}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <div className="w-5 h-5 rounded bg-blue-600"></div>
              </div>
              <h3 className="font-bold text-slate-900">Single Selection</h3>
            </div>
            <p className="text-sm text-slate-600">Pick one specific date from the calendar</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <div className="w-8 h-2 rounded bg-emerald-600"></div>
              </div>
              <h3 className="font-bold text-slate-900">Range Selection</h3>
            </div>
            <p className="text-sm text-slate-600">Select a start and end date range</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-purple-600"></div>
              </div>
              <h3 className="font-bold text-slate-900">Today Highlight</h3>
            </div>
            <p className="text-sm text-slate-600">Current day marked with special styling</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPreview;