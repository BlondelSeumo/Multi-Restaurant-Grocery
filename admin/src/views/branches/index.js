import { useContext, useEffect, useState } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Col, Divider, Space, Table, Tabs, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenuData,
  setRefetch,
} from 'redux/slices/menu';
import restaurantService from 'services/restaurant';
import { fetchRestourant } from 'redux/slices/restourant';
import { useTranslation } from 'react-i18next';
import RestaurantStatusModal from './branch-status-modal';
import CustomDrawer from 'components/CustomDrower';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import FilterColumns from 'components/filter-column';
import ResultModal from 'components/result-modal';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import RiveResult from 'components/rive-result';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';

const { TabPane } = Tabs;

const roles = ['all', 'new', 'approved', 'rejected', 'deleted_at'];
const initialFilterValues = {
  page: 1,
  perPage: 10,
  search: '',
};

const Restaurants = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { restaurants, meta, loading } = useSelector(
    (state) => state.restourant,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [restaurantStatus, setRestaurantStatus] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [restore, setRestore] = useState(null);
  const [id, setId] = useState(null);
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
      render: (translation) => translation?.title || t('N/A'),
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
      title: t('logo'),
      dataIndex: 'logo_img',
      key: 'logo_img',
      is_show: true,
      render: (img, row) => (
        <ColumnImage image={!row?.deleted_at && img} id={row?.id} />
      ),
    },
    {
      title: t('background'),
      dataIndex: 'background_img',
      key: 'background_img',
      is_show: true,
      render: (img, row) => (
        <ColumnImage image={!row?.deleted_at && img} id={row?.id} />
      ),
    },
    {
      title: t('seller'),
      dataIndex: 'seller',
      key: 'seller',
      is_show: true,
      render: (seller) =>
        `${seller?.firstname || ''} ${seller?.lastname || ''}`,
    },
    {
      title: t('open'),
      dataIndex: 'open',
      key: 'open',
      is_show: true,
      render: (open) => (
        <div style={{ color: open ? 'var(--green)' : 'var(--red)' }}>
          {t(open ? 'open' : 'closed')}
        </div>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      is_show: true,
      render: (status, row) => (
        <button
          type='button'
          onClick={() => setRestaurantStatus(row)}
          className={tableRowClasses.status}
          disabled={!!row?.deleted_at}
        >
          <span className={tableRowClasses[status || 'new']}>{t(status)}</span>
          <EditOutlined />
        </button>
      ),
    },
    {
      title: t('options'),
      dataIndex: 'uuid',
      key: 'options',
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
            className={`${tableRowClasses.option} ${tableRowClasses.clone}`}
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              goToClone(uuid);
            }}
          >
            <CopyOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setIsModalVisible(true);
              setId([row?.id]);
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
    status:
      filters?.status !== 'all' && filters?.status !== 'deleted_at'
        ? filters?.status
        : undefined,
    deleted_at: filters?.status === 'deleted_at' ? 'deleted_at' : undefined,
    page: filters?.page || 1,
    perPage: filters?.perPage || 10,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        id: 'edit-branch',
        url: `branch/${uuid}`,
        name: t('edit.branch'),
      }),
    );
    navigate(`/branch/${uuid}`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: 'branch-clone',
        url: `branch-clone/${uuid}`,
        name: t('branch.clone'),
      }),
    );
    navigate(`/branch-clone/${uuid}`);
  };

  const goToAdd = () => {
    if (restaurants.length > 3 || !meta.current_page) {
      toast.error(
        `${t('you.cant.add.more.than.3.branches')}. ${t(
          'to.add.more.branches.contact.with.support',
        )}`,
      );
      return;
    }
    dispatch(
      addMenu({
        id: 'add-branch',
        url: `branch/add`,
        name: t('add.branch'),
      }),
    );
    navigate(`/branch/add`);
  };

  const restaurantDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    restaurantService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
        setRestore(null);
      });
  };

  const restaurantRestoreAll = () => {
    setLoadingBtn(true);
    restaurantService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
        setRestore(null);
      });
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.branch'));
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

  const fetchRestaurantLocal = () => {
    dispatch(fetchRestourant(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchRestaurantLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchRestaurantLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchRestaurantLocal();
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
          {t('branches')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.branch')}
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
        {filters?.status !== 'deleted_at' ? (
          <OutlinedButton
            color='red'
            onClick={(e) => {
              e.stopPropagation();
              allDelete();
            }}
          >
            {t('delete.selection')}
          </OutlinedButton>
        ) : (
          <OutlinedButton
            color='green'
            onClick={(e) => {
              e.stopPropagation();
              setRestore({ restore: true });
            }}
          >
            {t('restore.all')}
          </OutlinedButton>
        )}
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Divider color='var(--divider)' />
      <Tabs
        className='mt-3'
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
        rowSelection={{
          selectedRowKeys: id,
          onChange: (key) => setId(key),
        }}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={restaurants}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record.id}
      />
      {restaurantStatus && (
        <RestaurantStatusModal
          data={restaurantStatus}
          handleCancel={() => setRestaurantStatus(null)}
          paramsData={paramsData}
        />
      )}
      <CustomModal
        click={restaurantDelete}
        text={t('confirm.delete.selection')}
        setText={setId}
        loading={loadingBtn}
      />
      {openDrawer && (
        <CustomDrawer
          handleClose={() => setOpenDrawer(false)}
          openDrower={openDrawer}
          setMenuData={setMenuData}
        />
      )}
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restaurantRestoreAll}
          text={t('restore.modal.text')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </Card>
  );
};

export default Restaurants;
