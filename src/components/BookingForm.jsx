import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { useBooking } from '../hooks/useContexts';

function BookingForm({ space, user }) {
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { createBooking, getUserBookings } = useBooking();

  // get user's existing bookings for this space
  const userBookings = getUserBookings().filter(booking => booking.userId === (user?.id || 1));
  const spaceBookings = userBookings.filter(booking => booking.spaceId === space.id);

  /*
  // debug logging
  useEffect(() => {
    console.log('BookingForm Debug:', {
      userId: user?.id || 1,
      spaceId: space.id,
      allBookings: getUserBookings(),
      userBookings,
      spaceBookings
    });
  }, [getUserBookings, user?.id, space.id, userBookings, spaceBookings]);
  */

  // check if a date and time slot combination is already booked
  const isSlotBooked = useCallback((date, timeSlot) => {
    const isBooked = spaceBookings.some(booking => booking.bookingDate === date && booking.timeSlot === timeSlot);
    return isBooked;
  }, [spaceBookings]);

  // check if a date has any bookings
  const hasBookingOnDate = (date) => {
    const hasBooking = spaceBookings.some(booking => {
      const match = booking.bookingDate === date;
      return match;
    });
    return hasBooking;
  };

  // parse time components and return start and end Date objects for a slot
  const parseSlotStartEnd = useCallback((dateString, timeString) => {
    // returns { start: Date|null, end: Date|null }
    const toDate = (y, m, d, hrs, mins) => new Date(y, m - 1, d, hrs, mins, 0, 0);

    const parseComponent = (comp) => {
      if (!comp) return null;
      const s = comp.trim().toLowerCase();
      // match hh:mm or hh formats, with optional am/pm
      const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
      if (!m) return null;
      let hours = parseInt(m[1], 10);
      const minutes = m[2] ? parseInt(m[2], 10) : 0;
      const meridiem = m[3];
      if (meridiem) {
        if (meridiem.toLowerCase() === 'pm' && hours !== 12) hours += 12;
        if (meridiem.toLowerCase() === 'am' && hours === 12) hours = 0;
      }
      return { hours, minutes };
    };

    try {
      const [y, m, d] = dateString.split('-').map(Number);
      const parts = timeString.split('-');
      const startComp = parseComponent(parts[0]);
      const endComp = parts[1] ? parseComponent(parts[1]) : null;
      const start = startComp ? toDate(y, m, d, startComp.hours, startComp.minutes) : null;
      const end = endComp ? toDate(y, m, d, endComp.hours, endComp.minutes) : null;
      return { start, end };
    } catch {
      return { start: null, end: null };
    }
  }, []);

  // returns true if the slot's start time is already in the past (relative to now), for the given date
  const isSlotTimePast = useCallback((slotOrString, dateValue) => {
    if (!dateValue) return false;
    try {
      const today = new Date();
      const [y, m, d] = dateValue.split('-').map(Number);
      const slotDate = new Date(y, m - 1, d);
      // only consider past times for today's date
      if (slotDate.toDateString() !== today.toDateString()) return false;

      // slotOrString may be an object {label,start,end} or a plain string like "9am - 1pm"
      let start = null;
      let end = null;
      if (typeof slotOrString === 'object' && slotOrString !== null) {
        // times are in HH:MM (24-hour) format in the data
        const [sh, sm] = (slotOrString.start || '00:00').split(':').map(Number);
        const [eh, em] = (slotOrString.end || '00:00').split(':').map(Number);
        start = new Date(y, m - 1, d, sh, sm, 0, 0);
        end = new Date(y, m - 1, d, eh, em, 0, 0);
        // handle overnight slots where end is earlier or equal to start (end on next day)
        if (end.getTime() <= start.getTime()) {
          end.setDate(end.getDate() + 1);
        }
      } else {
        const parsed = parseSlotStartEnd(dateValue, String(slotOrString || ''));
        start = parsed.start;
        end = parsed.end;
      }

      const compareDate = end || start;
      if (!compareDate) return false;
      return compareDate.getTime() <= Date.now();
    } catch {
      return false;
    }
  }, [parseSlotStartEnd]);

  // clear selected slot if it becomes invalid (user switches date to today and the slot passed or another booking was created)
  useEffect(() => {
    if (!selectedSlot || !selectedDate) return;
    const isBooked = isSlotBooked(selectedDate, selectedSlot);
    const slotObj = space.time_slots.find(s => (s.label || s) === selectedSlot) || null;
    const isPassed = isSlotTimePast(slotObj || selectedSlot, selectedDate);
    if (isBooked || isPassed) {
      setSelectedSlot('');
    }
  }, [selectedDate, selectedSlot, isSlotBooked, isSlotTimePast, space.time_slots]);

  // generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = [];
    // generate all days for the current month so we can gray out past days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();

      // build a local YYYY-MM-DD string
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
  };

  const availableDates = generateAvailableDates();

  // get current month and year for calendar header
  const currentMonth = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // group dates by weeks for calendar layout
  const groupDatesByWeeks = () => {
    const weeks = [];
    let currentWeek = [];

    availableDates.forEach((date, index) => {
      if (index === 0) {
        // fill empty cells for the first week
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

    // add the last incomplete week
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const calendarWeeks = groupDatesByWeeks();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot || !selectedDate) {
      alert('Please select both a date and time slot');
      return;
    }

    // check for existing booking
    if (isSlotBooked(selectedDate, selectedSlot)) {
      alert('You already have a booking for this date and time slot. Please select a different time.');
      return;
    }

    // prevent booking past time slots for today
    const selectedSlotObj = space.time_slots.find(s => (s.label || s) === selectedSlot) || null;
    if (isSlotTimePast(selectedSlotObj || selectedSlot, selectedDate)) {
      alert('The selected time slot has already passed. Please choose a future time.');
      return;
    }

    setIsSubmitting(true);

    // booking api call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // create booking using context
      const bookingData = {
        spaceId: space.id,
        spaceName: space.name,
        spaceLocation: space.location,
        timeSlot: selectedSlot,
        bookingDate: selectedDate,
        price: space.price,
        userId: user?.id || 1
      };

      createBooking(bookingData);

      setShowSuccess(true);

      // redirect to dashboard after successful booking
      setTimeout(() => {
        navigate('/dashboard/my-bookings');
      }, 2000);

    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 mb-4">
          Your booking for {space.name} has been confirmed.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* date selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Select Date
        </label>
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          {/* calendar header */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{currentMonth}</h3>
          </div>

          {/* days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* calendar grid */}
          <div className="space-y-1">
            {calendarWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={dayIndex} className="h-10"></div>;
                  }

                  const isSelected = selectedDate === date.value;
                  const isToday = date.isToday;
                  const hasBooking = hasBookingOnDate(date.value);
                  const isPast = date.isPast;

                  return (
                    <button
                      key={date.value}
                      type="button"
                        onClick={() => { if (!isPast && !isSubmitting) setSelectedDate(date.value); }}
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

          {/* selected date display */}
          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-center">
              <p className="text-sm font-medium text-blue-900">
                Selected: {availableDates.find(d => d.value === selectedDate)?.display}
              </p>
            </div>
          )}

          {/* calendar legend */}
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

      {/* time slot selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Select Time Slot
        </label>
        <div className="space-y-2">
          {space.time_slots.map((slot, index) => {
            // slot = { label, start, end }
            const label = slot.label || slot;
            const isSlotAlreadyBooked = selectedDate && isSlotBooked(selectedDate, label);
            const isSlotPassed = selectedDate ? isSlotTimePast(slot, selectedDate) : false;

            // if the currently selected slot becomes invalid, clear it

            return (
              <label
                key={index}
                className={`flex items-center p-3 border rounded-lg transition-colors ${
                  isSlotAlreadyBooked
                    ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-75'
                    : isSlotPassed
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-75'
                    : selectedSlot === slot
                    ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                }`}>
                <input
                  type="radio"
                  name="timeSlot"
                  value={label}
                  checked={selectedSlot === label}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                  disabled={isSubmitting || isSlotAlreadyBooked || isSlotPassed} />
                <span className={`ml-3 font-medium ${isSlotAlreadyBooked ? 'text-red-600' : isSlotPassed ? 'text-gray-400' : ''}`}>
                  {label}
                  {isSlotAlreadyBooked && (
                    <span className="ml-2 text-sm text-red-500">(Already booked)</span>
                  )}
                  {isSlotPassed && (
                    <span className="ml-2 text-sm text-gray-500">(Time passed)</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* booking summary */}
      {selectedSlot && selectedDate && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Space:</span>
              <span className="font-medium">{space.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{space.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {availableDates.find(d => d.value === selectedDate)?.display}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Slot:</span>
              <span className="font-medium">{selectedSlot}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-600">Total Price:</span>
              <span className="font-bold text-lg text-green-600">₱{space.price}</span>
            </div>
          </div>
        </div>
      )}

      {/* book button */}
      <button
        type="submit"
        disabled={!selectedSlot || !selectedDate || isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium cursor-pointer">
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <Loader className="animate-spin mr-3 h-5 w-5" />
            Processing Booking...
          </div> ) : (`Book Now - ₱${space.price}`)
        }
      </button>

      {/* terms and conditions */}
      <p className="text-xs text-gray-500 text-center">
        By booking, you agree to our terms and conditions.
        Cancellation is available up to 24 hours before your session.
      </p>
    </form>
  );
}

export default BookingForm;
