import { useEffect, useState } from 'react';
import { Space, Table, DatePicker, Col, Typography, Divider } from 'antd';
import { useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import numberToPrice from 'helpers/numberToPrice';
import { DebounceSelect } from 'components/search';
import userService from 'services/user';
import moment from 'moment';
import shopService from 'services/restaurant';
import { fetchPaymentToPartnersCompletedList } from 'redux/slices/paymentToPartners';
import Card from 'components/card';
import SearchInput from 'components/search-input';

const { RangePicker } = DatePicker;

const initialFilterValues = {
  page: 1,
  perPage: 10,
  search: '',
  date: null,
  shop: null,
  user: null,
};

export default function PaymentToPartnersCompleteList() {
  const { type } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { completedList, loading, meta } = useSelector(
    (state) => state.paymentToPartners,
    shallowEqual,
  );

  const columns = [
    {
      title: t('order.id'),
      is_show: true,
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: t(type),
      is_show: true,
      dataIndex: 'user',
      key: 'user',
      render: (user) => `${user?.firstname || ''} ${user?.lastname || ''}`,
    },
    {
      title: t('order.total.price'),
      is_show: true,
      dataIndex: 'order',
      key: 'order_total_price',
      render: (order) => numberToPrice(order?.total_price),
    },
    ...(type === 'seller'
      ? [
          {
            title: t('coupon.sum.price'),
            is_show: true,
            dataIndex: 'order',
            key: 'coupon_sum_price',
            render: (order) => numberToPrice(order?.coupon_sum_price),
          },
        ]
      : []),
    ...(type === 'seller'
      ? [
          {
            title: t('total.cashback'),
            is_show: true,
            dataIndex: 'order',
            key: 'total_cashback',
            render: (order) => numberToPrice(order?.point_history_sum_price),
          },
        ]
      : []),
    {
      title: t('delivery.fee'),
      is_show: true,
      dataIndex: 'delivery_fee',
      key: 'delivery_fee',
      render: (_, row) =>
        numberToPrice(row?.order?.delivery_fee, defaultCurrency.symbol),
    },
    ...(type === 'seller'
      ? [
          {
            title: t('service.fee'),
            is_show: true,
            dataIndex: 'order',
            key: 'service_fee',
            render: (order) => numberToPrice(order?.service_fee),
          },
        ]
      : []),
    ...(type === 'seller'
      ? [
          {
            title: t('commission.fee'),
            is_show: true,
            dataIndex: 'order',
            key: 'commission_fee',
            render: (order) => numberToPrice(order.commission_fee),
          },
        ]
      : []),
    ...(type === 'seller'
      ? [
          {
            title: t('seller.fee'),
            is_show: true,
            dataIndex: 'order',
            key: 'seller_fee',
            render: (order) => numberToPrice(order?.seller_fee),
          },
        ]
      : []),
    {
      title: t('payment.type'),
      is_show: true,
      dataIndex: 'transaction',
      key: 'payment_type',
      render: (transaction) => t(transaction?.payment_system?.tag) || '-',
    },
  ];
  const [filters, setFilters] = useState(initialFilterValues);
  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    user_id: filters?.user?.value || undefined,
    shop_id: filters?.shop?.value || undefined,
    date_from: filters?.date?.from || undefined,
    date_to: filters?.date?.to || undefined,
    type,
  };

  const getUsers = (search = '') => {
    const params = {
      search: search || undefined,
      perPage: 10,
      role: type,
    };
    return userService.search(params).then(({ data }) => {
      return data.map((item) => ({
        label: `${item?.firstname || ''} ${item?.lastname || ''}`,
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const fetchShops = (search = '') => {
    const params = { search: search || undefined, status: 'approved' };
    return shopService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item?.translation?.title || undefined,
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({ perPage, page });
  };

  const fetchPaymentToPartnersCompletedListLocal = () => {
    dispatch(fetchPaymentToPartnersCompletedList(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchPaymentToPartnersCompletedListLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu?.refetch) {
      fetchPaymentToPartnersCompletedListLocal();
    }
  }, [activeMenu?.refetch]);

  useDidUpdate(() => {
    dispatch(fetchPaymentToPartnersCompletedList(paramsData));
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
            {t(`${type}.completed.payments`)}
          </Typography.Title>
        </Space>
        <Divider color='var(--divider)' />
        <Space wrap className='flex justify-content-space-between'>
          <Space
            wrap
            className='w-100 justify-content-end align-items-center'
            style={{ rowGap: '6px', columnGap: '6px' }}
          >
            <Col style={{ minWidth: '253px' }}>
              <SearchInput
                placeholder={t('search.by.order.id.customer')}
                className='w-100'
                handleChange={(value) => handleFilter('search', value)}
                defaultValue={filters?.search}
                resetSearch={!filters?.search}
              />
            </Col>
            <Col style={{ minWidth: '253px' }}>
              <DebounceSelect
                placeholder={t('select.branch')}
                fetchOptions={fetchShops}
                onChange={(shop) => handleFilter('shop', shop)}
                allowClear={true}
                value={filters?.shop}
                className='w-100'
              />
            </Col>
            <Col style={{ minWidth: '253px' }}>
              <DebounceSelect
                placeholder={t('select.user')}
                fetchOptions={getUsers}
                onChange={(user) => handleFilter('user', user)}
                allowClear={true}
                value={filters?.user}
                className='w-100'
              />
            </Col>
            <Col style={{ minWidth: '242px' }}>
              <RangePicker
                allowClear
                className='w-100'
                placeholder={[t('from.date'), t('to.date')]}
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
          </Space>
        </Space>
        <Divider color='var(--divider)' />
        <Table
          scroll={{ x: true }}
          columns={columns?.filter((items) => items.is_show)}
          dataSource={completedList}
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
    </>
  );
}
