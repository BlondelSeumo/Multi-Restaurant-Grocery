import { useContext, useEffect, useState } from 'react';
import { Button, Divider, Space, Switch, Table, Tabs, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import bannerService from 'services/banner';
import { fetchBanners } from 'redux/slices/banner';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import ColumnImage from 'components/column-image';
import getFullDateTime from 'helpers/getFullDateTime';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';

const roles = ['published', 'deleted_at'];
const initialFilterValues = {
  status: 'published',
  page: 1,
  perPage: 10,
};

const Banners = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { banners, meta, loading, params } = useSelector(
    (state) => state.banner,
    shallowEqual,
  );

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [type, setType] = useState(null);
  const [id, setId] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => <ColumnImage image={img} row={row} />,
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => {
        return (
          <Switch
            key={row.id + active}
            onChange={() => {
              setIsModalVisible(true);
              setActiveId(row.id);
              setType('active');
            }}
            checked={active}
          />
        );
      },
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => getFullDateTime(created_at),
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'id',
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
            className={`${tableRowClasses.option} ${tableRowClasses.clone}`}
            onClick={(e) => {
              e.stopPropagation();
              goToClone(id);
            }}
          >
            <CopyOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsModalVisible(true);
              setId([id]);
              setType('delete');
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  const paramsData = {
    ...params,
    page: filters?.page || 1,
    perPage: filters?.perPage || 10,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
  };

  const goToAddBanners = () => {
    dispatch(
      addMenu({
        id: 'banner/add',
        url: 'banner/add',
        name: t('add.banner'),
      }),
    );
    navigate('/banner/add');
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `banner/${id}`,
        id: 'banner_edit',
        name: t('edit.banner'),
      }),
    );
    navigate(`/banner/${id}`);
  };

  const goToClone = (id) => {
    dispatch(
      addMenu({
        url: `banner/clone/${id}`,
        id: 'banner_clone',
        name: t('clone.banner'),
      }),
    );
    navigate(`/banner/clone/${id}`);
  };

  const handleDeleteRequest = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    bannerService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setId(null);
        setType(null);
      });
  };

  const handleActiveRequest = () => {
    setLoadingBtn(true);
    bannerService
      .setActive(activeId)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.updated'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setId(null);
        setType(null);
      });
  };

  const handleRestoreRequestAll = () => {
    setLoadingBtn(true);
    bannerService
      .restoreAll()
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.restored'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setId(null);
        setType(null);
      });
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const handleDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.banner'));
    } else {
      setIsModalVisible(true);
    }
  };

  const handleRestore = () => {
    setIsModalVisible(true);
    setType('restore');
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

  const fetchBannersLocal = () => {
    dispatch(fetchBanners(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchBannersLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchBannersLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchBannersLocal();
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
          {t('banners')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAddBanners}
          style={{ width: '100%' }}
        >
          {t('add.banner')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space className='w-100 justify-content-between align-items-start'>
        <Tabs
          activeKey={filters?.status}
          onChange={(key) => handleFilter('status', key)}
          type='card'
        >
          {roles.map((item) => (
            <Tabs.TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        {filters?.status !== 'deleted_at' ? (
          <OutlinedButton onClick={handleDelete} color='red'>
            {t('delete.selection')}
          </OutlinedButton>
        ) : (
          <OutlinedButton onClick={handleRestore} color='green'>
            {t('restore.all')}
          </OutlinedButton>
        )}
      </Space>
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        rowSelection={rowSelection}
        loading={loading}
        columns={columns}
        dataSource={banners}
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
        click={
          type === 'active'
            ? handleActiveRequest
            : type === 'restore'
              ? handleRestoreRequestAll
              : handleDeleteRequest
        }
        text={
          type === 'active'
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : type === 'restore'
              ? t('are.you.sure.restore.all')
              : t('delete.banner')
        }
        loading={loadingBtn}
        setText={setId}
      />
    </Card>
  );
};

export default Banners;
