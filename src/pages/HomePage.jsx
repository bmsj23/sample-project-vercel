import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, FileText } from 'lucide-react';
import spacesData from '../data/spaces.json';

function HomePage() {
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // load spaces data on component mount
  useEffect(() => {
    // api-like loading delay
    setTimeout(() => {
      setSpaces(spacesData);
      setFilteredSpaces(spacesData);
      setLoading(false);
    }, 500);
  }, []);

  // filter spaces based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSpaces(spaces);
    } else {
      const filtered = spaces.filter(space => 
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSpaces(filtered);
    }
  }, [searchTerm, spaces]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
    <div className="">
      {/* hero section */}
      <div className="bg-[url('/assets/images/herosection.jpg')] max-w-full py-50">
        <div className="text-center mb-12 flex-col justify-between">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Study Space
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover co-working spaces and study hubs across the Philippines
          </p>
          
          {/* search bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              </div>
              <input
                type="text"
                placeholder="Search by name or location..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:border-blue-500 text-lg"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* results summary */}
        <div className="mb-8">
          <p className="text-gray-600">
            {filteredSpaces.length === spaces.length ? (
              `Showing all ${spaces.length} spaces`
            ) : (
              `Found ${filteredSpaces.length} spaces matching "${searchTerm}"`
            )}
          </p>
        </div>

        {/* spaces grid */}
        {filteredSpaces.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No spaces found</h3>
            <p className="mt-1 text-sm text-gray-500">Try searching with different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// SpaceCard component for individual space display
function SpaceCard({ space }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      {/* space img */}
      <div className="h-48 bg-gray-200 relative">
        <img
          src={space.main_image}
          alt={space.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=Study+Space';
          }}
        />
        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded text-sm font-semibold text-green-600">
          ₱{space.price}/day
        </div>
      </div>
      
      {/* space deets */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{space.name}</h3>
        <p className="text-gray-600 mb-2 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          {space.location}
        </p>
        
        {/* description*/}
        <div className="mb-4 flex-grow">
          <p className="text-gray-700 text-sm line-clamp-3">{space.description}</p>
        </div>
        
        {/* amenities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {space.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {amenity}
              </span>
            ))}
            {space.amenities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{space.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {/* operating hours */}
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Hours:</span> {space.hours}
        </p>
        
        {/* view details button*/}
        <div className="mt-auto">
          <Link
            to={`/space/${space.id}`}
            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium">
            View Details & Book
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
