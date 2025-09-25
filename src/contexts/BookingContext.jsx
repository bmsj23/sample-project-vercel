import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BookingContext } from './contexts';

export default function BookingProvider({ children }) {
  // use localStorage to persist bookings
  const [bookings, setBookings] = useLocalStorage('studyspot_bookings', []);

  const createBooking = (bookingData) => {
    const newBooking = {
      id: Date.now(), // simple id generation for demo
      ...bookingData,
      createdAt: new Date().toISOString(), // keep track of when booking was created
      status: 'confirmed'
    };

    setBookings(prevBookings => [...prevBookings, newBooking]);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    // Instead of deleting the booking, mark it as cancelled so it remains visible
    setBookings(prevBookings =>
      prevBookings.map(booking => booking.id === bookingId ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() } : booking)
    );
  };

  const getUserBookings = (userId = null) => {
    if (userId) {
      return bookings.filter(booking => booking.userId === userId);
    }
    // if no user id provided, return all bookings (for current user context)
    return bookings;
  };

  const getBookingById = (bookingId) => {
    return bookings.find(booking => booking.id === bookingId);
  };

  const value = {
    bookings,
    createBooking,
    cancelBooking,
    getUserBookings,
    getBookingById
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}
