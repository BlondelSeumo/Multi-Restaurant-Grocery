import { useEffect, useState } from 'react';
import { Table, Tabs, Space, Typography, Divider, Col } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import { DebounceSelect } from 'components/search';
import userService from 'services/seller/user';
import { fetchSellerTransactions } from 'redux/slices/transaction';
import TransactionShowModal from './transactionShowModal';
import numberToPrice from 'helpers/numberToPrice';
import FilterColumns from 'components/filter-column';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import getFullDateTime from 'helpers/getFullDateTime';
import Card from 'components/card';
import RiveResult from 'components/rive-result';

const { TabPane } = Tabs;

const statuses = ['all', 'progress', 'paid', 'rejected'];
const initialFilterValues = { page: 1, perPage: 10, user: null, status: 'all' };

export default function SellerTransactions() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { transactions, meta, loading } = useSelector(
    (state) => state.transaction,
    shallowEqual,
  );

  const [showId, setShowId] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
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
      render: (user) => (
        <div>
          {user?.firstname || ''} {user?.lastname || ''}
        </div>
      ),
    },
    {
      title: t('amount'),
      dataIndex: 'price',
      key: 'price',
      is_show: true,
      render: (price) => numberToPrice(price),
    },
    {
      title: t('payment.type'),
      dataIndex: 'payment_system',
      key: 'payment_system',
      is_show: true,
      render: (paymentSystem) => t(paymentSystem?.tag),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      is_show: true,
      render: (status) => (
        <div className={tableRowClasses.paymentStatuses}>
          <span
            className={`${tableRowClasses.paymentStatus} ${tableRowClasses[status || 'progress']}`}
          >
            {t(status)}
          </span>
        </div>
      ),
    },
    {
      title: t('note'),
      dataIndex: 'status_description',
      key: 'status_description',
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
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    user_id: filters?.user?.value || undefined,
    status: filters?.status !== 'all' ? filters?.status : undefined,
    model: 'orders',
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToShow = (id) => {
    setShowId(id);
  };

  const fetchUsers = (search = '') => {
    const params = {
      search: search || undefined,
      page: 1,
      perPage: 10,
    };
    return userService.getAll(params).then((res) =>
      res?.data?.map((item) => ({
        label: `${item?.firstname || ''} ${item?.lastname || ''}`,
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
    handleUpdateFilter({
      perPage,
      page: +perPage === +filters?.perPage ? page : 1,
    });
  };

  const fetchTransactionsLocal = () => {
    dispatch(fetchSellerTransactions(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchTransactionsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    fetchTransactionsLocal();
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchTransactionsLocal();
    }
  }, [activeMenu.refetch]);

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
          {t('transactions')}
        </Typography.Title>
      </Space>
      <Divider color='var(--divider)' />
      <Space className='w-100 justify-content-between align-items-start'>
        <Tabs
          activeKey={filters?.status}
          onChange={(key) => handleFilter('status', key)}
          type='card'
        >
          {statuses.map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <Space>
          <Col style={{ width: '228px' }}>
            <DebounceSelect
              placeholder={t('select.client')}
              fetchOptions={fetchUsers}
              onChange={(user) => handleFilter('user', user)}
              allowClear
              className='w-100'
            />
          </Col>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      </Space>
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={transactions}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record.id}
      />
      {showId && (
        <TransactionShowModal
          id={showId}
          handleCancel={() => setShowId(null)}
        />
      )}
    </Card>
  );
}
