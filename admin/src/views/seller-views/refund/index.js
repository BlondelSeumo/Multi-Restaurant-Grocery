import { useContext, useEffect, useState } from 'react';
import { Divider, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { sellerfetchRefund } from 'redux/slices/refund';
import refundService from 'services/seller/refund';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import getFullDateTime from 'helpers/getFullDateTime';
import { checkIsTruish } from 'helpers/checkIsTruish';
import useDidUpdate from 'helpers/useDidUpdate';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import FilterColumns from 'components/filter-column';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

export default function SellerRefunds() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { refund_delete } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { refund, meta, loading } = useSelector(
    (state) => state.refund,
    shallowEqual,
  );
  const isRefundDelete = checkIsTruish(refund_delete);

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
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

  const paramsData = {
    page: filters?.page || 1,
    perPage: filters?.perPage || 10,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToShow = (id) => {
    dispatch(
      addMenu({
        url: `seller/refund/details/${id}`,
        id: 'refund_details',
        name: t('refund.details'),
      }),
    );
    navigate(`/seller/refund/details/${id}`);
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
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setId(null);
      });
  };

  const rowSelection = {
    id,
    onChange: (key) => setId(key),
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.refund'));
    } else {
      setIsModalVisible(true);
    }
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

  const sellerfetchRefundLocal = () => {
    dispatch(sellerfetchRefund(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    sellerfetchRefundLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      sellerfetchRefundLocal();
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
          {t('refunds')}
        </Typography.Title>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        wrap
        className='w-100 justify-content-end align-items-center'
        style={{ rowGap: '6px', columnGap: '6px' }}
      >
        <OutlinedButton color='red' onClick={allDelete}>
          {t('delete.selection')}
        </OutlinedButton>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Divider color='var(--divider)' />
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
    </Card>
  );
}
