import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Space, Table, Typography } from 'antd';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { adminFetchBookingTime } from 'redux/slices/booking-time';
import { useTranslation } from 'react-i18next';
import CustomModal from 'components/modal';
import BookingTime from 'services/booking-time';
import { useNavigate } from 'react-router-dom';
import getFullDateTime from 'helpers/getFullDateTime';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import useDidUpdate from 'helpers/useDidUpdate';

const BookingTables = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { data, loading, meta } = useSelector(
    (state) => state.bookingTime,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('branch'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => shop?.translation?.title || t('N/A'),
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (date) => getFullDateTime(date),
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

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `booking/time/${id}`,
        id: 'booking_time_edit',
        name: t('edit.booking.time'),
      }),
    );
    navigate(`/booking/time/${id}`);
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        url: `booking/time/add`,
        id: 'booking_time_add',
        name: t('add.booking.time'),
      }),
    );
    navigate(`/booking/time/add`);
  };

  const bookingTableDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    BookingTime.delete(params)
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

  const fetchAdminBookingTimeLocal = (params = {}) => {
    dispatch(adminFetchBookingTime(params));
    dispatch(disableRefetch(activeMenu));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    fetchAdminBookingTimeLocal({ perPage, page });
  };

  useEffect(() => {
    fetchAdminBookingTimeLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchAdminBookingTimeLocal();
    }
  }, [activeMenu.refetch]);

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
            {t('reservation.times')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdd}
            style={{ width: '100%' }}
          >
            {t('add.reservation.time')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <Table
          scroll={{ x: true }}
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: meta?.per_page || 10,
            page: meta?.current_page || 1,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          rowKey={(record) => record.id}
          onChange={onChangePagination}
          loading={loading}
        />
      </Card>
      <CustomModal
        click={bookingTableDelete}
        text={t('confirm.delete.selection')}
        setText={setId}
        loading={loadingBtn}
        setActive={setId}
      />
    </>
  );
};

export default BookingTables;
