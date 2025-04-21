import { useEffect, useState } from 'react';
import { Space, Table, DatePicker, Col, Typography, Divider } from 'antd';
import { useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import formatSortType from 'helpers/formatSortType';
import numberToPrice from 'helpers/numberToPrice';
import moment from 'moment';
import { fetchDeliverymanPaymentFromPartners } from 'redux/slices/paymentToPartners';
import Card from 'components/card';

const { RangePicker } = DatePicker;

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
  date: null,
};

export default function DeliverymanPaymentFromPartners() {
  const { t } = useTranslation();
  const { type } = useParams();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { list, loading, params, meta } = useSelector(
    (state) => state.paymentToPartners,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);

  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    date_from: filters?.date?.from || undefined,
    date_to: filters?.date?.to || undefined,
    type,
  };

  const columns = [
    {
      title: t('order.id'),
      is_show: true,
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: t('order.total_price'),
      is_show: true,
      dataIndex: 'order',
      key: 'order',
      render: (order) => numberToPrice(order?.total_price),
    },
    {
      title: t('delivery.fee'),
      is_show: true,
      dataIndex: 'order',
      key: 'delivery_fee',
      render: (order) => numberToPrice(order?.delivery_fee),
    },
    {
      title: t('payment.type'),
      is_show: true,
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => t(transaction?.payment_system?.tag || 'N/A'),
    },
  ];

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
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

  const fetchDeliverymanPaymentFromPartnersLocal = () => {
    dispatch(fetchDeliverymanPaymentFromPartners(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchDeliverymanPaymentFromPartnersLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu?.refetch) {
      fetchDeliverymanPaymentFromPartnersLocal();
    }
  }, [activeMenu?.refetch]);

  useDidUpdate(() => {
    fetchDeliverymanPaymentFromPartnersLocal();
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
            {t('payments.from.admin')}
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
          scroll={{ x: true }}
          columns={columns?.filter((items) => items.is_show)}
          dataSource={list}
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
