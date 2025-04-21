import { useEffect, useState } from 'react';
import { Divider, Space, Table, Typography } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import { fetchSellerWallets } from 'redux/slices/wallet';
import numberToPrice from 'helpers/numberToPrice';
import PayoutStatusModal from './payoutStatusModal';
import PayoutRequest from './payoutRequest';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import getFullDateTime from 'helpers/getFullDateTime';
import RiveResult from 'components/rive-result';

const initialFilterValues = { page: 1, perPage: 10 };

export default function SellerPayouts() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { wallets, meta, loading } = useSelector(
    (state) => state.wallet,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [modal, setModal] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState(false);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
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
  ];

  const paramsData = {
    page: filters?.page || 1,
    perPage: filters?.perPage || 10,
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

  const fetchSellerWalletsLocal = () => {
    dispatch(fetchSellerWallets(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchSellerWalletsLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchSellerWalletsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchSellerWalletsLocal();
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
      </Space>
      <Divider color='var(--divider)' />
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={wallets}
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
        <PayoutStatusModal data={modal} handleCancel={() => setModal(null)} />
      )}
      {withdrawModal && (
        <PayoutRequest
          data={withdrawModal}
          handleCancel={() => setWithdrawModal(false)}
        />
      )}
    </Card>
  );
}
