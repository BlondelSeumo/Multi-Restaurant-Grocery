import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import { fetchBonusList } from 'redux/slices/bonus-list';
import moment from 'moment';
import useDidUpdate from 'helpers/useDidUpdate';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import RiveResult from 'components/rive-result';
import Card from 'components/card';
import { Divider, Space, Table, Typography } from 'antd';
import getFullDateTime from 'helpers/getFullDateTime';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

const BonusList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { bonus, meta, loading } = useSelector(
    (state) => state.bonusList,
    shallowEqual,
  );
  const [filters, setFilters] = useState(initialFilterValues);
  const paramsData = {
    perPage: filters?.perPage,
    page: filters?.page,
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('bonus.product'),
      dataIndex: 'bonusStock',
      key: 'bonusStock',
      is_show: true,
      render: (bonusStock) =>
        bonusStock?.product?.translation?.title || t('N/A'),
    },
    {
      title: t('branch'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => shop?.translation?.title || t('N/A'),
    },
    {
      title: t('expired.at'),
      dataIndex: 'expired_at',
      key: 'expired_at',
      is_show: true,
      render: (date) => (
        <div className={tableRowClasses.status}>
          <span
            className={`${moment(new Date()).isBefore(date) ? tableRowClasses.published : tableRowClasses.unpublished}`}
          >
            {getFullDateTime(date, false)}
          </span>
        </div>
      ),
    },
  ]);

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({ perPage, page });
  };

  const fetchBonusListLocal = () => {
    dispatch(fetchBonusList(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchBonusListLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchBonusListLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchBonusListLocal();
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
          {t('bonus.list')}
        </Typography.Title>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Divider color='var(--divider)' />
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={bonus}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record?.id}
      />
    </Card>
  );
};

export default BonusList;
