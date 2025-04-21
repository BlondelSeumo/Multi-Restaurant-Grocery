import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Rate,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FilterColumns from 'components/filter-column';
import { Context } from 'context/context';
import { fetchDelivery } from 'redux/slices/deliveries';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import deliveryService from 'services/delivery';
import CustomModal from 'components/modal';
import numberToPrice from 'helpers/numberToPrice';
import ShowLocationsMap from './show-locations.map';
import DeliverySettingCreate from './add-delivery-settings';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';

const type_of_technique = [
  { label: 'Benzine', value: 'benzine' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Gas', value: 'gas' },
  { label: 'Motorbike', value: 'motorbike' },
  { label: 'Bike', value: 'bike' },
  { label: 'Foot', value: 'foot' },
];
const initialFilterValues = {
  search: '',
  type_of_technique: null,
  page: 1,
  perPage: 10,
};

const DeliveriesList = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { delivery, loading, meta } = useSelector(
    (state) => state.deliveries,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [locationsMap, setLocationsMap] = useState(null);
  const [deliveryModal, setDeliveryModal] = useState(null);

  const paramsData = {
    search: filters?.search || undefined,
    type_of_technique: filters?.type_of_technique || undefined,
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
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      is_show: true,
      render: (_, row) => `${row?.firstname || ''} ${row?.lastname || ''}`,
    },
    {
      title: t('orders.count'),
      dataIndex: 'delivery_man_orders_count',
      key: 'delivery_man_orders_count',
      is_show: true,
      render: (delivery_man_orders_count) => delivery_man_orders_count || 0,
    },
    {
      title: t('sum.total.price'),
      dataIndex: 'delivery_man_orders_sum_total_price',
      key: 'delivery_man_orders_sum_total_price',
      is_show: true,
      render: (price) => numberToPrice(price),
    },
    {
      title: t('rate'),
      dataIndex: 'assign_reviews_avg_rating',
      key: 'rating',
      is_show: true,
      render: (rating) => <Rate disabled allowHalf value={rating || 0} />,
    },
    {
      title: t('wallet'),
      dataIndex: 'wallet',
      key: 'wallet',
      is_show: true,
      render: (wallet) => numberToPrice(wallet?.price),
    },
    {
      title: t('delivery.man.setting'),
      dataIndex: 'delivery_man_setting',
      key: 'delivery_man_setting',
      is_show: true,
      render: (delivery_man_setting, row) => {
        return !delivery_man_setting ? (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              setDeliveryModal({ id: row?.id });
            }}
          >
            {t('add.settings')}
            <EditOutlined className='ml-2' />
          </button>
        ) : (
          <Space>
            <span>
              {t('brand')}: {delivery_man_setting?.brand}
              <br />
              {t('model')}: {delivery_man_setting?.model}
              <br />
              {t('number')}: {delivery_man_setting?.number}
              <br />
              {t('color')}: {delivery_man_setting?.color}
            </span>
            {!!delivery_man_setting && (
              <EditOutlined
                onClick={() =>
                  setDeliveryModal({
                    settingsId: delivery_man_setting?.id,
                    id: row?.id,
                  })
                }
              />
            )}
          </Space>
        );
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      dataIndex: 'uuid',
      is_show: true,
      render: (uuid, row) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              goToEdit(uuid);
            }}
          >
            <EditOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setId([row.id]);
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

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        url: `user/delivery/${uuid}`,
        id: 'delivery_edit',
        name: t('delivery.edit'),
      }),
    );
    navigate(`/user/delivery/${uuid}`);
  };

  const goToAddDeliveryman = () => {
    dispatch(
      addMenu({
        id: 'user-add-role',
        url: `add/user/delivery/deliveryman`,
        name: t(`add.deliveryman`),
      }),
    );
    navigate(`/add/user/delivery/deliveryman`);
  };

  const handleCloseModal = () => {
    setLocationsMap(null);
    setDeliveryModal(null);
  };

  const deliveryDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };

    deliveryService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(paramsData));
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
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
      toast.warning(t('select.the.deliveryman'));
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

  const fetchDeliveryLocal = () => {
    dispatch(fetchDelivery(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchDeliveryLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchDeliveryLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    dispatch(fetchDelivery(paramsData));
  }, [filters]);

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
            {t('deliverymen.list')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAddDeliveryman}
            style={{ width: '100%' }}
          >
            {t('add.deliveryman')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <Space
          className='w-100 justify-content-end align-items-center'
          style={{ rowGap: '6px', columnGap: '6px' }}
        >
          <Col style={{ minWidth: '228px' }}>
            <SearchInput
              placeholder={t('search.by.id.title')}
              className='w-100'
              handleChange={(value) => handleFilter('search', value)}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
            />
          </Col>
          <Col style={{ minWidth: '228px' }}>
            <Select
              labelInValue
              allowClear
              placeholder={t('type.of.technique')}
              options={type_of_technique}
              onChange={(item) =>
                handleFilter('type_of_technique', item?.value)
              }
              value={filters?.type_of_technique}
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
          dataSource={delivery}
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
          click={deliveryDelete}
          text={t('confirm.delete.selection')}
          setText={setId}
          loading={loadingBtn}
        />
        {locationsMap && (
          <ShowLocationsMap id={locationsMap} handleCancel={handleCloseModal} />
        )}
        {deliveryModal && (
          <DeliverySettingCreate
            data={deliveryModal}
            handleCancel={handleCloseModal}
          />
        )}
      </Card>
    </>
  );
};

export default DeliveriesList;
