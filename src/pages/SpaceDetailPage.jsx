import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronRight, MapPin, Check, User } from 'lucide-react';
import spacesData from '../data/spaces.json';
import BookingForm from '../components/BookingForm';
import { useAuth, useBooking } from '../hooks/useContexts';

function SpaceDetailPage() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const { getUserBookings } = useBooking();

  // get user's bookings for this space
  const userBookings = getUserBookings();
  const spaceBookings = userBookings.filter(booking => booking.spaceId === parseInt(spaceId));
  const hasBookings = spaceBookings.length > 0;

  useEffect(() => {
    // find the space by ID
    const foundSpace = spacesData.find(s => s.id === parseInt(spaceId));

    setTimeout(() => {
      setSpace(foundSpace);
      setLoading(false);
    }, 300);
  }, [spaceId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Space Not Found</h1>
          <p className="text-gray-600 mb-8">The space you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Browse All Spaces
          </Link>
        </div>
      </div>
    );
  }

  // prepare all images for gallery
  const allImages = [space.main_image, ...space.images].filter(img => img);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Browse Spaces</Link>
          <span>/</span>
          <span className="text-gray-900">{space.name}</span>
        </div>
      </nav>
      {/* back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white hover:bg-blue-600 transition-colors duration-200 cursor-pointer bg-blue-500 px-3 py-2 rounded-lg">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
      </div>


      {/* existing booking notification */}
      {isAuthenticated() && hasBookings && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                You have {spaceBookings.length} booking{spaceBookings.length > 1 ? 's' : ''} for this space
              </h3>
              <div className="text-sm text-green-700">
                {spaceBookings.map((booking, index) => (
                  <div key={booking.id || index} className="mb-1">
                    {new Date(booking.bookingDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {booking.timeSlot}
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/my-bookings"
                className="inline-flex items-center text-sm font-medium text-green-800 hover:text-green-900 mt-2">
                Manage your bookings
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* left column (images and details) */}
        <div>
          {/* image gallery */}
          <div className="mb-6">
            <div className="aspect-w-4 aspect-h-3 mb-4">
              <img
                src={allImages[activeImageIndex]}
                alt={`${space.name} - Image ${activeImageIndex + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Study+Space';
                }} />
            </div>
            
            {/* thumbnail gallery */}
            {allImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 ${
                      activeImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}>
                    <img
                      src={image}
                      alt={`${space.name} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x64?text=Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* space information */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{space.name}</h1>
            
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-lg">{space.location}</span>
            </div>

            <div className="bg-green-50 text-green-700 text-2xl font-bold px-4 py-2 rounded-lg inline-block mb-6">
              ₱{space.price} / day
            </div>

            <p className="text-gray-700 text-lg mb-6">{space.description}</p>

            {/* operating hours */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Operating Hours</h3>
              <p className="text-gray-700">{space.hours}</p>
            </div>

            {/* amenities */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {space.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* right column (booking form) */}
        <div>
          <div className="sticky top-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">Book This Space</h2>
              
              {isAuthenticated() ? (
                <BookingForm 
                  space={space} 
                  user={user}/>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <User className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to Book</h3>
                    <p className="text-gray-600 mb-4">
                      You need to be logged in to make a booking.
                    </p>
                  </div>
                  
                  <Link
                    to="/login"
                    className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-center">
                    Sign In to Book
                  </Link>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Don't have an account? Use demo credentials: user / 123
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpaceDetailPage;
