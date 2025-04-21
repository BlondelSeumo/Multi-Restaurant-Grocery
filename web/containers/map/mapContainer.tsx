import React from "react";
import GoogleMapReact, { Props } from "google-map-react";
import { MAP_API_KEY } from "constants/constants";
import useUserLocation from "hooks/useUserLocation";
import { useSettings } from "contexts/settings/settings.context";

export default function MapContainer({ children, ...rest }: Props) {
  const location = useUserLocation();
  const { settings } = useSettings();
  return (
    <GoogleMapReact
      bootstrapURLKeys={{
        key: settings?.google_map_key || MAP_API_KEY || "",
        libraries: ["places"],
      }}
      defaultZoom={15}
      center={{
        lat: Number(location?.latitude) || 0,
        lng: Number(location?.longitude) || 0,
      }}
      {...rest}
    >
      {children}
    </GoogleMapReact>
  );
}
