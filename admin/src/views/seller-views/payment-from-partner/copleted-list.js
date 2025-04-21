import { useEffect, useState } from 'react';
import { Space, Table, DatePicker, Typography, Col, Divider } from 'antd';
import { useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import numberToPrice from 'helpers/numberToPrice';
import moment from 'moment';
import { fetchPaymentFromPartners } from 'redux/slices/paymentToPartners';
import Card from 'components/card';
import RiveResult from 'components/rive-result';

const { RangePicker } = DatePicker;

const initialFilterValues = {
  page: 1,
  perPage: 10,
  date: null,
};

export default function PaymentToPartnersCompleteList() {
  const { t } = useTranslation();
  const { type } = useParams();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { list, loading, params, meta } = useSelector(
    (state) => state.paymentToPartners,
    shallowEqual,
  );
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);

  const [filters, setFilters] = useState(initialFilterValues);

  const columns = [
    {
      title: t('order.id'),
      is_show: true,
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: t('order.total.price'),
      is_show: true,
      dataIndex: 'order_total_price',
      key: 'order',
      render: (order) => numberToPrice(order?.total_price),
    },

    {
      title: t('coupon.sum.price'),
      is_show: true,
      dataIndex: 'order',
      key: 'coupon_sum_price',
      render: (order) => numberToPrice(order?.coupon_sum_price),
    },

    {
      title: t('total.cashback'),
      is_show: true,
      dataIndex: 'order',
      key: 'point_history_sum_price',
      render: (order) => numberToPrice(order?.point_history_sum_price),
    },

    {
      title: t('delivery.fee'),
      is_show: true,
      dataIndex: 'order',
      key: 'delivery_fee',
      render: (order) => numberToPrice(order?.delivery_fee),
    },

    {
      title: t('service.fee'),
      is_show: true,
      dataIndex: 'order',
      key: 'service_fee',
      render: (order) =>
        numberToPrice((order?.service_fee || 0) + (order.commission_fee || 0)),
    },
    {
      title: t('seller.fee'),
      is_show: true,
      dataIndex: 'order',
      key: 'seller_fee',
      render: (order) => numberToPrice(order?.seller_fee),
    },

    {
      title: t('payment.type'),
      is_show: true,
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => t(transaction?.payment_system?.tag || 'N/A'),
    },
  ];

  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    shop_id: myShop?.id,
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
      page: +perPage === +params?.perPage ? page : 1,
    });
  };

  const fetchPaymentFromPartnersLocal = () => {
    dispatch(fetchPaymentFromPartners(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchPaymentFromPartnersLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    fetchPaymentFromPartnersLocal();
  }, [filters, type]);

  useDidUpdate(() => {
    if (activeMenu?.refetch) {
      fetchPaymentFromPartnersLocal();
    }
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
            {t('transactions')}
          </Typography.Title>
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
        <Divider color='var(--divider)' />
        <Table
          locale={{
            emptyText: <RiveResult />,
          }}
          scroll={{ x: true }}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={list}
          pagination={{
            pageSize: meta?.per_page || 10,
            page: meta?.current_page || 1,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          onChange={onChangePagination}
          rowKey={(record) => record.id}
        />
      </Card>
    </>
  );
}
