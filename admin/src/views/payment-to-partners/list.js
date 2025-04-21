import { useEffect, useState } from 'react';
import { Button, Space, Table, Card, DatePicker, Row, Col } from 'antd';
import { useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import numberToPrice from 'helpers/numberToPrice';
import userService from 'services/user';
import { toast } from 'react-toastify';
import moment from 'moment';
import shopService from 'services/restaurant';
import { fetchPaymentToPartnersList } from 'redux/slices/paymentToPartners';
import paymentToPartnerService from 'services/payment-to-partner';
import PaymentPartnersConfirmation from './payment-type';
import StatisticNumberWidget from 'views/dashboard/statisticNumberWidget';
import { InfiniteSelect } from 'components/infinite-select';
import createSelectObject from 'helpers/createSelectObject';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';

const { RangePicker } = DatePicker;

const initialFilterValues = {
  date: {
    from: moment().subtract(1, 'month').format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD'),
  },
  shop: null,
  user: null,
  page: 1,
  perPage: 10,
};

export default function PaymentToPartnersList() {
  const { type } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { list, loading, meta } = useSelector(
    (state) => state.paymentToPartners,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [filters, setFilters] = useState(initialFilterValues);
  const [hasMore, setHasMore] = useState({
    user: false,
    shop: false,
  });
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const columns = [
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t(type),
      is_show: true,
      dataIndex: 'user',
      key: 'user',
      render: (_, row) => {
        const user = type === 'seller' ? row?.shop?.seller : row?.deliveryman;
        return (
          <div>
            {user?.firstname || ''} {user?.lastname || ''}
          </div>
        );
      },
    },
    {
      title: t('order.total.price'),
      is_show: true,
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total_price) => numberToPrice(total_price),
    },
    ...(type === 'seller'
      ? [
          {
            title: t('coupon.price'),
            is_show: true,
            dataIndex: 'coupon_sum_price',
            key: 'coupon_sum_price',
            render: (couponPrice) => numberToPrice(couponPrice),
          },
        ]
      : []),
    ...(type === 'seller'
      ? [
          {
            title: t('total.cashback'),
            is_show: true,
            dataIndex: 'point_history_sum_price',
            key: 'point_history_sum_price',
            render: (cashback) => numberToPrice(cashback),
          },
        ]
      : []),
    {
      title: t('delivery.fee'),
      is_show: true,
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      render: (deliveryFee) => numberToPrice(deliveryFee),
    },
    ...(type === 'seller'
      ? [
          {
            title: t('service.fee'),
            is_show: true,
            dataIndex: 'service_fee',
            key: 'service_fee',
            render: (_, row) =>
              numberToPrice(
                (row.service_fee || 0) + (row.commission_fee || 0),
                defaultCurrency?.symbol,
                defaultCurrency?.position,
              ),
          },
        ]
      : []),
    ...(type === 'seller'
      ? [
          {
            title: t('seller.fee'),
            is_show: true,
            dataIndex: 'seller_fee',
            key: 'seller_fee',
            render: (sellerFee) => numberToPrice(sellerFee),
          },
        ]
      : []),
    {
      title: t('payment.type'),
      is_show: true,
      dataIndex: 'transactions',
      key: 'transactions',
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
  ];

  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    user_id: filters?.user?.value || undefined,
    shop_id: filters?.shop?.value || undefined,
    date_from: filters?.date?.from || undefined,
    date_to: filters?.date?.to || undefined,
    type,
  };

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({
      perPage,
      page: +perPage === +filters?.perPage ? page : 1,
    });
  };

  const payToUser = (paymentId) => {
    setLoadingBtn(true);
    const params = {
      data: id,
      type,
      payment_id: paymentId,
    };

    paymentToPartnerService
      .pay(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.payed'));
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
        setConfirmationModalOpen(false);
      });
  };

  const fetchShops = ({ search = '', page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
    };
    return shopService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        shop: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data?.map((item) => createSelectObject(item));
    });
  };

  const fetchUsers = ({ search = '', page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
    };
    return userService.search(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        user: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data.map((item) => ({
        label: `${item?.firstname || ''} ${item?.lastname || ''}`,
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const fetchPaymentToPartnersListLocal = () => {
    dispatch(fetchPaymentToPartnersList(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchPaymentToPartnersListLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu?.refetch) {
      fetchPaymentToPartnersListLocal();
    }
  }, [activeMenu?.refetch]);

  useDidUpdate(() => {
    fetchPaymentToPartnersListLocal();
  }, [filters, type]);

  return (
    <>
      <Card>
        <Space wrap>
          <Col style={{ minWidth: '160px' }}>
            <InfiniteSelect
              placeholder={t('all.branches')}
              hasMore={hasMore?.shop}
              fetchOptions={fetchShops}
              onChange={(item) => handleFilter('shop', item)}
              className='w-100'
              value={filters?.shop}
            />
          </Col>
          <Col style={{ minWidth: '189px' }}>
            <InfiniteSelect
              placeholder={t('select.user')}
              hasMore={hasMore?.user}
              fetchOptions={fetchUsers}
              onChange={(item) => handleFilter('user', item)}
              className='w-100'
              value={filters?.user}
            />
          </Col>
          <Col style={{ minWidth: '242px' }}>
            <RangePicker
              allowClear
              className='w-100'
              placeholder={[t('from.date'), t('to.date')]}
              disabledDate={(current) =>
                current && current > moment().endOf('day')
              }
              value={
                filters?.date
                  ? [
                      moment(filters?.date?.from, 'YYYY-MM-DD'),
                      moment(filters?.date?.to, 'YYYY-MM-DD'),
                    ]
                  : undefined
              }
              onChange={(date) => {
                if (date) {
                  handleFilter('date', {
                    from: moment(date?.[0]).format('YYYY-MM-DD'),
                    to: moment(date?.[1]).format('YYYY-MM-DD'),
                  });
                } else {
                  handleFilter('date', null);
                }
              }}
            />
          </Col>
          <Button
            type='primary'
            disabled={!id || id.length === 0}
            onClick={() => setConfirmationModalOpen(true)}
          >
            {t('pay')}
          </Button>
        </Space>
      </Card>

      <Row gutter={16} className='mt-3'>
        <Col flex='0 0 25%'>
          <StatisticNumberWidget
            title={t('commission.fee')}
            value={numberToPrice(
              list?.total_commission_fee,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
            color='purple'
          />
        </Col>
        <Col flex='0 0 25%'>
          <StatisticNumberWidget
            title={t('coupon')}
            value={numberToPrice(
              list?.total_coupon,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
            color='red'
          />
        </Col>
        <Col flex='0 0 25%'>
          <StatisticNumberWidget
            title={t('delivery.fee')}
            value={numberToPrice(
              list?.total_delivery_fee,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
            color='green'
          />
        </Col>
        <Col flex='0 0 25%'>
          <StatisticNumberWidget
            title={t('point.history')}
            value={numberToPrice(
              list?.total_point_history,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
            color='purple'
          />
        </Col>
        <Col flex='0 0 25%'>
          <StatisticNumberWidget
            title={t('price')}
            value={numberToPrice(
              list?.total_price,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
            color='red'
          />
        </Col>
        <Col flex='0 0 25%'>
          <StatisticNumberWidget
            title={t('seller.fee')}
            value={numberToPrice(
              list?.total_seller_fee,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
            color='purple'
          />
        </Col>
        <Col flex='0 0 25%'>
          <StatisticNumberWidget
            title={t('service.fee')}
            value={numberToPrice(
              list?.total_service_fee,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
            color='red'
          />
        </Col>
        <Col flex='0 0 25%'>
          <StatisticNumberWidget
            title={t('tax')}
            value={numberToPrice(
              list?.total_tax,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )}
            color='green'
          />
        </Col>
      </Row>
      <Card>
        <Table
          scroll={{ x: true }}
          columns={columns?.filter((items) => items.is_show)}
          dataSource={list?.data}
          loading={loading}
          pagination={{
            pageSize: +meta?.perPage || 10,
            page: +meta?.page || 1,
            total: +meta?.total || 0,
            current: +meta?.page || 1,
          }}
          rowKey={(record) => record?.id}
          onChange={onChangePagination}
          rowSelection={rowSelection}
        />
      </Card>

      {confirmationModalOpen && (
        <PaymentPartnersConfirmation
          open={confirmationModalOpen}
          onCancel={() => {
            setConfirmationModalOpen(false);
            setId(null);
          }}
          onConfirm={(paymentId) => payToUser(paymentId)}
          isPaying={loadingBtn}
        />
      )}
    </>
  );
}
