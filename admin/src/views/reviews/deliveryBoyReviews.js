import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Col, Divider, Rate, Space, Table, Typography } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import reviewService from 'services/review';
import OrderReviewShowModal from './orderReviewShow';
import { useNavigate } from 'react-router-dom';
import FilterColumns from 'components/filter-column';
import { fetchDeliveryboyReviews } from 'redux/slices/deliveryboyReview';
import { DebounceSelect } from 'components/search';
import userService from 'services/user';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';
import getFullDateTime from 'helpers/getFullDateTime';

const initialFilterValues = {
  search: '',
  shop: null,
  assign_id: null,
  user_id: null,
  page: 1,
  perPage: 10,
};

export default function DeliveryBoyReviews() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { reviews, meta, loading } = useSelector(
    (state) => state.deliveryboyReview,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [show, setShow] = useState(null);
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
      title: t('user'),
      dataIndex: 'assign_user',
      key: 'assign_user',
      is_show: true,
      render: (assign_user) => (
        <button
          type='button'
          className='text-hover'
          onClick={() => goToDetail(assign_user)}
        >
          {assign_user?.firstname || ''} {assign_user?.lastname || ''}
        </button>
      ),
    },
    {
      title: t('deliveryman'),
      dataIndex: 'user',
      key: 'user',
      is_show: true,
      render: (user) => (
        <button
          type='button'
          className='text-hover'
          onClick={() => goToDetail(user)}
        >
          {user?.firstname || ''} {user?.lastname || ''}
        </button>
      ),
    },
    {
      title: t('rating'),
      dataIndex: 'rating',
      key: 'rating',
      is_show: true,
      render: (rating) => <Rate allowHalf disabled defaultValue={rating} />,
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (createdAt) => getFullDateTime(createdAt),
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
              setShow(id);
            }}
          >
            <EyeOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
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
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    search: filters?.search || undefined,
    assign: 'deliveryman',
    assign_id: filters?.assign_id?.value || undefined,
    user_id: filters?.user_id?.value || undefined,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToDetail = (row) => {
    dispatch(
      addMenu({
        url: `/users/user/${row.uuid}`,
        id: 'user_info',
        name: t('user.info'),
      }),
    );
    navigate(`/users/user/${row.uuid}`, { state: { user_id: row.id } });
  };

  const reviewDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    reviewService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
      });
  };

  const fetchUsers = (search) => {
    const params = {
      search: search || undefined,
      perPage: 10,
    };
    return userService.search(params).then((res) =>
      res?.data?.map((item) => ({
        label: `${item?.firstname || ''} ${item?.lastname || ''}`,
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  const rowSelection = {
    id,
    onChange: (key) => setId(key),
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.review'));
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
    handleUpdateFilter({ perPage, page });
  };

  const fetchDeliveryboyReviewsLocal = () => {
    dispatch(fetchDeliveryboyReviews(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchDeliveryboyReviewsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchDeliveryboyReviewsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchDeliveryboyReviewsLocal();
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
          {t('deliverymen.reviews')}
        </Typography.Title>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        className='w-100 justify-content-end align-items-center'
        style={{ rowGap: '6px', columnGap: '6px' }}
      >
        <Col style={{ minWidth: '228px' }}>
          <DebounceSelect
            debounceTimeout={500}
            placeholder={t('select.deliveryman')}
            onChange={(value) => handleFilter('assign_id', value)}
            fetchOptions={fetchUsers}
            allowClear
            className='w-100'
          />
        </Col>
        <OutlinedButton onClick={allDelete} color='red'>
          {t('delete.selection')}
        </OutlinedButton>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Divider color='var(--divider)' />
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        rowSelection={rowSelection}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={reviews}
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
        click={reviewDelete}
        text={t('confirm.delete.selection')}
        setText={setId}
        loading={loadingBtn}
      />
      {show && (
        <OrderReviewShowModal id={show} handleCancel={() => setShow(null)} />
      )}
    </Card>
  );
}
