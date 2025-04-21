import { useContext, useEffect, useState } from 'react';
import { Button, Divider, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { toast } from 'react-toastify';
import couponService from 'services/coupon';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import FilterColumns from 'components/filter-column';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchCoupon } from 'redux/slices/coupons';
import numberToPrice from 'helpers/numberToPrice';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';
import getFullDateTime from 'helpers/getFullDateTime';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

const SellerCoupon = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { coupons, meta, loading } = useSelector(
    (state) => state.coupons,
    shallowEqual,
  );

  const [couponId, setCouponId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [filters, setFilters] = useState(initialFilterValues);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('title'),
      dataIndex: 'translation',
      key: 'translation',
      is_show: true,
      render: (translation) => translation?.title,
    },
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      is_show: true,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      is_show: true,
      render: (type) => t(type),
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      is_show: true,
      render: (price, row) =>
        row?.type === 'percent' ? `${price}%` : numberToPrice(price),
    },
    {
      title: t('quantity'),
      dataIndex: 'qty',
      key: 'qty',
      is_show: true,
      render: (qty) => qty || t('N/A'),
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
    {
      title: t('actions'),
      dataIndex: 'id',
      key: 'actions',
      is_show: true,
      render: (id) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            onClick={(e) => {
              e.stopPropagation();
              goToEdit(id);
            }}
          >
            <EditOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            onClick={(e) => {
              e.stopPropagation();
              setCouponId([id]);
              setIsModalVisible(true);
              setText(true);
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
    perPage: filters?.perPage,
    page: filters?.page,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `coupon/${id}`,
        id: 'coupon_edit',
        name: t('edit.coupon'),
      }),
    );
    navigate(`/coupon/${id}`);
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add.coupon',
        url: `coupon/add`,
        name: t('add.coupon'),
      }),
    );
    navigate(`/coupon/add`);
  };

  const deleteCoupon = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...couponId.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    couponService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setCouponId(null);
        setIsModalVisible(false);
        setText(null);
      });
  };

  const rowSelection = {
    selectedRowKeys: couponId,
    onChange: (key) => {
      setCouponId(key);
    },
  };

  const allDelete = () => {
    if (couponId === null || couponId.length === 0) {
      toast.warning(t('select.the.coupon'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({ perPage, page });
  };

  const fetchCouponLocal = () => {
    dispatch(fetchCoupon(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchCouponLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchCouponLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchCouponLocal();
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
          {t('coupons')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.coupon')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        className='w-100 justify-content-end align-items-center'
        style={{ rowGap: '6px', columnGap: '6px', marginBottom: '20px' }}
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
        dataSource={coupons}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record?.id}
      />
      <CustomModal
        click={deleteCoupon}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        setText={setCouponId}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default SellerCoupon;
