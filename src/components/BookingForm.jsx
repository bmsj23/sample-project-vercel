import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { useBooking } from '../hooks/useContexts';
import BookingCalendar from './BookingCalendar';
import TimeSlotList from './TimeSlotList';

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
    // ignore cancelled bookings when checking if a slot is booked
    const isBooked = spaceBookings.some(booking => booking.bookingDate === date && booking.timeSlot === timeSlot && booking.status !== 'cancelled');
    return isBooked;
  }, [spaceBookings]);

  // check if a date has any bookings
  const hasBookingOnDate = (date) => {
    // Only count bookings that are not cancelled and whose end time is in the future
    const hasBooking = spaceBookings.some(booking => {
      if (booking.status === 'cancelled') return false;
      if (booking.bookingDate !== date) return false;

      // try to compute booking end using space.time_slots (if slot objects have end)
      try {
        const slotObj = (space.time_slots || []).find(s => (s.label || s) === booking.timeSlot) || null;
        if (slotObj && slotObj.end) {
          const [y, m, d] = date.split('-').map(Number);
          const [eh, em] = slotObj.end.split(':').map(Number);
          const [sh, sm] = (slotObj.start || '00:00').split(':').map(Number);
          const startDate = new Date(y, m - 1, d, sh || 0, sm || 0, 0, 0);
          let endDate = new Date(y, m - 1, d, eh, em, 0, 0);
          if (endDate.getTime() <= startDate.getTime()) endDate.setDate(endDate.getDate() + 1);
          return endDate.getTime() > Date.now();
        }
      } catch {
        // fallback below
      }

      // fallback: consider booking date as whole-day — count it if end of day is in future
      const [y, m, d] = date.split('-').map(Number);
      const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
      return endOfDay.getTime() > Date.now();
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

  const formatDateFromValue = useCallback((value) => {
    if (!value) return '';
    try {
      const [y, m, d] = value.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return value;
    }
  }, []);

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

  // generateAvailableDatesForMonth and calendar rendering moved to BookingCalendar component

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Select Date</label>
        <BookingCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onSelectDate={() => { /* optional callback */ }}
          isSubmitting={isSubmitting}
          hasBookingOnDate={hasBookingOnDate}
        />
      </div>

      <div>
        <TimeSlotList
          space={space}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
          isSubmitting={isSubmitting}
          isSlotBooked={isSlotBooked}
          isSlotTimePast={isSlotTimePast}
        />
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
                  {formatDateFromValue(selectedDate)}
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
