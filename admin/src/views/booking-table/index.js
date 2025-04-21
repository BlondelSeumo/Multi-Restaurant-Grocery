import { useContext, useEffect, useState } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import useDidUpdate from 'helpers/useDidUpdate';
import { fetchAdminBookingTable } from 'redux/slices/booking-tables';
import sellerBookingTable from 'services/booking-table';
import {
  Button,
  Col,
  Divider,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import TableQrCode from './table-qrcode';
import SearchInput from 'components/search-input';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
};

const BookingTables = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const { tables, meta, loading } = useSelector(
    (state) => state.bookingTable,
    shallowEqual,
  );
  const { settings } = useSelector((state) => state.globalSettings);

  const qrCodeBaseUrl = settings?.qrcode_base_url;

  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const paramsData = {
    shop_id: myShop.id,
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
  };
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('title'),
      dataIndex: 'name',
      key: 'name',
      is_show: true,
      render: (name) => name || t('N/A'),
    },
    {
      title: t('zone'),
      dataIndex: 'shop_section',
      key: 'shop_section',
      is_show: true,
      render: (shop_section) => shop_section?.translation?.title || t('N/A'),
    },
    {
      title: t('chair.count'),
      dataIndex: 'chair_count',
      key: 'chair_count',
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
            className={`${tableRowClasses.option} ${tableRowClasses.clone}`}
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              goToClone(id);
            }}
          >
            <CopyOutlined />
          </button>
          <Tooltip
            title={t(qrCodeBaseUrl ? 'show.qrcode' : 'no.base.url.of.qrcode')}
          >
            <button
              type='button'
              className={`${tableRowClasses.option} ${tableRowClasses.location}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!!qrCodeBaseUrl) {
                  openQrCode(row);
                }
              }}
            >
              <QrcodeOutlined />
            </button>
          </Tooltip>
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

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        id: 'booking-table-edit',
        url: `booking/table/${id}`,
        name: t('booking.table.edit'),
      }),
    );
    navigate(`/booking/table/${id}`);
  };

  const goToClone = (id) => {
    dispatch(
      addMenu({
        id: 'booking-table-clone',
        url: `booking/table/clone/${id}`,
        name: t('booking.table.clone'),
      }),
    );
    navigate(`/booking/table/clone/${id}`);
  };

  const goToAddBox = () => {
    dispatch(
      addMenu({
        id: 'booking-table-add',
        url: 'booking/table/add',
        name: t('add.booking.table'),
      }),
    );
    navigate('/booking/table/add');
  };

  const openQrCode = (row) => {
    setSelectedTable(row);
  };

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
    sellerBookingTable
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setId(null);
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
      toast.warning(t('select.the.table'));
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

  const fetchAdminBookingTableLocal = () => {
    dispatch(fetchAdminBookingTable(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchAdminBookingTableLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    fetchAdminBookingTableLocal();
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchAdminBookingTableLocal();
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
            {t('table.&.qr.codes')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAddBox}
            style={{ width: '100%' }}
          >
            {t('add.reservation.table')}
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
          dataSource={tables}
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
        text={t('confirm.delete.selection')}
        setText={setId}
        loading={loadingBtn}
      />
      <Modal
        title={t('qr.code')}
        width={400}
        visible={!!selectedTable}
        footer={null}
        onCancel={() => setSelectedTable(null)}
      >
        <TableQrCode table={selectedTable} />
      </Modal>
    </>
  );
};

export default BookingTables;
