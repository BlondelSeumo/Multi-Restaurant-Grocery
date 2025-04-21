import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Rate, Space, Table, Typography } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import reviewService from 'services/review';
import { fetchOrderReviews } from 'redux/slices/orderReview';
import OrderReviewShowModal from './orderReviewShow';
import { useNavigate } from 'react-router-dom';
import FilterColumns from 'components/filter-column';
import ResultModal from 'components/result-modal';
import SearchInput from 'components/search-input';
import shopService from 'services/shop';
import userService from 'services/user';
import getFullDateTime from 'helpers/getFullDateTime';
import Card from 'components/card';
import { InfiniteSelect } from 'components/infinite-select';
import createSelectObject from 'helpers/createSelectObject';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';

const initialFilterValues = {
  shop: null,
  user: null,
  search: '',
  page: 1,
  perPage: 10,
};

export default function OrderReviews() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToOrder = (id) => {
    dispatch(
      addMenu({
        id: 'order_details',
        url: `order/details/${id}`,
        name: t('order.details'),
      }),
    );
    navigate(`/order/details/${id}`);
  };
  const initialColumns = [
    {
      title: t('order.id'),
      dataIndex: 'order',
      key: 'order',
      render: (order) => (
        <div className='text-hover' onClick={() => goToOrder(order?.id)}>
          #{order?.id}
        </div>
      ),
      is_show: true,
    },
    {
      title: t('customer'),
      dataIndex: 'user',
      key: 'user',
      is_show: true,
      render: (user) => `${user?.firstname || ''} ${user?.lastname || ''}`,
    },
    {
      title: t('branch'),
      dataIndex: 'order',
      key: 'shop',
      is_show: true,
      render: (order) => order?.shop?.translation?.title,
    },
    {
      title: t('review'),
      dataIndex: 'comment',
      key: 'comment',
      is_show: true,
      render: (comment) => comment || t('N/A'),
    },
    {
      title: t('rating'),
      dataIndex: 'rating',
      key: 'rating',
      is_show: true,
      render: (rating) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: t('review.date'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (createdAt) => getFullDateTime(createdAt),
    },
    {
      title: t('options'),
      key: 'options',
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

  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [show, setShow] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);
  const [hasMore, setHasMore] = useState({
    shop: false,
    user: false,
  });
  const [filters, setFilters] = useState(initialFilterValues);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { reviews, meta, loading, params } = useSelector(
    (state) => state.orderReview,
    shallowEqual,
  );
  const paramsData = {
    search: filters?.search || undefined,
    assign: filters?.shop?.value ? 'shop' : undefined,
    assign_id: filters?.shop?.value || undefined,
    user_id: filters?.user?.value || undefined,
    perPage: filters?.perPage,
    page: filters?.page,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

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
        dispatch(fetchOrderReviews(paramsData));
        setIsModalVisible(false);
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  const orderReviewDropAll = () => {
    setLoadingBtn(true);
    reviewService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchOrderReviews(paramsData));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const orderReviewRestoreAll = () => {
    setLoadingBtn(true);
    reviewService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(fetchOrderReviews(paramsData));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const handleClearAllFilters = () => {
    setFilters({ ...initialFilterValues, page: 1 });
  };

  function onChangePagination(pagination) {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({
      perPage,
      page: +perPage === +params?.perPage ? page : 1,
    });
  }

  const fetchShops = ({ search = '', page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
    };
    return shopService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        shop: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data?.map((item) => createSelectObject(item));
    });
  };

  const fetchUsers = ({ search = '', page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
    };
    return userService.search(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        user: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data.map((item) => ({
        label: `${item?.firstname || ''} ${item?.lastname || ''}`,
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const onSelectChange = (newSelectedRowKeys) => setId(newSelectedRowKeys);

  const rowSelection = {
    id,
    onChange: onSelectChange,
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.review'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      dispatch(fetchOrderReviews(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useEffect(() => {
    dispatch(fetchOrderReviews(paramsData));
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    dispatch(fetchOrderReviews(paramsData));
    dispatch(disableRefetch(activeMenu));
  }, [filters]);

  return (
    <Card>
      <Typography.Title
        level={1}
        style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 500 }}
      >
        {t('order.reviews')}
      </Typography.Title>
      <Divider color='var(--divider)' />
      <Space wrap>
        <Col style={{ minWidth: '253px' }}>
          <SearchInput
            placeholder={t('search.by.customers')}
            handleChange={(value) => handleFilter('search', value)}
            defaultValue={filters?.search}
            resetSearch={!filters?.search}
            allowClear
            className='w-100'
          />
        </Col>
        <Col style={{ minWidth: '160px' }}>
          <InfiniteSelect
            placeholder={t('all.branches')}
            hasMore={hasMore?.shop}
            fetchOptions={fetchShops}
            onChange={(item) => handleFilter('shop', item)}
            className='w-100'
            value={filters?.shop}
          />
        </Col>
        <Col style={{ minWidth: '189px' }}>
          <InfiniteSelect
            placeholder={t('select.customer')}
            hasMore={hasMore?.user}
            fetchOptions={fetchUsers}
            onChange={(item) => handleFilter('user', item)}
            className='w-100'
            value={filters?.user}
          />
        </Col>
        <Col>
          <Button onClick={handleClearAllFilters}>{t('clear')}</Button>
        </Col>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        className='w-100 d-flex justify-content-end'
        style={{ marginBottom: '30px' }}
      >
        <OutlinedButton color='red' onClick={allDelete}>
          {t('delete.selection')}
        </OutlinedButton>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={reviews}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      <CustomModal
        click={reviewDelete}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        setText={setId}
        loading={loadingBtn}
      />
      {show && (
        <OrderReviewShowModal id={show} handleCancel={() => setShow(null)} />
      )}

      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? orderReviewRestoreAll : orderReviewDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </Card>
  );
}
