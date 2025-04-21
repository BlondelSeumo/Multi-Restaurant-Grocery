import React, { useEffect, useState } from 'react';
import { GoogleApiWrapper, Map, Marker } from 'google-maps-react';
import pinIcon from 'assets/images/pin.png';
import getAddressFromLocation from 'helpers/getAddressFromLocation';
import { BiCurrentLocation } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getMapKey } from 'helpers/getMapKey';
import getDefaultLocation from 'helpers/getDefaultLocation';

const GoogleMap = (props) => {
  const { t } = useTranslation();
  const googleMapKey = getMapKey();
  const defaultLocation = getDefaultLocation();
  const [loc, setLoc] = useState();

  const onClickMap = async (t, map, coord) => {
    const { latLng } = coord;
    const location = {
      lat: latLng.lat(),
      lng: latLng.lng(),
    };
    props.setLocation(location);
    const address = await getAddressFromLocation(location, googleMapKey);
    props.setAddress(address);
  };

  const handleSubmit = async (event) => {
    const location = {
      lat: event?.lat,
      lng: event?.lng,
    };
    props.setLocation(location);
    const address = await getAddressFromLocation(location, googleMapKey);
    props.setAddress(address);
  };

  const currentLocation = async () => {
    await navigator.geolocation.getCurrentPosition(
      function (position) {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLoc(location);
      },
      () => {
        toast.warning(t('turn.on.gps'));
      },
    );
  };

  useEffect(() => {
    currentLocation();
    // eslint-disable-next-line
  }, []);

  const location =
    props?.location?.lat && props?.location?.lng
      ? props.location
      : defaultLocation;

  const markers = [location];

  let bounds = new props.google.maps.LatLngBounds();

  for (let i = 0; i < markers.length; i++) {
    bounds.extend(markers[i]);
  }

  return (
    <div className='map-container' style={{ height: 400, width: '100%' }}>
      <button
        className='map-button'
        type='button'
        onClick={() => {
          currentLocation();
          if (loc) {
            handleSubmit(loc);
          }
        }}
      >
        <BiCurrentLocation />
      </button>
      <Map
        cursor={'pointer'}
        onClick={onClickMap}
        google={props.google}
        defaultZoom={12}
        zoom={10}
        className='clickable'
        initialCenter={location}
        center={location}
        bounds={bounds}
      >
        <Marker
          position={location}
          icon={{
            url: pinIcon,
            scaledSize: new props.google.maps.Size(32, 32),
          }}
          className='marker'
        />
      </Map>
    </div>
  );
};

export default GoogleApiWrapper({
  apiKey: getMapKey(),
})(GoogleMap);
