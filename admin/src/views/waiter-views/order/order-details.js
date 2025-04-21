import { useEffect, useState, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import orderService from 'services/waiter/order';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import Loading from 'components/loading';
import TopHeader from 'components/order-details/components/top-header';
import Header from 'components/order-details/components/header';
import StatusTrack from 'components/order-details/components/status-track';
import { fetchRestOrderStatus } from 'redux/slices/orderStatus';
import Details from 'components/order-details/components/details';
import useDidUpdate from 'helpers/useDidUpdate';

const OrderStatusModal = lazy(
  () => import('components/order-details/components/status-modal'),
);

export default function WaiterOrderDetails() {
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );

  const { id } = useParams();
  const dispatch = useDispatch();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleOpenStatusModal = () => {
    setIsStatusModalOpen(true);
  };

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
    fetchOrder();
    dispatch(fetchRestOrderStatus({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchOrder();
    }
    // eslint-disable-next-line
  }, [activeMenu.refetch]);

  return (
    <>
      <TopHeader
        data={data}
        handleOpenStatusModal={handleOpenStatusModal}
        role='waiter'
      />
      <br />
      <Header data={data} loading={loading} />
      <StatusTrack status={data?.status} />
      <Details data={data} handleOpenStatusModal={handleOpenStatusModal} />

      {isStatusModalOpen && (
        <Suspense fallback={<Loading />}>
          <OrderStatusModal
            data={data}
            handleCancel={() => setIsStatusModalOpen(false)}
            activeStatuses={activeStatusList}
            role='waiter'
          />
        </Suspense>
      )}
    </>
  );
}
