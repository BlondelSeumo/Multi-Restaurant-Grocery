import { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useParams } from 'react-router-dom';
import orderService from 'services/deliveryman/order';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import TopHeader from 'components/order-details/components/top-header';
import Header from 'components/order-details/components/header';
import StatusTrack from 'components/order-details/components/status-track';
import Details from 'components/order-details/components/details';
import Transactions from 'components/order-details/components/transactions';
import Shop from 'components/order-details/components/shop';
import Customer from 'components/order-details/components/customer';
import Products from 'components/order-details/components/products';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchRestOrderStatus } from 'redux/slices/orderStatus';

export default function DeliverymanOrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const fetchOrder = () => {
    setLoading(true);
    orderService
      .getById(id)
      .then((res) => {
        setData(res?.data);
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  useEffect(() => {
    dispatch(fetchRestOrderStatus({}));
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchOrder();
    }
  }, [activeMenu.refetch]);

  return (
    <>
      <TopHeader data={data} role='deliveryman' />
      <br />
      <Header data={data} loading={loading} />
      <StatusTrack status={data?.status} />
      <Row gutter={12}>
        <Col span={16}>
          <Details data={data} />
          <Transactions data={data} loading={loading} role='deliveryman' />
        </Col>
        <Col span={8}>
          <Shop data={data} />
          <Customer data={data} />
        </Col>
        <Col span={24}>
          <Products data={data} role='deliveryman' loading={loading} />
        </Col>
      </Row>
    </>
  );
}
