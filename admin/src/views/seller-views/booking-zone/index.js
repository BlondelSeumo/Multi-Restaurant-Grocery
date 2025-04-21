import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Space, Table, Typography } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchBookingZone } from 'redux/slices/booking-zone';
import sellerBookingService from 'services/seller/booking-zone';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import SearchInput from 'components/search-input';
import OutlinedButton from 'components/outlined-button';

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
};

const BookingZone = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { zone, meta, loading } = useSelector(
    (state) => state.bookingZone,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
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
      title: t('translations'),
      dataIndex: 'locales',
      key: 'locales',
      is_show: true,
      render: (locales) => (
        <div className={tableRowClasses.locales}>
          {locales?.map((item, index) => (
            <div
              key={item}
              className={`${tableRowClasses.locale} ${1 & index ? tableRowClasses.odd : tableRowClasses.even}`}
            >
              {item}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img, row) => <ColumnImage image={img} id={row?.id} />,
    },
    {
      title: t('area'),
      dataIndex: 'area',
      key: 'area',
      is_show: true,
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
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            disabled={!!row?.deleted_at}
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
  const [columns, setColumns] = useState(initialColumns);

  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const brandDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    sellerBookingService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
        setIsModalVisible(false);
        setText(null);
      });
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `seller/booking/zone/${id}`,
        id: 'box_edit',
        name: t('edit.box'),
      }),
    );
    navigate(`/seller/booking/zone/${id}`);
  };

  const goToAddBox = () => {
    dispatch(
      addMenu({
        id: 'add-booking-zone',
        url: 'seller/booking/zone/add',
        name: t('add.booking.zone'),
      }),
    );
    navigate('/seller/booking/zone/add');
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.zone'));
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

  const fetchSellerBookingZoneLocal = () => {
    dispatch(fetchBookingZone(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchSellerBookingZoneLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    fetchSellerBookingZoneLocal();
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchSellerBookingZoneLocal();
    }
    // eslint-disable-next-line
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
            {t('reservation.zones')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAddBox}
            style={{ width: '100%' }}
          >
            {t('add.reservation.zone')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <Space
          wrap
          style={{ rowGap: '6px', columnGap: '6px' }}
          className='w-100 justify-content-end'
        >
          <Col style={{ minWidth: '320px' }}>
            <SearchInput
              placeholder={t('search.by.title')}
              className='w-100'
              handleChange={(value) => handleFilter('search', value)}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
            />
          </Col>
          <OutlinedButton onClick={allDelete} color='red'>
            {t('delete.selection')}
          </OutlinedButton>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
        <Divider color='var(--divider)' />
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={zone}
          pagination={{
            pageSize: meta.per_page || 10,
            page: meta?.current_page || 1,
            total: meta.total || 0,
            current: meta?.current_page || 1,
          }}
          rowKey={(record) => record.id}
          onChange={onChangePagination}
          loading={loading}
        />
      </Card>
      <CustomModal
        click={brandDelete}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        setText={setId}
        loading={loadingBtn}
      />
    </>
  );
};

export default BookingZone;
