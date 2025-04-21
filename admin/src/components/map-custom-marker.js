import React from 'react';
import GoogleMapReact from 'google-map-react';
import getMapApiKey from 'helpers/getMapApiKey';

export default function MapCustomMarker({ center, handleLoadMap, children }) {
  return (
    <GoogleMapReact
      bootstrapURLKeys={{
        key: getMapApiKey(),
      }}
      defaultZoom={12}
      center={center}
      options={{
        fullscreenControl: false,
      }}
      yesIWantToUseGoogleMapApiInternals
      onGoogleApiLoaded={({ map, maps }) => handleLoadMap(map, maps)}
    >
      {children}
    </GoogleMapReact>
  );
}
