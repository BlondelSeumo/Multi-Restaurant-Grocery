import { useEffect, useState } from 'react';
import { Divider, Space, Table, Tabs, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchDeliverymanOrders } from 'redux/slices/orders';
import numberToPrice from 'helpers/numberToPrice';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import { fetchRestOrderStatus } from 'redux/slices/orderStatus';
import OrderFilters from 'components/order-filters';
import FilterColumns from 'components/filter-column';
import getFullDateTime from 'helpers/getFullDateTime';

const { TabPane } = Tabs;

const initialFilterValues = {
  date: null,
  search: '',
  status: 'all',
  page: 1,
  perPage: 10,
};

export default function DeliverymanOrders() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, meta, loading } = useSelector(
    (state) => state.orders,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );

  const [filters, setFilters] = useState({});

  const statuses = [
    { name: 'all', id: '0', active: true, sort: 0 },
    ...activeStatusList,
  ];
  const paramsData = {
    search: filters?.search || undefined,
    date_from: filters?.date?.from || undefined,
    date_to: filters?.date?.to || undefined,
    perPage: filters?.perPage,
    page: filters?.page,
    deleted_at: filters?.status === 'deleted_at' ? 'deleted_at' : undefined,
    status:
      filters?.status !== 'deleted_at' && filters?.status !== 'all'
        ? filters?.status
        : undefined,
  };

  const goToShow = (id) => {
    dispatch(
      addMenu({
        url: `deliveryman/order/details/${id}`,
        id: 'order_details',
        name: t('order.details'),
      }),
    );
    navigate(`/deliveryman/order/details/${id}`);
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
      render: (delivery_date_time) => (
        <div style={{ minWidth: '100px' }}>
          {delivery_date_time?.length
            ? getFullDateTime(delivery_date_time, true, true)
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
      title: t('branch'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => <div>{shop ? shop?.translation?.title : t('N/A')}</div>,
    },
    {
      title: t('order.status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div className={tableRowClasses.status}>
          <span className={tableRowClasses[status || 'new']}>{t(status)}</span>
        </div>
      ),
    },
    {
      title: t('num.of.products'),
      dataIndex: 'order_details_count',
      key: 'order_details_count',
      is_show: true,
      render: (order_details_count) => <div>{order_details_count ?? 0}</div>,
    },
    {
      title: t('amount'),
      is_show: true,
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total_price = 0) => <div>{numberToPrice(total_price)}</div>,
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
      render: (transactions) => (
        <div className={tableRowClasses.paymentStatuses}>
          {transactions?.length
            ? transactions?.map((item) => (
                <span
                  key={item?.id}
                  className={`${tableRowClasses.paymentStatus} ${tableRowClasses[item?.status]}`}
                >
                  {t(item?.status)}
                </span>
              ))
            : t('N/A')}
        </div>
      ),
    },
    {
      title: t('actions'),
      dataIndex: 'id',
      key: 'actions',
      is_show: true,
      render: (id) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.details}`}
            onClick={(e) => {
              e.stopPropagation();
              goToShow(id);
            }}
          >
            <EyeOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const handleClearAllFilters = () => {
    setFilters({ ...initialFilterValues, page: 1 });
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({
      perPage,
      page: +perPage === +filters?.perPage ? page : 1,
    });
  };

  const fetchDeliverymanOrdersLocal = () => {
    dispatch(fetchDeliverymanOrders(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  useEffect(() => {
    dispatch(fetchRestOrderStatus({}));
    fetchDeliverymanOrdersLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    fetchDeliverymanOrdersLocal();
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu?.refetch) {
      fetchDeliverymanOrdersLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu?.refetch]);

  return (
    <Card>
      <Space className='align-items-center justify-content-between w-100'>
        <Typography.Title
          level={1}
          style={{
            color: 'var(--text)',
            fontSize: '20px',
            fontWeight: 500,
            padding: 0,
            margin: 0,
          }}
        >
          {t('all.orders')}
        </Typography.Title>
      </Space>
      <Divider color='var(--divider)' />
      <OrderFilters
        defaultValues={filters}
        onChange={handleFilter}
        onClearAll={handleClearAllFilters}
        role='deliveryman'
      />
      <Divider color='var(--divider)' />
      <Space className='justify-content-between align-items-start w-100'>
        <Tabs
          onChange={(key) => handleFilter('status', key)}
          type='card'
          activeKey={filters?.status}
        >
          {statuses
            .filter((ex) => ex?.active)
            .map((item) => (
              <TabPane tab={t(item?.name)} key={item?.name} />
            ))}
        </Tabs>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Table
        scroll={{ x: true }}
        columns={columns?.filter((items) => items.is_show)}
        dataSource={orders}
        loading={loading}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        rowKey={(record) => record?.id}
        onChange={onChangePagination}
      />
    </Card>
  );
}
