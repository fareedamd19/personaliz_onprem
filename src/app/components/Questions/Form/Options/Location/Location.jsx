import React, { useEffect, useState } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { useGlobalStoreContext } from '@/app/context/GlobalStoreContext';
import styles from "./Location.module.css"

// Define libraries outside the component
const libraries = ["places"];

const Location = ({updateLocationFormInput,option}) => {
  const [place, setPlace] = useState(null);
  const {fontThemeObj,optionThemeObj}=useGlobalStoreContext()


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
   const newPlace=place.getPlace()?.formatted_address

    updateLocationFormInput(newPlace,option.variable)
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
            required
              type="text"
              placeholder="Enter a location"
              style={{
    fontFamily:fontThemeObj?.font_name,
    backgroundColor:optionThemeObj?.option_background_color,
    border:`2px solid ${optionThemeObj?.option_border_color}`,
    borderRadius:`${optionThemeObj?.option_border_radius}px`,
    color:optionThemeObj?.option_text_color,
    fontSize:`${+fontThemeObj?.font_size-3}px`,
    }} 
    className={`${styles.inputCont} w-full h-max p-4 py-3 md:-mb-2 flex items-center focus:outline-none`}
            />
          </Autocomplete>
      </LoadScript>
    </div>
  );
};

export default Location;
