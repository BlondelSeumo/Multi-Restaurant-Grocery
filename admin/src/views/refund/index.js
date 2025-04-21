import { useContext, useEffect, useState } from 'react';
import { Col, Divider, Space, Table, Tabs, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchRefund } from 'redux/slices/refund';
import refundService from 'services/refund';
import ResultModal from 'components/result-modal';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import getFullDateTime from 'helpers/getFullDateTime';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import FilterColumns from 'components/filter-column';
import { checkIsTruish } from 'helpers/checkIsTruish';

const { TabPane } = Tabs;

const status = ['pending', 'accepted', 'canceled'];
const initialFilterValues = {
  status: 'all',
  search: '',
  page: 1,
  perPage: 10,
};

const Refunds = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { refund_delete } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual,
  );
  const isRefundDelete = checkIsTruish(refund_delete);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { refund, meta, loading } = useSelector(
    (state) => state.refund,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const initialColumns = [
    {
      title: t('id'),
      is_show: true,
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('order.id'),
      is_show: true,
      dataIndex: 'order',
      key: 'order.id',
      render: (order) => order?.id,
    },
    {
      title: t('client'),
      is_show: true,
      dataIndex: 'order',
      key: 'client',
      render: (order) =>
        `${order?.user?.firstname || ''} ${order?.user?.lastname || ''}`,
    },
    {
      title: t('branch'),
      is_show: true,
      dataIndex: 'order',
      key: 'branch',
      render: (order) => order?.shop?.translation?.title || t('N/A'),
    },
    {
      title: t('order.status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div className={tableRowClasses.status}>
          <span className={tableRowClasses[status || 'new']}>{t(status)}</span>
        </div>
      ),
    },
    {
      title: t('created.at'),
      is_show: true,
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (date ? getFullDateTime(date) : t('N/A')),
    },
    {
      title: t('action'),
      is_show: true,
      dataIndex: 'id',
      key: 'actions',
      render: (id, row) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.details}`}
            disabled={row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              goToShow(id);
            }}
          >
            <EyeOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            disabled={row?.deleted_at || isRefundDelete}
            onClick={(e) => {
              e.stopPropagation();
              setId([id]);
              setIsModalVisible(true);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    status:
      filters?.status !== 'deleted_at' && filters?.status !== 'all'
        ? filters?.status
        : undefined,
    deleted_at: filters?.status === 'deleted_at' ? 'deleted_at' : undefined,
  };

  const goToShow = (id) => {
    dispatch(
      addMenu({
        url: `refund/details/${id}`,
        id: 'refund_details',
        name: t('refund.details'),
      }),
    );
    navigate(`/refund/details/${id}`);
  };

  const refundDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    refundService
      .delete(params)
      .then(() => {
        dispatch(fetchRefund(paramsData));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setLoadingBtn(false);
        setRestore(null);
        setIsModalVisible(false);
        setId(null);
      });
  };

  const refundRestoreAll = () => {
    setLoadingBtn(true);
    refundService
      .restoreAll()
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setLoadingBtn(false);
        setRestore(null);
        setIsModalVisible(false);
      });
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.refund'));
    } else {
      setIsModalVisible(true);
    }
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

  const fetchRefundLocal = () => {
    dispatch(fetchRefund(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchRefundLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchRefundLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchRefundLocal();
  }, [filters]);

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
            {t('refunds')}
          </Typography.Title>
        </Space>
        <Divider color='var(--divider)' />
        <Space
          className='w-100 justify-content-end align-items-center'
          style={{ rowGap: '6px', columnGap: '6px' }}
        >
          <Col style={{ minWidth: '253px' }}>
            <SearchInput
              placeholder={t('search')}
              className='w-100'
              handleChange={(value) => handleFilter('search', value)}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
            />
          </Col>
          {filters?.status !== 'deleted_at' ? (
            <OutlinedButton
              onClick={allDelete}
              color='red'
              disabled={isRefundDelete}
            >
              {t('delete.selection')}
            </OutlinedButton>
          ) : (
            <OutlinedButton
              color='green'
              onClick={() => setRestore({ restore: true })}
            >
              {t('restore.all')}
            </OutlinedButton>
          )}
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
        <Divider color='var(--divider)' />
        <Tabs
          activeKey={filters?.status}
          onChange={(key) => {
            handleFilter('status', key);
          }}
          type='card'
        >
          {['all', ...status, 'deleted_at'].map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((items) => items.is_show)}
          dataSource={refund}
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
        <CustomModal
          click={refundDelete}
          text={t('confirm.delete.selection')}
          loading={loadingBtn}
          setText={setId}
        />
        {restore && (
          <ResultModal
            open={restore}
            handleCancel={() => setRestore(null)}
            click={refundRestoreAll}
            text={t('restore.modal.text')}
            loading={loadingBtn}
            setText={setId}
          />
        )}
      </Card>
    </>
  );
};

export default Refunds;
