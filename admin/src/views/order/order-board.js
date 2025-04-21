import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { Button, Col, Divider, Space, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenu } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import {
  clearItems,
  fetchAcceptedOrders,
  fetchCanceledOrders,
  fetchCookingOrders,
  fetchDeliveredOrders,
  fetchNewOrders,
  fetchOnAWayOrders,
  fetchOrders,
  fetchReadyOrders,
} from 'redux/slices/orders';
import {
  fetchOrderStatus,
  fetchRestOrderStatus,
} from 'redux/slices/orderStatus';
import { clearOrder } from 'redux/slices/order';
import DownloadModal from './downloadModal';
import { toast } from 'react-toastify';
import orderService from 'services/order';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import moment from 'moment';
import Incorporate from './dnd/Incorporate';
import OrderTypeSwitcher from 'components/order-type-switcher';
import { export_url } from 'configs/app-global';
import OrderFilters from 'components/order-filters';
import Loading from 'components/loading';
import { PiFileArrowUpBold } from 'react-icons/pi';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';

const OrderLocationMap = lazy(
  () => import('components/order-location-map/order-location-map'),
);
const OrderDeliveryman = lazy(
  () => import('components/order-details/components/deliveryman-modal'),
);
const OrderStatusModal = lazy(
  () => import('components/order-details/components/status-modal'),
);

const initialFilterValues = {
  shop: null,
  user: null,
  date: null,
  search: '',
};

export default function OrderBoard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { type } = useParams();

  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );

  const [orderDetails, setOrderDetails] = useState(null);
  const [locationsMap, setLocationsMap] = useState(null);
  const [downloadModal, setDownloadModal] = useState(null);
  const [downloading, setDownLoading] = useState(false);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const [tabType, setTabType] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);

  const goToEdit = (row) => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        url: `order/${row.id}`,
        id: 'order_edit',
        name: t('edit.order'),
      }),
    );
    navigate(`/order/${row.id}`);
  };

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      }),
    );
    navigate(`/order/details/${row.id}`);
  };

  const goToOrderCreate = () => {
    dispatch(clearOrder());
    dispatch(
      setMenu({
        id: 'pos.system_01',
        url: 'pos-system',
        name: 'pos.system',
        icon: 'laptop',
        data: activeMenu.data,
        refetch: true,
      }),
    );
    navigate('/pos-system');
  };

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const data = activeMenu?.data;

  const paramsData = {
    search: filters?.search || undefined,
    user_id: filters?.user?.value || undefined,
    shop_id: filters?.shop?.value || undefined,
    date_from: filters?.date?.from || undefined,
    date_to: filters?.date?.to || undefined,
    perPage: data?.perPage || 5,
    page: data?.page || 1,
    status: data?.role !== 'deleted_at' && data?.role,
    delivery_type: type !== 'scheduled' ? type : undefined,
    delivery_date_from:
      type === 'scheduled'
        ? moment().add(1, 'day').format('YYYY-MM-DD')
        : undefined,
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
        fetchOrderAllItem({ status: tabType });
        setText(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const excelExport = () => {
    setDownLoading(true);
    orderService
      .export(paramsData)
      .then((res) => {
        window.location.href = export_url + res.data.file_name;
      })
      .finally(() => setDownLoading(false));
  };

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
    // batch(() => {
    //   dispatch(clearItems());
    //   dispatch(
    //     setMenuData({
    //       activeMenu,
    //       data: { ...data, ...{ [name]: item } },
    //     }),
    //   );
    // });
  };

  const handleClearAllFilters = () => {
    setFilters(initialFilterValues);
  };

  const handleCloseModal = () => {
    setOrderDetails(null);
    setOrderDeliveryDetails(null);
    setLocationsMap(null);
    setDownloadModal(null);
  };

  const fetchOrdersCase = (params) => {
    const paramsWithType = {
      ...params,
      delivery_type: paramsData?.delivery_type,
      delivery_date_from: paramsData?.delivery_date_from,
      search: paramsData?.search,
      user_id: paramsData?.user_id,
      shop_id: paramsData?.shop_id,
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

  useEffect(() => {
    if (activeMenu?.refetch) {
      dispatch(fetchOrders(paramsData));
      dispatch(fetchOrderStatus({}));
      dispatch(fetchRestOrderStatus({}));
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu?.refetch]);

  useDidUpdate(() => {
    dispatch(clearItems());
    fetchOrderAllItem();
  }, [filters]);

  return (
    <>
      <Card>
        <Space className='justify-content-between w-100'>
          <Typography.Title
            level={1}
            style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 500 }}
          >
            {t(`${type || 'all'}.orders`)}
          </Typography.Title>
          <Space style={{ rowGap: '20px', columnGap: '20px' }}>
            <OrderTypeSwitcher listType='orders-board' />
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={goToOrderCreate}
              style={{ width: '100%' }}
            >
              {t('create.order')}
            </Button>
          </Space>
        </Space>
        <Divider color='var(--divider)' />
        <OrderFilters
          defaultValues={filters}
          onChange={handleFilter}
          onClearAll={handleClearAllFilters}
          extras={[
            <Col key='export'>
              <OutlinedButton onClick={excelExport} loading={downloading}>
                <PiFileArrowUpBold />
                {t('export')}
              </OutlinedButton>
            </Col>,
          ]}
        />
        <Divider color='var(--divider)' />
        <Incorporate
          goToEdit={goToEdit}
          goToShow={goToShow}
          fetchOrderAllItem={fetchOrderAllItem}
          fetchOrders={fetchOrdersCase}
          setLocationsMap={setLocationsMap}
          setId={setId}
          setIsModalVisible={setIsModalVisible}
          setText={setText}
          setDowloadModal={setDownloadModal}
          type={type}
          setTabType={setTabType}
        />
      </Card>
      {orderDetails && (
        <Suspense fallback={<Loading />}>
          <OrderStatusModal
            data={orderDetails}
            handleCancel={handleCloseModal}
            activeStatuses={activeStatusList}
            role='admin'
          />
        </Suspense>
      )}
      {orderDeliveryDetails && (
        <Suspense fallback={<Loading />}>
          <OrderDeliveryman
            data={orderDeliveryDetails}
            handleCancel={handleCloseModal}
            role='admin'
          />
        </Suspense>
      )}
      {locationsMap && (
        <Suspense fallback={<Loading />}>
          <OrderLocationMap id={locationsMap} onCancel={handleCloseModal} />
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
      />
    </>
  );
}
