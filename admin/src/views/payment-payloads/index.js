import { useContext, useEffect, useState } from 'react';
import { Button, Divider, Space, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import CustomModal from 'components/modal';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import { useNavigate } from 'react-router-dom';
import FilterColumns from 'components/filter-column';
import { fetchPaymentPayloads } from 'redux/slices/paymentPayload';
import { paymentPayloadService } from 'services/paymentPayload';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import useDidUpdate from 'helpers/useDidUpdate';
import RiveResult from 'components/rive-result';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

export default function PaymentPayloads() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { payloads, loading, meta } = useSelector(
    (state) => state.paymentPayload,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const initialColumns = [
    {
      title: t('payment.id'),
      is_show: true,
      dataIndex: 'payment_id',
      key: 'payment_id',
    },
    {
      title: t('title'),
      is_show: true,
      dataIndex: 'payment',
      key: 'payment',
      render: (payment) => t(payment?.tag),
    },
    {
      title: t('actions'),
      dataIndex: 'payment_id',
      key: 'actions',
      is_show: true,
      render: (paymentId) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            onClick={(e) => {
              e.stopPropagation();
              goToEdit(paymentId);
            }}
          >
            <EditOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            onClick={(e) => {
              e.stopPropagation();
              setId([paymentId]);
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

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add.payment.payloads',
        url: 'payment-payloads/add',
        name: t('add.payment.payloads'),
      }),
    );
    navigate('/payment-payloads/add');
  };

  const goToEdit = (paymentId) => {
    dispatch(
      addMenu({
        url: `payment-payloads/edit/${paymentId}`,
        id: 'edit.payment.payloads',
        name: t('edit.payment.payloads'),
      }),
    );
    navigate(`/payment-payloads/edit/${paymentId}`);
  };

  const paymentDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    paymentPayloadService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
      });
  };

  const rowSelection = {
    id,
    onChange: (key) => setId(key),
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.payload'));
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
      page: +perPage === +filters.perPage ? page : 1,
    });
  };

  const fetchPaymentPayloadsLocal = () => {
    dispatch(fetchPaymentPayloads(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchPaymentPayloadsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchPaymentPayloadsLocal();
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
          {t('payment.payloads')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.payment.payload')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        className='w-100 justify-content-end align-items-center'
        style={{ rowGap: '6px', columnGap: '6px' }}
      >
        <OutlinedButton onClick={allDelete} color='red'>
          {t('delete.selection')}
        </OutlinedButton>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        rowSelection={rowSelection}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={payloads}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record.id}
      />
      <CustomModal
        click={paymentDelete}
        text={t('confirm.delete.selection')}
        loading={loadingBtn}
        setText={setId}
      />
    </Card>
  );
}
