import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface OrganizationMapPickerProps {
  onLocationSelect: (location: Location) => void;
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = { lat: 6.9271, lng: 79.8612 }; // Default center (Colombo, Sri Lanka)

export default function OrganizationMapPicker({ onLocationSelect }: OrganizationMapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox>(null);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarker(newPos);
      // Reverse geocode the new position to get an address if needed.
      // For simplicity, we'll just return lat/lng.
      onLocationSelect({ ...newPos, address: '' });
    }
  }, [onLocationSelect]);

  const onPlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarker(newPos);
        onLocationSelect({
          lat: newPos.lat,
          lng: newPos.lng,
          address: place.formatted_address || '',
        });
      }
    }
  };

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <div>
      {/* StandaloneSearchBox for location search */}
      <StandaloneSearchBox onLoad={ref => (searchBoxRef.current = ref)} onPlacesChanged={onPlacesChanged}>
        <input
          type="text"
          placeholder="Search for an organization location"
          style={{
            boxSizing: `border-box`,
            border: `1px solid #ccc`,
            width: `100%`,
            height: `40px`,
            padding: `0 12px`,
            marginBottom: '10px',
          }}
        />
      </StandaloneSearchBox>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || center}
        zoom={marker ? 15 : 10}
        onClick={onMapClick}
      >
        {marker && <Marker position={marker} draggable={true} onDragEnd={onMapClick} />}
      </GoogleMap>
    </div>
  );
}
