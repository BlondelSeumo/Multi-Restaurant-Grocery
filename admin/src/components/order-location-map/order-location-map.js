import { Card, Col, Modal, Row } from 'antd';
import MapCustomMarker from 'components/map-custom-marker';
import StatusTrack from 'components/order-details/components/status-track';
import getDefaultLocation from 'helpers/getDefaultLocation';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import orderService from 'services/order';
import sellerOrderService from 'services/seller/order';
import FaUser from 'assets/images/user.jpg';
import FaStore from 'assets/images/shop.png';
import { useEffect, useState } from 'react';

const User = ({ ...props }) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
    }}
    {...props}
  >
    <img src={FaUser} width='50' alt='Pin' />
  </div>
);

const Store = ({ ...props }) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
    }}
    {...props}
  >
    <img src={FaStore} width='50' alt='Pin' />
  </div>
);

const OrderLocationMap = ({ id, role = 'admin', onCancel }) => {
  const { t } = useTranslation();
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual,
  );
  const center = getDefaultLocation(settings);
  const [data, setData] = useState({});
  const [locations, setLocations] = useState({ user: null, shop: null });
  const [loading, setLoading] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    (role === 'admin' ? orderService : sellerOrderService)
      .getById(id)
      .then((res) => {
        setData(res?.data);
        setLocations({
          shop: {
            lat: res?.data?.shop?.location?.latitude,
            lng: res?.data?.shop?.location?.longitude,
          },
          user: {
            lat: res?.data?.location?.latitude,
            lng: res?.data?.location?.longitude,
          },
        });
      })
      .finally(() => setLoading(false));
  };

  const handleLoadMap = (map, maps) => {
    const markers = [locations.shop, locations.user].map((item) => ({
      lat: Number(item.lat || '0'),
      lng: Number(item.lng || '0'),
    }));

    let bounds = new maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
      bounds.extend(markers[i]);
    }
    map.fitBounds(bounds);
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Modal
      visible={!!id}
      title={`${t('order.location.on.map')} #${id}`}
      footer={null}
      onCancel={onCancel}
      style={{ minWidth: '80vw' }}
    >
      <Card loading={loading}>
        <Row gutter={12}>
          <Col span={24}>
            <StatusTrack status={data?.status} />
          </Col>
          <Col span={24} style={{ width: '100%', height: '400px' }}>
            <MapCustomMarker center={center} handleLoadMap={handleLoadMap}>
              <Store lat={locations?.shop?.lat} lng={locations?.shop?.lng} />
              {data?.delivery_type !== 'pickup' && (
                <User lat={locations?.user?.lat} lng={locations?.user?.lng} />
              )}
            </MapCustomMarker>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
};

export default OrderLocationMap;
