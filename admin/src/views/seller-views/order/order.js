import { useState, useContext, lazy, useEffect, Suspense } from 'react';
import { Button, Divider, Space, Table, Tabs, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchOrders as fetchSellerOrders } from 'redux/slices/sellerOrders';
import formatSortType from 'helpers/formatSortType';
import { clearOrder } from 'redux/slices/order';
import numberToPrice from 'helpers/numberToPrice';
import { fetchRestOrderStatus } from 'redux/slices/orderStatus';
import { Context } from 'context/context';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import orderService from 'services/seller/order';
import OrderTypeSwitcher from 'components/order-type-switcher';
import moment from 'moment';
import OrderFilters from 'components/order-filters';
import Loading from 'components/loading';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import FilterColumns from 'components/filter-column';
import { getDeliveryDateTime } from 'helpers/getDeliveryDateTime';

const { TabPane } = Tabs;
const OrderStatusModal = lazy(
  () => import('components/order-details/components/status-modal'),
);
const OrderDeliveryman = lazy(
  () => import('components/order-details/components/deliveryman-modal'),
);
const OrderPaymentStatusModal = lazy(
  () => import('components/order-details/components/payment-status-modal'),
);

export default function SellerOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { setIsModalVisible } = useContext(Context);
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { orders, meta, loading, params } = useSelector(
    (state) => state.sellerOrders,
    shallowEqual,
  );

  const initialFilterValues = {
    user: null,
    date: null,
    search: '',
    sort: null,
    column: null,
    delivery_type: null,
    status: 'all',
    page: params?.page || 1,
    perPage: params?.perPage === 5 ? 10 : params?.perPage || 10,
  };

  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const [paymentStatusModal, setPaymentStatusModal] = useState(null);

  const statuses = [
    { name: 'all', id: '0', active: true, sort: 0 },
    ...activeStatusList,
  ];
  const paramsData = {
    shop_id: myShop?.id,
    search: filters?.search || undefined,
    user_id: filters?.user?.value || undefined,
    date_from: filters?.date?.from || undefined,
    date_to: filters?.date?.to || undefined,
    sort: filters?.sort,
    column: filters?.column,
    perPage: filters?.perPage,
    page: filters?.page,
    deleted_at: filters?.status === 'deleted_at' ? 'deleted_at' : undefined,
    delivery_type:
      filters?.delivery_type?.value !== 'scheduled'
        ? filters?.delivery_type?.value
        : undefined,
    delivery_date_from:
      filters?.delivery_type?.value === 'scheduled'
        ? moment().add(1, 'day').format('YYYY-MM-DD')
        : undefined,
    status:
      filters?.status !== 'deleted_at' && filters?.status !== 'all'
        ? filters?.status
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
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('delivery.date'),
      dataIndex: 'delivery_date_time',
      key: 'delivery_date',
      is_show: true,
      render: (_, row) => (
        <div style={{ minWidth: '100px' }}>
          {row?.delivery_date && row?.delivery_time
            ? getDeliveryDateTime(row?.delivery_date, row?.delivery_time)
            : t('N/A')}
        </div>
      ),
    },
    {
      title: t('customer'),
      dataIndex: 'user',
      key: 'user',
      is_show: true,
      render: (user) => (
        <div>
          {user ? (
            `${user?.firstname || ''} ${user?.lastname || ''}`
          ) : (
            <Tag color='red'>{t('deleted.user')}</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('order.type'),
      dataIndex: 'delivery_type',
      key: 'delivery_type',
      is_show: true,
      render: (deliveryType) => <div>{t(deliveryType || 'N/A')}</div>,
    },
    {
      title: t('order.status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => {
        const isCanEdit =
          !row?.deleted_at && status !== 'delivered' && status !== 'canceled';
        return (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              if (isCanEdit) {
                setOrderDetails(row);
              }
            }}
            className={tableRowClasses.status}
            disabled={!isCanEdit}
          >
            <span className={tableRowClasses[status || 'new']}>
              {t(status)}
            </span>
            {isCanEdit && <EditOutlined size={12} />}
          </button>
        );
      },
    },
    {
      title: t('products'),
      dataIndex: 'order_details_count',
      key: 'order_details_count',
      is_show: true,
      render: (order_details_count) => <div>{order_details_count ?? 0}</div>,
    },
    {
      title: t('total.price'),
      is_show: true,
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total_price = 0) => (
        <div style={{ minWidth: '100px' }}>{numberToPrice(total_price)}</div>
      ),
    },
    {
      title: t('payment.type'),
      is_show: true,
      dataIndex: 'transactions',
      key: 'payment_type',
      render: (transactions) => (
        <div className={tableRowClasses.paymentStatuses}>
          {transactions?.length
            ? transactions?.map((item) => (
                <span style={{ color: 'var(--green)' }} key={item?.id}>
                  {t(item?.payment_system?.tag)}
                </span>
              ))
            : t('N/A')}
        </div>
      ),
    },
    {
      title: t('payment.status'),
      dataIndex: 'transactions',
      key: 'payment_status',
      is_show: true,
      render: (transactions, row) => (
        <div className={tableRowClasses.paymentStatuses}>
          {transactions?.length
            ? transactions?.map((item) => (
                <button
                  type='button'
                  key={item?.id}
                  className='cursor-pointer d-flex align-items-center'
                  style={{ columnGap: '5px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaymentStatusModal({
                      orderId: row?.id,
                      id: item?.id,
                      status: item?.status,
                    });
                  }}
                >
                  <span
                    className={`${tableRowClasses.paymentStatus} ${tableRowClasses[item?.status]}`}
                  >
                    {t(item?.status)}
                  </span>
                  <EditOutlined size={18} />
                </button>
              ))
            : t('N/A')}
        </div>
      ),
    },
    {
      title: t('options'),
      dataIndex: 'id',
      key: 'options',
      is_show: true,
      render: (id, row) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.details}`}
            disabled={row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              goToShow(row);
            }}
          >
            <EyeOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            disabled={row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setId([id]);
              setIsModalVisible(true);
              setText(true);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

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
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
        dispatch(fetchSellerOrders(paramsData));
        setText(null);
      })
      .finally(() => {
        setLoadingBtn(false);
        setId(null);
      });
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
    navigate('/seller/pos-system');
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.order'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const handleCloseModal = () => {
    setOrderDeliveryDetails(null);
    setOrderDetails(null);
    setPaymentStatusModal(null);
  };

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const handleClearAllFilters = () => {
    setFilters({ ...initialFilterValues, page: 1 });
  };

  const onChangePagination = (pagination, filters, sorter) => {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    handleUpdateFilter({
      perPage,
      page: +perPage === +params?.perPage ? page : 1,
      column,
      sort,
    });
  };

  const onChangeTab = (status) => {
    handleFilter('status', status);
  };

  useEffect(() => {
    dispatch(fetchRestOrderStatus({}));
    dispatch(fetchSellerOrders(paramsData));
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu?.refetch) {
      dispatch(fetchSellerOrders(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu?.refetch]);

  useDidUpdate(() => {
    dispatch(fetchSellerOrders(paramsData));
    dispatch(disableRefetch(activeMenu));
  }, [filters]);

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
            <OrderTypeSwitcher listType='orders' role='seller' />
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
        <Space className='justify-content-between align-items-start w-100'>
          <Tabs onChange={onChangeTab} type='card' activeKey={filters?.status}>
            {statuses
              .filter((ex) => ex?.active)
              .map((item) => (
                <TabPane tab={t(item?.name)} key={item?.name} />
              ))}
          </Tabs>
          <Space>
            <OutlinedButton
              disabled={filters?.status === 'deleted_at'}
              onClick={allDelete}
              color='red'
            >
              {t('delete.selection')}
            </OutlinedButton>
            <FilterColumns columns={columns} setColumns={setColumns} />
          </Space>
        </Space>
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={orders}
          loading={loading}
          pagination={{
            pageSize: meta?.per_page || 10,
            page: meta?.current_page || 1,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          rowKey={(record) => record.id}
          onChange={onChangePagination}
        />
      </Card>

      <CustomModal
        click={orderDelete}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        loading={loadingBtn}
        setText={setId}
      />
      {orderDetails && (
        <Suspense fallback={<Loading />}>
          <OrderStatusModal
            data={orderDetails}
            handleCancel={handleCloseModal}
            activeStatuses={activeStatusList}
            role='seller'
          />
        </Suspense>
      )}
      {orderDeliveryDetails && (
        <Suspense fallback={<Loading />}>
          <OrderDeliveryman
            data={orderDeliveryDetails}
            handleCancel={handleCloseModal}
            role='seller'
          />
        </Suspense>
      )}
      {!!paymentStatusModal && (
        <Suspense fallback={<Loading />}>
          <OrderPaymentStatusModal
            role='seller'
            id={paymentStatusModal?.id}
            status={paymentStatusModal?.status}
            orderId={paymentStatusModal?.orderId}
            handleCancel={handleCloseModal}
          />
        </Suspense>
      )}
    </>
  );
}
