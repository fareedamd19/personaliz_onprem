import React, { useState } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

// Define libraries outside the component
const libraries = ["places"];

const Location = () => {
  const [place, setPlace] = useState(null);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Clear event listeners when component unmounts
      if (place) {
        google.maps.event.clearInstanceListeners(place);
      }
    };
  }, [place]); // Run effect when 'place' changes

  const handlePlaceSelect = () => {
    // Access place details from Autocomplete component
    console.log(place);
  };

  

  return (
    <div>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        libraries={libraries} // Pass libraries as a prop
        loading="async" // Load Google Maps API asynchronously
      >
          <Autocomplete onLoad={setPlace} onPlaceChanged={handlePlaceSelect}>
            <input
              type="text"
              placeholder="Enter a location"
              style={{
                boxSizing: 'border-box',
                border: '1px solid transparent',
                width: '240px',
                height: '32px',
                padding: '0 12px',
                borderRadius: '3px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                fontSize: '14px',
                outline: 'none',
                textOverflow: 'ellipses',
              }}
            />
          </Autocomplete>
      </LoadScript>
    </div>
  );
};

export default Location;
