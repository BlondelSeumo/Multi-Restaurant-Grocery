import { Col, Row } from 'antd';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import orderService from 'services/order';
import sellerOrderService from 'services/seller/order';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import TopHeader from './components/top-header';
import Header from './components/header';
import StatusTrack from './components/status-track';
import Details from './components/details';
import Deliveryman from './components/deliveryman';
import Shop from './components/shop';
import Customer from './components/customer';
import Transactions from './components/transactions';
import Products from './components/products';
import Invoice from './components/invoice';
import Loading from 'components/loading';
import refundService from 'services/refund';
import sellerRefundService from 'services/seller/refund';
import { fetchRestOrderStatus } from 'redux/slices/orderStatus';

const OrderStatusModal = lazy(() => import('./components/status-modal'));
const RefundOrderStatusModal = lazy(
  () => import('./components/refund-status-modal'),
);
const OrderDeliveryman = lazy(() => import('./components/deliveryman-modal'));

const OrderDetails = ({ role = 'admin', isRefund = false }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRefundStatusModalOpen, setIsRefundStatusModalOpen] = useState(false);
  const [isDeliverymanModalOpen, setIsDeliverymanModalOpen] = useState(false);

  const handleOpenStatusModal = () => {
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
  };

  const handleOpenRefundStatusModal = () => {
    setIsRefundStatusModalOpen(true);
  };

  const handleCloseRefundStatusModal = () => {
    setIsRefundStatusModalOpen(false);
  };

  const handleOpenDeliverymanModal = () => {
    setIsDeliverymanModalOpen(true);
  };

  const handleCloseDeliverymanModal = () => {
    setIsDeliverymanModalOpen(false);
  };

  const fetchRefundOrderDefails = () => {
    setLoading(true);
    (role === 'admin' ? refundService : sellerRefundService)
      .getById(id)
      .then((res) => {
        setData(res?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchOrderDetails = () => {
    setLoading(true);
    (role === 'admin' ? orderService : sellerOrderService)
      .getById(id)
      .then((res) => {
        setData(res?.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      if (isRefund) {
        fetchRefundOrderDefails();
      } else {
        fetchOrderDetails();
      }
      dispatch(disableRefetch(activeMenu));
    }
    dispatch(fetchRestOrderStatus({}));
    // eslint-disable-next-line
  }, [id]);

  useDidUpdate(() => {
    if (activeMenu.refetch && id) {
      if (isRefund) {
        fetchRefundOrderDefails();
      } else {
        fetchOrderDetails();
      }
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch, id]);

  return (
    <>
      <TopHeader
        data={isRefund ? data?.order : data}
        handleOpenStatusModal={handleOpenStatusModal}
        role={role}
      />
      <br />
      <Header data={isRefund ? data?.order : data} loading={loading} />
      <StatusTrack status={isRefund ? data?.order?.status : data?.status} />
      <Row gutter={12}>
        <Col span={16}>
          <Details
            data={isRefund ? data?.order : data}
            isRefund={isRefund}
            refundData={data}
            handleOpenStatusModal={handleOpenStatusModal}
            handleOpenRefundStatusModal={handleOpenRefundStatusModal}
          />
          <Transactions
            data={isRefund ? data?.order : data}
            loading={loading}
            role={role}
          />
          <Invoice
            data={isRefund ? data?.order : data}
            loading={loading}
            role={role}
          />
        </Col>
        <Col span={8}>
          <Deliveryman
            data={isRefund ? data?.order : data}
            handleOpenDeliverymanModal={handleOpenDeliverymanModal}
            role={role}
          />
          <Shop data={isRefund ? data?.order : data} />
          <Customer data={isRefund ? data?.order : data} />
        </Col>
        <Col span={24}>
          <Products
            data={isRefund ? data?.order : data}
            role={role}
            loading={loading}
          />
        </Col>
      </Row>
      {isStatusModalOpen && (
        <Suspense fallback={<Loading />}>
          <OrderStatusModal
            data={data}
            handleCancel={handleCloseStatusModal}
            activeStatuses={activeStatusList}
            role={role}
          />
        </Suspense>
      )}
      {isRefundStatusModalOpen && (
        <Suspense fallback={<Loading />}>
          <RefundOrderStatusModal
            data={data}
            handleCancel={handleCloseRefundStatusModal}
            role={role}
          />
        </Suspense>
      )}
      {isDeliverymanModalOpen && (
        <Suspense fallback={<Loading />}>
          <OrderDeliveryman
            data={isRefund ? data?.order : data}
            handleCancel={handleCloseDeliverymanModal}
            role={role}
          />
        </Suspense>
      )}
    </>
  );
};

export default OrderDetails;
