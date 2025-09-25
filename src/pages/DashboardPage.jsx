import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, MapPin } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth, useBooking } from '../hooks/useContexts';

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const { user } = useAuth();
  const { getUserBookings, cancelBooking } = useBooking();

  // get user's bookings
  const userBookings = user ? getUserBookings(user.id) : [];

  // sort bookings so the latest booking (by createdAt, fallback to bookingDate) appears first
  const sortedBookings = [...userBookings].sort((a, b) => {
    const aTime = a?.createdAt ? Date.parse(a.createdAt) : Date.parse(a.bookingDate || 0);
    const bTime = b?.createdAt ? Date.parse(b.createdAt) : Date.parse(b.bookingDate || 0);
    return bTime - aTime;
  });

  useEffect(() => {
    // dimulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelBooking(bookingToCancel.id);
      setModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setBookingToCancel(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* header */}
      <div className="mb-8">
        <h1 className="pt-16 text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">Manage your study space bookings</p>
      </div>

      <div>
      {/* bookings content: Upcoming, Past, and Cancelled sections */}

        {/* categorize bookings */}
        {userBookings.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start exploring and book your first study space!</p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Browse Spaces
              </Link>
            </div>
          </div>
        ) : (
          (() => {
            const isPastBookingFn = (booking) => {
              const bookingDateParts = (booking.bookingDate || '').split('-').map(Number);
              if (bookingDateParts.length !== 3) return false;
              const [by, bm, bd] = bookingDateParts;
              const endOfDay = new Date(by, bm - 1, bd, 23, 59, 59, 999);
              return endOfDay.getTime() < Date.now();
            };

            const upcoming = sortedBookings.filter(b => b.status !== 'cancelled' && !isPastBookingFn(b));
            const past = sortedBookings.filter(b => b.status !== 'cancelled' && isPastBookingFn(b));
            const cancelled = [...sortedBookings.filter(b => b.status === 'cancelled')].sort((a, b) => {
              const aTime = a?.cancelledAt ? Date.parse(a.cancelledAt) : 0;
              const bTime = b?.cancelledAt ? Date.parse(b.cancelledAt) : 0;
              return bTime - aTime;
            });

            return (
              <div className="space-y-8">
                {/* Upcoming bookings */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Bookings <span className="text-sm text-gray-500">({upcoming.length})</span></h2>
                  {upcoming.length === 0 ? (
                    <p className="text-sm text-gray-500">No upcoming bookings.</p>
                  ) : (
                    <div className="space-y-6">
                      {upcoming.map(booking => (
                        <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{booking.spaceName}</h3>
                              </div>
                              <p className="text-gray-600 flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.spaceLocation}
                              </p>
                              <div className="mt-2 flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                  <strong>Date:</strong> {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) : 'Today'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  <strong>Time:</strong> {booking.timeSlot}
                                </span>
                                <span className="text-sm text-gray-600">
                                  <strong>Price:</strong> ₱{booking.price}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Booked on {formatDate(booking.createdAt || booking.bookingDate)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Link
                                to={`/space/${booking.spaceId}`}
                                className="text-white bg-blue-600 px-3 py-2 rounded-md hover:bg-blue-800 text-sm font-medium">
                                View Space
                              </Link>
                              <button
                                onClick={() => handleCancelClick(booking)}
                                className="text-white hover:bg-red-700 text-sm font-medium bg-red-600 px-3 py-2 rounded-md cursor-pointer">
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past bookings */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Bookings <span className="text-sm text-gray-500">({past.length})</span></h2>
                  {past.length === 0 ? (
                    <p className="text-sm text-gray-500">No past bookings.</p>
                  ) : (
                    <div className="space-y-6">
                      {past.map(booking => (
                        <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{booking.spaceName}</h3>
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Past</span>
                              </div>
                              <p className="text-gray-600 flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.spaceLocation}
                              </p>
                              <div className="mt-2 flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                  <strong>Date:</strong> {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) : 'Today'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  <strong>Time:</strong> {booking.timeSlot}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Booked on {formatDate(booking.createdAt || booking.bookingDate)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Link
                                to={`/space/${booking.spaceId}`}
                                className="text-white bg-blue-600 px-3 py-2 rounded-md hover:bg-blue-800 text-sm font-medium">
                                View Space
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cancelled bookings */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancelled Bookings <span className="text-sm text-gray-500">({cancelled.length})</span></h2>
                  {cancelled.length === 0 ? (
                    <p className="text-sm text-gray-500">No cancelled bookings.</p>
                  ) : (
                    <div className="space-y-6">
                      {cancelled.map(booking => (
                        <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{booking.spaceName}</h3>
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Cancelled</span>
                              </div>
                              <p className="text-gray-600 flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.spaceLocation}
                              </p>
                              <div className="mt-2 flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                  <strong>Date:</strong> {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) : 'Today'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  <strong>Time:</strong> {booking.timeSlot}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Booked on {formatDate(booking.createdAt || booking.bookingDate)}
                                {booking.cancelledAt && (
                                  <span className="block text-xs text-red-600 mt-1">Cancelled on {formatDate(booking.cancelledAt)}</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Link
                                to={`/space/${booking.spaceId}`}
                                className="text-white bg-blue-600 px-3 py-2 rounded-md hover:bg-blue-800 text-sm font-medium">
                                View Space
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* confirmation modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking"
        message={`Are you sure you want to cancel your booking for ${bookingToCancel?.spaceName}? This action cannot be undone.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking" />
    </div>
  );
}

export default DashboardPage;
