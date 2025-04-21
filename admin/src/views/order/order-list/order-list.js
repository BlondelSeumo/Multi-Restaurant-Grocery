import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import {
  Button,
  Space,
  Table,
  Tabs,
  Tag,
  Col,
  Typography,
  Divider,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenu,
  setRefetch,
} from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import { clearItems, fetchOrders } from 'redux/slices/orders';
import formatSortType from 'helpers/formatSortType';
import { clearOrder } from 'redux/slices/order';
import numberToPrice from 'helpers/numberToPrice';
import { fetchOrderStatus } from 'redux/slices/orderStatus';
import { toast } from 'react-toastify';
import orderService from 'services/order';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import moment from 'moment';
import { export_url } from 'configs/app-global';
import { BiMap } from 'react-icons/bi';
import ResultModal from 'components/result-modal';
import OrderFilters from 'components/order-filters';
import DownloadModal from '../downloadModal';
import OrderTypeSwitcher from 'components/order-type-switcher';
import Loading from 'components/loading';
import Card from 'components/card';
import { PiFileArrowUpBold } from 'react-icons/pi';
import OutlinedButton from 'components/outlined-button';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import FilterColumns from 'components/filter-column';
import { getDeliveryDateTime } from 'helpers/getDeliveryDateTime';

const { TabPane } = Tabs;
const OrderStatusModal = lazy(
  () => import('components/order-details/components/status-modal'),
);
const OrderDeliveryman = lazy(
  () => import('components/order-details/components/deliveryman-modal'),
);
const OrderLocationMap = lazy(
  () => import('components/order-location-map/order-location-map'),
);
const OrderPaymentStatusModal = lazy(
  () => import('components/order-details/components/payment-status-modal'),
);

export default function OrderListPage() {
  const { type } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { activeStatusList } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { orders, loading, params, meta } = useSelector(
    (state) => state.orders,
    shallowEqual,
  );
  const { setIsModalVisible } = useContext(Context);

  // const getPage = (type = 'any') => {
  //   if (
  //       (+meta?.current_page === +meta?.last_page && +orders?.length < 2) ||
  //       (type === 'delete' && id?.length === +orders?.length)
  //   ) {
  //     return +meta?.current_page - 1 || 1;
  //   }
  //   return +meta?.current_page;
  // };

  const initialFilterValues = {
    shop: null,
    user: null,
    date: null,
    search: '',
    sort: null,
    column: null,
    status: 'all',
    page: params?.page || 1,
    perPage: params?.perPage === 5 ? 10 : params?.perPage || 10,
  };

  const [downloading, setDownloading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const [orderDetails, setOrderDetails] = useState(null);
  const [locationsMap, setLocationsMap] = useState(null);
  const [downloadModal, setDownloadModal] = useState(null);
  const [paymentStatusModal, setPaymentStatusModal] = useState(null);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const statuses = [
    { name: 'all', id: '0', active: true, sort: 0 },
    ...activeStatusList,
  ];
  const [restore, setRestore] = useState(null);

  const paramsData = {
    search: filters?.search || undefined,
    shop_id: filters?.shop?.value || undefined,
    user_id: filters?.user?.value || undefined,
    date_from: filters?.date?.from || undefined,
    date_to: filters?.date?.to || undefined,
    sort: filters?.sort,
    column: filters?.column,
    perPage: filters?.perPage,
    page: filters?.page,
    deleted_at: filters?.status === 'deleted_at' ? 'deleted_at' : undefined,
    delivery_type: type !== 'scheduled' ? type : undefined,
    delivery_date_from:
      type === 'scheduled'
        ? moment().add(1, 'day').format('YYYY-MM-DD')
        : undefined,
    status:
      filters?.status !== 'deleted_at' && filters?.status !== 'all'
        ? filters?.status
        : undefined,
  };

  const initialColumns = [
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
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
      title: t('branch'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => <div>{shop ? shop?.translation?.title : t('N/A')}</div>,
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
      title: t('actions'),
      dataIndex: 'id',
      key: 'actions',
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
            className={`${tableRowClasses.option} ${tableRowClasses.location}`}
            disabled={row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setLocationsMap(id);
            }}
          >
            <BiMap />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            disabled={row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              goToEdit(row);
            }}
          >
            <EditOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.download}`}
            disabled={row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setDownloadModal(id);
            }}
          >
            <DownloadOutlined />
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
      }),
    );
    navigate('/pos-system');
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
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
        dispatch(setRefetch(activeMenu));
        setText(null);
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  const orderDropAll = () => {
    setLoadingBtn(true);
    orderService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const orderRestoreAll = () => {
    setLoadingBtn(true);
    orderService
      .restoreAll()
      .then(() => {
        toast.success(t('it.will.take.some.time.to.return.the.files'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const excelExport = () => {
    setDownloading(true);
    orderService
      .export(paramsData)
      .then((res) => {
        if (res.data.file_name) {
          window.location.href = export_url + res.data.file_name;
        }
      })
      .finally(() => setDownloading(false));
  };

  const onChangeTab = (status) => {
    handleFilter('status', status);
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
    setOrderDetails(null);
    setOrderDeliveryDetails(null);
    setLocationsMap(null);
    setDownloadModal(null);
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

  useEffect(() => {
    dispatch(fetchOrderStatus({}));
    dispatch(fetchOrders(paramsData));
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu?.refetch) {
      dispatch(clearItems());
      dispatch(fetchOrders({ ...paramsData, page: 1 }));
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, activeMenu?.refetch]);

  useDidUpdate(() => {
    dispatch(clearItems());
    dispatch(fetchOrders(paramsData));
    dispatch(disableRefetch(activeMenu));
  }, [filters, type]);

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
            {t(`${type || 'all'}.orders`)}
          </Typography.Title>
          <Space style={{ rowGap: '20px', columnGap: '20px' }}>
            <OrderTypeSwitcher listType='orders' />
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
      {!!paymentStatusModal && (
        <Suspense fallback={<Loading />}>
          <OrderPaymentStatusModal
            role='admin'
            id={paymentStatusModal?.id}
            status={paymentStatusModal?.status}
            orderId={paymentStatusModal?.orderId}
            handleCancel={handleCloseModal}
          />
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
      {!!restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? orderRestoreAll : orderDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </>
  );
}
