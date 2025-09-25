import React, { useState, useCallback } from 'react';

function BookingCalendar({ selectedDate, setSelectedDate, onSelectDate, isSubmitting, hasBookingOnDate }) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [minMonthDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const generateAvailableDatesForMonth = useCallback((monthDate) => {
    const dates = [];
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const today = new Date();
    const monthStart = new Date(year, month, 1);
    monthStart.setHours(0, 0, 0, 0);

    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = date.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;

      dates.push({
        value,
        date: date,
        display: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        dayNumber: date.getDate(),
        isToday,
        isPast,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }

    return dates;
  }, []);

  const availableDates = generateAvailableDatesForMonth(currentMonthDate);

  const groupDatesByWeeks = useCallback(() => {
    const weeks = [];
    let currentWeek = [];

    availableDates.forEach((date, index) => {
      if (index === 0) {
        const startDayOfWeek = date.date.getDay();
        for (let i = 0; i < startDayOfWeek; i++) {
          currentWeek.push(null);
        }
      }

      currentWeek.push(date);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [availableDates]);

  const calendarWeeks = groupDatesByWeeks();

  const currentMonth = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const goToMonth = (offset) => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  const canPrevMonth = () => {
    return currentMonthDate.getFullYear() > minMonthDate.getFullYear() || (currentMonthDate.getFullYear() === minMonthDate.getFullYear() && currentMonthDate.getMonth() > minMonthDate.getMonth());
  };

  return (
    <div>
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            disabled={!canPrevMonth()}
            className={`px-2 py-1 rounded ${canPrevMonth() ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'}`}>
            ←
          </button>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">{currentMonth}</h3>
          </div>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            className="px-2 py-1 rounded hover:bg-gray-100">
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <div key={dayIndex} className="h-10"></div>;
                }

                const isSelected = selectedDate === date.value;
                const isToday = date.isToday;
                const hasBooking = hasBookingOnDate ? hasBookingOnDate(date.value) : false;
                const isPast = date.isPast;

                return (
                  <button
                    key={date.value}
                    type="button"
                    onClick={() => { if (!isPast && !isSubmitting) {
                      setSelectedDate(date.value);
                      if (typeof onSelectDate === 'function') onSelectDate(date.value, date.display);
                    } }}
                    disabled={isSubmitting || isPast}
                    className={`
                      h-10 text-sm font-medium rounded-md transition-colors duration-200 relative
                      ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : hasBooking ? 'bg-green-100 text-green-800 hover:bg-green-200 ring-2 ring-green-400'
                        : isToday ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'text-gray-900 hover:bg-gray-100'
                      }
                      ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}>
                    {date.dayNumber}
                    {hasBooking && (
                      <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {selectedDate && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-center">
            <p className="text-sm font-medium text-blue-900">
              Selected: {availableDates.find(d => d.value === selectedDate)?.display}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 justify-center">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border border-green-400 rounded mr-2 relative">
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
            <span>You have bookings</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingCalendar;
