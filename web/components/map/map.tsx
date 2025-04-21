/* eslint-disable @next/next/no-img-element */
import React, { MutableRefObject, useRef } from "react";
import { Coords } from "google-map-react";
import cls from "./map.module.scss";
import { getAddressFromLocation } from "utils/getAddressFromLocation";
import { IShop } from "interfaces";
import ShopLogoBackground from "components/shopLogoBackground/shopLogoBackground";
import MapContainer from "containers/map/mapContainer";

const Marker = (props: any) => (
  <img src="/images/marker.png" width={32} alt="Location" />
);
const ShopMarker = (props: any) => (
  <div onClick={props.onClick}>
    <ShopLogoBackground data={props.shop} size="small" />
  </div>
);

const options = {
  fields: ["address_components", "geometry"],
  types: ["address"],
};

type Props = {
  location: Coords;
  setLocation?: (data: any) => void;
  readOnly?: boolean;
  shops?: IShop[];
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  handleMarkerClick?: (data: IShop) => void;
  useInternalApi?: boolean;
};

export default function Map({
  location,
  setLocation = () => {},
  readOnly = false,
  shops = [],
  inputRef,
  handleMarkerClick,
  useInternalApi = true,
}: Props) {
  const autoCompleteRef = useRef<any>();

  async function onChangeMap(map: any) {
    if (readOnly) {
      return;
    }
    const location = {
      lat: map.center.lat(),
      lng: map.center.lng(),
    };
    setLocation(location);
    const address = await getAddressFromLocation(
      `${location.lat},${location.lng}`
    );
    if (inputRef?.current?.value) inputRef.current.value = address;
  }

  const handleApiLoaded = (map: any, maps: any) => {
    autoComplete(map, maps);
    if (shops.length && useInternalApi) {
      const shopLocations = shops.map((item) => ({
        lat: Number(item.location?.latitude) || 0,
        lng: Number(item.location?.longitude) || 0,
      }));
      const markers = [location, ...shopLocations];
      let bounds = new maps.LatLngBounds();
      for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i]);
      }
      map.fitBounds(bounds);
    }
  };

  function autoComplete(map: any, maps: any) {
    if (inputRef) {
      autoCompleteRef.current = new maps.places.Autocomplete(
        inputRef.current,
        options
      );
      autoCompleteRef.current.addListener("place_changed", async function () {
        const place = await autoCompleteRef.current.getPlace();
        const coords: Coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setLocation(coords);
      });
    }
  }

  return (
    <div className={cls.root}>
      {!readOnly && (
        <div className={cls.marker}>
          <img src="/images/marker.png" width={32} alt="Location" />
        </div>
      )}
      <MapContainer
        center={location}
        onDragEnd={onChangeMap}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
      >
        {readOnly && <Marker lat={location.lat} lng={location.lng} />}
        {shops.map((item, idx) => (
          <ShopMarker
            key={`marker-${idx}`}
            lat={item.location?.latitude || 0}
            lng={item.location?.longitude || 0}
            shop={item}
            onClick={() => {
              if (handleMarkerClick) handleMarkerClick(item);
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
