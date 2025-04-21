import { lazy, Suspense, useEffect, useState } from 'react';
import { Button, Divider, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ClearOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { fetchOrders as fetchWaiterOrders } from 'redux/slices/waiterOrder';
import useDidUpdate from 'helpers/useDidUpdate';
import SearchInput from 'components/search-input';
import numberToPrice from 'helpers/numberToPrice';
import FilterColumns from 'components/filter-column';
import orderService from 'services/waiter/order';
import { DebounceSelect } from 'components/search';
import bookingTable from 'services/booking-table';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import { fetchRestOrderStatus } from 'redux/slices/orderStatus';
import getFullDateTime from 'helpers/getFullDateTime';
import Loading from 'components/loading';

const OrderStatusModal = lazy(
  () => import('components/order-details/components/status-modal'),
);

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
  table: null,
};

export default function WaiterOrder() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { orders, meta, loading, params } = useSelector(
    (state) => state.waiterOrder,
    shallowEqual,
  );
  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );

  const [isAttaching, setIsAttaching] = useState(false);
  const [filters, setFilters] = useState(initialFilterValues);
  const [orderDetails, setOrderDetails] = useState(null);

  const goToShow = (id) => {
    dispatch(
      addMenu({
        url: `waiter/order/details/${id}`,
        id: 'order_details',
        name: t('order.details'),
      }),
    );
    navigate(`/waiter/order/details/${id}`);
  };

  const handleAttachToMe = (id) => {
    setIsAttaching(true);
    orderService
      .attachToMe(id)
      .then(() => {
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setIsAttaching(false);
      });
  };
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('table'),
      dataIndex: 'table',
      key: 'table',
      is_show: true,
      render: (table) => table?.name || t('N/A'),
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
      render: (total_price = 0) => numberToPrice(total_price),
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
                <span key={item?.id} style={{ color: 'var(--green)' }}>
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
      title: t('created.at'),
      is_show: true,
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => getFullDateTime(created_at),
    },
    {
      title: t('actions'),
      key: 'actions',
      dataIndex: 'id',
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
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.location}`}
            onClick={(e) => {
              e.stopPropagation();
              handleAttachToMe(id);
            }}
          >
            <PlusOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    table_id: filters?.table?.value || undefined,
    delivery_type: 'dine_in',
    'empty-waiter': 1,
  };

  // const rowSelection = {
  //   selectedRowKeys: id,
  //   onChange: (key) => {
  //     setId(key);
  //   },
  // };

  async function fetchTables(search = '') {
    const params = {
      search: search || undefined,
      page: 1,
      perPage: 20,
    };
    return bookingTable.getAllRestTables(params).then(({ data }) => {
      return data.map((item) => ({
        label: item?.name,
        value: item?.id,
        key: item?.id,
      }));
    });
  }

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
      page: +perPage === +params?.perPage ? page : 1,
    });
  };

  const fetchWaiterOrdersLocal = () => {
    dispatch(fetchWaiterOrders(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  useEffect(() => {
    dispatch(fetchRestOrderStatus({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchWaiterOrdersLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    fetchWaiterOrdersLocal();
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu?.refetch) {
      fetchWaiterOrdersLocal();
    }
    // eslint-disable-next-line
  }, [activeMenu?.refetch]);

  return (
    <>
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
            {t('my.orders')}
          </Typography.Title>
        </Space>
        <Divider color='var(--divider)' />
        <Space wrap>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFilter('search', search)}
            defaultValue={filters?.search}
            resetSearch={!filters?.search}
          />
          <DebounceSelect
            placeholder={t('select.table')}
            fetchOptions={fetchTables}
            onChange={(item) => handleFilter('table', item)}
            style={{ minWidth: 250 }}
          />
          <Button icon={<ClearOutlined />} onClick={handleClearAllFilters}>
            {t('clear')}
          </Button>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
        <Divider color='var(--divider)' />
        <Table
          scroll={{ x: true }}
          // rowSelection={rowSelection}
          columns={columns?.filter((items) => items.is_show)}
          dataSource={orders}
          loading={loading || isAttaching}
          pagination={{
            pageSize: meta?.per_page || 10,
            page: meta?.current_page || 1,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          rowKey={(record) => record?.id}
          onChange={onChangePagination}
        />
        {orderDetails && (
          <Suspense fallback={<Loading />}>
            <OrderStatusModal
              data={orderDetails}
              handleCancel={() => setOrderDetails(null)}
              activeStatuses={activeStatusList}
              role='waiter'
            />
          </Suspense>
        )}
      </Card>
    </>
  );
}
