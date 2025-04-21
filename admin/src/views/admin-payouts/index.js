import { useEffect, useState } from 'react';
import { Button, Divider, Space, Table, Tabs, Typography } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import PayoutRequestModal from './payoutActionModal';
import FilterColumns from 'components/filter-column';
import { fetchAdminPayouts } from 'redux/slices/adminPayouts';
import PayoutStatusChangeModal from './payoutStatusChangeModal';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import getFullDateTime from 'helpers/getFullDateTime';
import RiveResult from 'components/rive-result';
import Card from 'components/card';

const { TabPane } = Tabs;

const roles = ['all', 'accepted', 'pending', 'canceled'];
const initialFilterValues = {
  page: 1,
  perPage: 10,
  status: 'all',
};

export default function AdminPayouts() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { payoutRequests, meta, loading } = useSelector(
    (state) => state.adminPayouts,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [modal, setModal] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    status: filters?.status !== 'all' ? filters?.status : undefined,
  };
  const initialColumns = [
    {
      title: t('client'),
      dataIndex: 'createdBy',
      key: 'createdBy',
      is_show: true,
      render: (user) => `${user?.firstname || ''} ${user?.lastname || ''}`,
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      is_show: true,
      render: (price, row) =>
        numberToPrice(price, row.currency?.symbol, row?.currency?.position),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => {
        return (
          <button
            type='button'
            disabled={status === 'accepted'}
            className={tableRowClasses.paymentStatuses}
            onClick={(e) => {
              e.stopPropagation();
              if (status !== 'accepted') {
                setSelectedRow(row);
              }
            }}
          >
            <span
              className={`${tableRowClasses.paymentStatus} ${tableRowClasses[status || 'processed']}`}
            >
              {t(status)}
            </span>
            {status !== 'accepted' && <EditOutlined />}
          </button>
        );
      },
    },
    {
      title: t('cause'),
      dataIndex: 'cause',
      key: 'cause',
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
      title: t('answer'),
      dataIndex: 'answer',
      key: 'answer',
      is_show: true,
    },
    {
      title: t('actions'),
      dataIndex: 'uuid',
      key: 'uuid',
      is_show: true,
      render: (uuid, row) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            onClick={(e) => {
              e.stopPropagation();
              setModal(row);
            }}
          >
            <EditOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

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

  const fetchAdminPayoutsLocal = () => {
    dispatch(fetchAdminPayouts(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchAdminPayoutsLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchAdminPayoutsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchAdminPayoutsLocal();
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
          {t('payouts')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => setModal(true)}
          style={{ width: '100%' }}
        >
          {t('add.payout')}
        </Button>
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
      {selectedRow && (
        <PayoutStatusChangeModal
          data={selectedRow}
          statuses={roles}
          handleCancel={() => setSelectedRow(null)}
        />
      )}
    </Card>
  );
}
