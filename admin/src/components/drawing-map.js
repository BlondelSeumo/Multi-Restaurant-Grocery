import {
  GoogleApiWrapper,
  Map,
  Marker,
  Polygon,
  Polyline,
} from 'google-maps-react';
import React, { useState, useEffect, useMemo } from 'react';
import { BiCurrentLocation } from 'react-icons/bi';
import { getMapKey } from 'helpers/getMapKey';
import getDefaultLocation from 'helpers/getDefaultLocation';
import { useSelector } from 'react-redux';
import { Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const OPTIONS = {
  minZoom: 15,
  maxZoom: 15,
};

const DrawingManager = (props) => {
  const { t } = useTranslation();
  const { settings } = useSelector((state) => state.globalSettings);
  const defaultLocation = getDefaultLocation();

  const markers = props.triangleCoords.map((item) => ({
    lat: Number(item?.lat || '0'),
    lng: Number(item?.lng || '0'),
  }));

  const [center, setCenter] = useState(defaultLocation);
  const [polygon, setPolygon] = useState(props?.triangleCoords || []);
  const [finish, setFinish] = useState(!!props?.triangleCoords);
  const [focus, setFocus] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  let bounds = new props.google.maps.LatLngBounds(center);

  for (let i = 0; i < markers.length; i++) {
    bounds.extend(markers[i]);
  }

  const templateDeliveryZones = useMemo(() => {
    if (
      settings?.template_delivery_zones &&
      settings?.template_delivery_zones?.length
    ) {
      return settings?.template_delivery_zones;
    }
    return [];
  }, [settings?.template_delivery_zones]);

  props.setMerge(finish);

  const onClick = (t, map, cord) => {
    setSelectedTemplate(null);
    setFocus(false);
    const { latLng } = cord;
    const lat = latLng.lat();
    const lng = latLng.lng();
    if (finish) {
      setPolygon([]);
      props.settriangleCoords([{ lat, lng }]);
      setCenter({ lat, lng });
      setFinish(false);
    } else {
      props.settriangleCoords((prev) => [...prev, { lat, lng }]);
    }
  };

  const onFinish = (e) => {
    setSelectedTemplate(null);
    setFinish(!!props?.triangleCoords);
    if (
      props?.triangleCoords[0]?.lat === e.position?.lat &&
      props?.triangleCoords?.length > 1
    ) {
      setPolygon(props?.triangleCoords);
      props.setLocation(props?.triangleCoords);
      setFinish(true);
      setFocus(true);
    }
  };

  const currentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCenter({
        lat: position?.coords?.latitude,
        lng: position?.coords?.longitude,
      });
    });
  };

  const handleMapReady = (_, map) => {
    map.setOptions({
      draggableCursor: 'crosshair',
      draggingCursor: 'grab',
    });
  };

  const handleSelectTemplateDeliveryZone = (template) => {
    setSelectedTemplate(template);
    const coordinates = template?.location?.map((item) => ({
      lat: item[0],
      lng: item[1],
    }));
    setCenter({ lat: coordinates?.[0]?.lat, lng: coordinates?.[0]?.lng });
    setPolygon(coordinates);
    props.settriangleCoords(coordinates);
    setFinish(true);
    setFocus(true);
  };

  useEffect(() => {
    setSelectedTemplate(null);
    setFocus(true);
  }, []);

  return (
    <>
      <div className='map-container' style={{ height: 500, width: '100%' }}>
        <button
          className='map-button'
          type='button'
          onClick={() => {
            currentLocation();
          }}
        >
          <BiCurrentLocation />
        </button>
        <Map
          options={OPTIONS}
          cursor='pointer'
          onClick={onClick}
          maxZoom={16}
          minZoom={2}
          google={props.google}
          initialCenter={defaultLocation}
          center={center}
          onReady={handleMapReady}
          bounds={focus && bounds}
          className='clickable'
        >
          {props.triangleCoords?.map((item, idx) => (
            <Marker
              onClick={(e) => onFinish(e)}
              key={idx}
              position={item}
              icon={{
                url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Circle-image.svg',
                scaledSize: new props.google.maps.Size(10, 10),
              }}
              className='marker'
            />
          ))}

          {!polygon?.length ? (
            <Polyline
              key={props?.triangleCoords?.length || 0}
              path={props.triangleCoords}
              strokeColor='black'
              strokeOpacity={0.8}
              strokeWeight={3}
              fillColor='black'
              fillOpacity={0.35}
            />
          ) : (
            <Polygon
              key={polygon?.length || 0}
              path={props.triangleCoords}
              strokeColor='black'
              strokeOpacity={0.8}
              strokeWeight={3}
              fillColor='black'
              fillOpacity={0.35}
            />
          )}
        </Map>
      </div>
      {!!props?.withTemplate &&
        Array.isArray(templateDeliveryZones) &&
        !!templateDeliveryZones?.length && (
          <>
            <h3 className='p-0 m-0 mt-4 mb-2'>
              {t('template.delivery.zones')}
            </h3>
            <Space wrap>
              {templateDeliveryZones.map((item) => (
                <Button
                  type={
                    item?.id === selectedTemplate?.id ? 'primary' : 'default'
                  }
                  onClick={() => handleSelectTemplateDeliveryZone(item)}
                >
                  {item?.title}
                </Button>
              ))}
            </Space>
          </>
        )}
    </>
  );
};

export default GoogleApiWrapper({
  apiKey: getMapKey(),
  libraries: ['places'],
})(DrawingManager);
