import { useContext, useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Col, Divider, Space, Table, Tabs, Typography } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import bookingService from 'services/booking';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchBookingList } from 'redux/slices/booking-list';
import BookingStatusModal from './bookingStatusModal';
import BookingShowModal from './bookingShowModal';
import getFullDateTime from 'helpers/getFullDateTime';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';

const { TabPane } = Tabs;

const roles = ['all', 'new', 'accepted', 'canceled', 'deleted_at'];
const initialFilterValues = {
  page: 1,
  perPage: 10,
  search: '',
};

const BookingList = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const { booking, meta, loading } = useSelector(
    (state) => state.bookingList,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);

  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    status:
      filters?.status !== 'all' && filters?.status !== 'deleted_at'
        ? filters?.status
        : undefined,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
    shop_id: myShop.id,
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'reservation/add',
        url: 'booking',
        name: t('add.reservation'),
      }),
    );
    navigate('/booking');
  };

  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('client'),
      dataIndex: 'user',
      key: 'user',
      is_show: true,
      render: (user) => `${user?.firstname || ''} ${user?.lastname || ''}`,
    },
    {
      title: t('date.time'),
      dataIndex: 'start_date',
      key: 'start_date',
      is_show: true,
      render: (date) => getFullDateTime(date),
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => {
        const isCanEdit = !row?.deleted_at;
        return (
          <button
            type='button'
            className={tableRowClasses.status}
            disabled={!isCanEdit}
            onClick={(e) => {
              e.stopPropagation();
              if (isCanEdit) {
                setBookingDetails(row);
              }
            }}
          >
            <span className={tableRowClasses[status || 'new']}>
              {t(status)}
            </span>
            {isCanEdit && <EditOutlined />}
          </button>
        );
      },
    },
    {
      title: t('num.of.guests'),
      dataIndex: 'guest',
      key: 'guest',
      is_show: true,
      render: (guest, row) => guest ?? row?.table?.chair_count,
    },
    {
      title: t('actions'),
      key: 'actions',
      dataIndex: 'id',
      is_show: true,
      render: (id, row) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.details}`}
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setBookingId(id);
            }}
          >
            <EyeOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            disabled={!!row?.deleted_at}
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

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const bookingDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    bookingService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setText(null);
        setId(null);
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
      toast.warning(t('select.the.reservation'));
    } else {
      setIsModalVisible(true);
      setText(false);
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

  const fetchBookingListLocal = () => {
    dispatch(fetchBookingList(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchBookingListLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myShop.id]);

  useDidUpdate(() => {
    fetchBookingListLocal();
  }, [filters, myShop.id]);

  useDidUpdate(() => {
    if (activeMenu.refetch && myShop.id) {
      fetchBookingListLocal();
    }
  }, [activeMenu.refetch, myShop.id]);

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
            {t('reservation.list')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdd}
            style={{ width: '100%' }}
          >
            {t('add.reservation')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <Space
          wrap
          className='w-100 justify-content-end align-items-center'
          style={{ rowGap: '6px', columnGap: '6px' }}
        >
          <Col style={{ minWidth: '228px' }}>
            <SearchInput
              placeholder={t('search.by.title')}
              className='w-100'
              handleChange={(value) => handleFilter('search', value)}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
            />
          </Col>
          <OutlinedButton
            color='red'
            onClick={(e) => {
              e.stopPropagation();
              allDelete();
            }}
          >
            {t('delete.selection')}
          </OutlinedButton>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
        <Divider color='var(--divider)' />
        <Tabs
          activeKey={filters?.status}
          onChange={(key) => handleFilter('status', key)}
          type='card'
        >
          {roles.map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <Table
          locale={{
            emptyText: <RiveResult />,
          }}
          scroll={{ x: true }}
          rowSelection={rowSelection}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={booking}
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
      {bookingDetails && (
        <BookingStatusModal
          orderDetails={bookingDetails}
          handleCancel={() => setBookingDetails(null)}
          paramsData={paramsData}
        />
      )}
      <CustomModal
        click={bookingDelete}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        setText={setId}
        loading={loadingBtn}
      />
      {bookingId && (
        <BookingShowModal
          handleCancel={() => setBookingId(null)}
          id={bookingId}
        />
      )}
    </>
  );
};

export default BookingList;
