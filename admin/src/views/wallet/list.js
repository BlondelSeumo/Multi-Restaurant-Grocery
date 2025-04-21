import { useEffect, useState } from 'react';
import { Col, Divider, Space, Table, Typography } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import numberToPrice from 'helpers/numberToPrice';
import { fetchWallets } from 'redux/slices/wallet';
import SearchInput from 'components/search-input';
import Card from 'components/card';
import RiveResult from 'components/rive-result';
import FilterColumns from 'components/filter-column';

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
};

export default function Wallets() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { wallets, loading, meta } = useSelector(
    (state) => state.wallet,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('firstname'),
      dataIndex: 'firstname',
      key: 'firstname',
      is_show: true,
    },
    {
      title: t('lastname'),
      dataIndex: 'lastname',
      key: 'lastname',
      is_show: true,
    },
    {
      title: t('wallet'),
      dataIndex: 'wallet',
      key: 'wallet',
      is_show: true,
      render: (wallet) => numberToPrice(wallet?.price),
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      key: 'phone',
      is_show: true,
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
      is_show: true,
      render: (role) => t(role),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    search: filters?.search || undefined,
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
      page: +perPage === +filters?.perPage ? page : 1,
    });
  };

  const fetchWalletsLocal = () => {
    dispatch(fetchWallets(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchWalletsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchWalletsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchWalletsLocal();
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
          {t('user.wallets.history')}
        </Typography.Title>
        <Space
          className='w-100 justify-content-end align-items-center'
          style={{ rowGap: '6px', columnGap: '6px' }}
        >
          <Col style={{ minWidth: '228px' }}>
            <SearchInput
              placeholder={t('search.by.id.name')}
              className='w-100'
              handleChange={(value) => handleFilter('search', value)}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
            />
          </Col>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
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
    </Card>
  );
}
