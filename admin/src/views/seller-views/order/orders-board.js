import { useEffect, useState, useContext, lazy, Suspense } from 'react';
import { Button, Space, Typography, Divider } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchRestOrderStatus } from 'redux/slices/orderStatus';
import { Context } from 'context/context';
import { toast } from 'react-toastify';
import orderService from 'services/seller/order';
import {
  clearItems,
  fetchAcceptedOrders,
  fetchCanceledOrders,
  fetchDeliveredOrders,
  fetchNewOrders,
  fetchOnAWayOrders,
  fetchReadyOrders,
  fetchCookingOrders,
} from 'redux/slices/sellerOrders';
import { clearOrder } from 'redux/slices/order';
import CustomModal from 'components/modal';
import moment from 'moment';
import { fetchSellerOrders } from 'redux/slices/orders';
import Incorporate from './dnd/Incorporate';
import OrderTypeSwitcher from 'components/order-type-switcher';
import DownloadModal from './downloadModal';
import Loading from 'components/loading';
import Card from 'components/card';
import OrderFilters from 'components/order-filters';

const OrderLocationMap = lazy(
  () => import('components/order-location-map/order-location-map'),
);
const OrderDeliveryman = lazy(
  () => import('components/order-details/components/deliveryman-modal'),
);

const initialFilterValues = {
  user: null,
  date: null,
  search: '',
};

export default function SellerOrdersBoard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [id, setId] = useState(null);
  const { setIsModalVisible } = useContext(Context);
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [locationsMap, setLocationsMap] = useState(null);
  const [downloadModal, setDownloadModal] = useState(null);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const [type, setType] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const urlParams = useParams();
  const orderType = urlParams?.type;

  const data = activeMenu?.data;

  const paramsData = {
    perPage: data?.perPage || 5,
    page: data?.page || 1,
    search: filters?.search || undefined,
    user_id: filters?.user?.value,
    date_from: filters?.date?.from || undefined,
    date_to: filters?.date?.to || undefined,
    delivery_type:
      filters?.delivery_type?.value !== 'scheduled'
        ? filters?.delivery_type?.value
        : undefined,
    delivery_date_from:
      filters?.delivery_type?.value === 'scheduled'
        ? moment().add(1, 'day').format('YYYY-MM-DD')
        : undefined,
  };

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `seller/order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      }),
    );
    navigate(`/seller/order/details/${row.id}`);
  };

  const orderDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    orderService
      .delete(params)
      .then(() => {
        dispatch(clearItems());
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
        fetchOrderAllItem({ status: type });
        setText(null);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };
  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    // batch(() => {
    //   dispatch(clearItems());
    //   dispatch(
    //       setMenuData({
    //         activeMenu,
    //         data: { ...data, [name]: item },
    //       }),
    //   );
    // });
  };
  const handleClearAllFilters = () => {
    setFilters(initialFilterValues);
  };
  const fetchOrdersCase = (params) => {
    const paramsWithType = {
      ...params,
      shop_id: myShop?.id,
      delivery_type: paramsData?.delivery_type,
      delivery_date_from: paramsData?.delivery_date_from,
      search: paramsData?.search,
      user_id: paramsData?.user_id,
      status: params?.status,
      date_from: paramsData?.date_from,
      date_to: paramsData?.date_to,
    };
    switch (params?.status) {
      case 'new':
        dispatch(fetchNewOrders(paramsWithType));
        break;
      case 'accepted':
        dispatch(fetchAcceptedOrders(paramsWithType));
        break;
      case 'ready':
        dispatch(fetchReadyOrders(paramsWithType));
        break;
      case 'on_a_way':
        dispatch(fetchOnAWayOrders(paramsWithType));
        break;
      case 'delivered':
        dispatch(fetchDeliveredOrders(paramsWithType));
        break;
      case 'canceled':
        dispatch(fetchCanceledOrders(paramsWithType));
        break;
      case 'cooking':
        dispatch(fetchCookingOrders(paramsWithType));
        break;
      default:
        console.log(`Sorry, we are out of`);
    }
  };
  const fetchOrderAllItem = () => {
    dispatch(clearItems());
    fetchOrdersCase({ status: 'new' });
    fetchOrdersCase({ status: 'accepted' });
    fetchOrdersCase({ status: 'ready' });
    fetchOrdersCase({ status: 'on_a_way' });
    fetchOrdersCase({ status: 'delivered' });
    fetchOrdersCase({ status: 'canceled' });
    fetchOrdersCase({ status: 'cooking' });
  };
  const handleCloseModal = () => {
    setOrderDeliveryDetails(null);
    setLocationsMap(null);
    setDownloadModal(null);
  };
  const goToAddOrder = () => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        id: 'pos.system',
        url: 'seller/pos-system',
        name: t('add.order'),
      }),
    );
    navigate('/seller/pos-system', { state: { delivery_type: orderType } });
  };

  useDidUpdate(() => {
    dispatch(clearItems());
    fetchOrderAllItem();
  }, [filters]);

  useEffect(() => {
    if (activeMenu?.refetch) {
      dispatch(fetchSellerOrders(paramsData));
      dispatch(fetchRestOrderStatus({}));
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu?.refetch]);

  return (
    <>
      <Card>
        <Space className='justify-content-between w-100'>
          <Typography.Title
            level={1}
            style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 500 }}
          >
            {t(`${filters?.delivery_type?.value || 'all'}.orders`)}
          </Typography.Title>
          <Space style={{ rowGap: '20px', columnGap: '20px' }}>
            <OrderTypeSwitcher listType='orders-board' role='seller' />
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={goToAddOrder}
              style={{ width: '100%' }}
            >
              {t('create.order')}
            </Button>
          </Space>
        </Space>
        <Divider color='var(--divider)' />
        <OrderFilters
          role='seller'
          defaultValues={filters}
          onChange={handleFilter}
          onClearAll={handleClearAllFilters}
        />
        <Divider color='var(--divider)' />
        <Incorporate
          goToShow={goToShow}
          fetchOrderAllItem={fetchOrderAllItem}
          fetchOrders={fetchOrdersCase}
          setLocationsMap={setLocationsMap}
          setId={setId}
          setIsModalVisible={setIsModalVisible}
          setText={setText}
          setDowloadModal={setDownloadModal}
          type={type}
          setType={setType}
          orderType={orderType}
        />
      </Card>
      {orderDeliveryDetails && (
        <Suspense fallback={<Loading />}>
          <OrderDeliveryman
            data={orderDeliveryDetails}
            handleCancel={handleCloseModal}
            role='seller'
          />
        </Suspense>
      )}
      {locationsMap && (
        <Suspense fallback={<Loading />}>
          <OrderLocationMap
            id={locationsMap}
            onCancel={handleCloseModal}
            role='seller'
          />
        </Suspense>
      )}
      {downloadModal && (
        <Suspense fallback={<Loading />}>
          <DownloadModal id={downloadModal} handleCancel={handleCloseModal} />
        </Suspense>
      )}
      <CustomModal
        click={orderDelete}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        loading={loadingBtn}
        setText={setId}
        setActive={setId}
      />
    </>
  );
}
