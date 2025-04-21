import { useContext, useEffect, useState } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Rate, Space, Table, Typography } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import reviewService from 'services/seller/review';
import { sellerfetchOrderReviews } from 'redux/slices/orderReview';
import OrderReviewShowModal from './orderReviewShow';
import ResultModal from 'components/result-modal';
import userService from 'services/seller/user';
import getFullDateTime from 'helpers/getFullDateTime';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import SearchInput from 'components/search-input';
import { InfiniteSelect } from 'components/infinite-select';
import FilterColumns from 'components/filter-column';

const initialFilterValues = {
  perPage: 10,
  page: 1,
  search: '',
  user: null,
  type: 'order',
};

export default function SellerOrderReviews() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { reviews, meta, loading, params } = useSelector(
    (state) => state.orderReview,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [show, setShow] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const [hasMore, setHasMore] = useState({
    user: false,
  });
  const initialColumns = [
    {
      title: t('order.id'),
      dataIndex: 'order',
      key: 'order',
      is_show: true,
      render: (order) => `#${order?.id}`,
    },
    {
      title: t('customer'),
      dataIndex: 'user',
      key: 'user',
      is_show: true,
      render: (user) => `${user?.firstname || ''} ${user?.lastname || ''}`,
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
          {/*<button*/}
          {/*  type='button'*/}
          {/*  className={`${tableRowClasses.option} ${tableRowClasses.delete}`}*/}
          {/*  onClick={(e) => {*/}
          {/*    e.stopPropagation();*/}
          {/*    setId([id]);*/}
          {/*    setIsModalVisible(true);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <DeleteOutlined />*/}
          {/*</button>*/}
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    user_id: filters?.user?.value || undefined,
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
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setId(null);
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const orderReviewRestoreAll = () => {
    setLoadingBtn(true);
    reviewService
      .restoreAll()
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.restored'));
      })
      .finally(() => {
        setRestore(null);
        setLoadingBtn(false);
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

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const handleClearAllFilters = () => {
    setFilters({ ...initialFilterValues, page: 1 });
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({
      perPage,
      page: +perPage === +params?.perPage ? page : 1,
    });
  };

  // const allDelete = () => {
  //   if (id === null || id.length === 0) {
  //     toast.warning(t('select.the.product'));
  //   } else {
  //     setIsModalVisible(true);
  //   }
  // };

  const rowSelection = {
    id,
    onChange: (item) => setId(item),
  };

  const fetchSellerOrderReviewsLocal = () => {
    dispatch(sellerfetchOrderReviews(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchSellerOrderReviewsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchSellerOrderReviewsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchSellerOrderReviewsLocal();
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
      <Space wrap style={{ marginBottom: '40px' }}>
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
      <Space
        className='w-100 d-flex justify-content-end'
        style={{ marginBottom: '30px' }}
      >
        {/*<OutlinedButton color='red' onClick={allDelete}>*/}
        {/*  {t('delete.selection')}*/}
        {/*</OutlinedButton>*/}
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={reviews}
        pagination={{
          pageSize: +meta?.per_page || 10,
          page: +meta?.current_page || 1,
          total: +meta?.total || 0,
          current: +meta?.current_page || 1,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
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
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={orderReviewRestoreAll}
          text={t('restore.modal.text')}
          subTitle={t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </Card>
  );
}
