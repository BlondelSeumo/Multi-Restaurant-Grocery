import { useEffect, useState } from 'react';
import { Divider, Space, Table, Tabs, Typography } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import { fetchPayoutRequests } from 'redux/slices/payoutRequests';
import numberToPrice from 'helpers/numberToPrice';
import { EditOutlined } from '@ant-design/icons';
import PayoutRequestModal from './payoutRequestModal';
import FilterColumns from 'components/filter-column';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import getFullDateTime from 'helpers/getFullDateTime';
import Card from 'components/card';
import RiveResult from 'components/rive-result';

const { TabPane } = Tabs;

const roles = ['all', 'processed', 'paid', 'rejected', 'canceled'];
const initialFilterValues = {
  page: 1,
  perPage: 10,
  status: 'all',
};

export default function PayoutRequests() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { payoutRequests, meta, loading } = useSelector(
    (state) => state.payoutRequests,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [modal, setModal] = useState(null);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('client'),
      dataIndex: 'user',
      key: 'user',
      is_show: true,
      render: (user) => `${user?.firstname || ''} ${user?.lastname || ''}`,
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      is_show: true,
      render: (price) => numberToPrice(price),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        return (
          <div className={tableRowClasses.paymentStatuses}>
            <span
              className={`${tableRowClasses.paymentStatus} ${tableRowClasses[status || 'processed']}`}
            >
              {t(status)}
            </span>
          </div>
        );
      },
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note',
      is_show: true,
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (date) => getFullDateTime(date),
    },
    {
      title: t('actions'),
      dataIndex: 'status',
      key: 'actions',
      is_show: true,
      render: (status, row) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            disabled={status !== 'processed'}
            onClick={(e) => {
              e.stopPropagation();
              if (status === 'processed') {
                setModal(row);
              }
            }}
          >
            <EditOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    status: filters?.status !== 'all' ? filters?.status : undefined,
    type: 'withdraw',
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

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
      page: +perPage === +filters.perPage ? page : 1,
    });
  };

  const fetchPayoutRequestsLocal = () => {
    dispatch(fetchPayoutRequests(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchPayoutRequestsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchPayoutRequestsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchPayoutRequestsLocal();
  }, [filters]);

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
          {t('payout.requests')}
        </Typography.Title>
      </Space>
      <Divider color='var(--divider)' />
      <Space className='w-100 justify-content-between align-items-start'>
        <Tabs
          activeKey={filters?.status}
          onChange={(key) => handleFilter('status', key)}
          type='card'
        >
          {roles.map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={payoutRequests}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record.id}
      />
      {modal && (
        <PayoutRequestModal data={modal} handleCancel={() => setModal(null)} />
      )}
    </Card>
  );
}
