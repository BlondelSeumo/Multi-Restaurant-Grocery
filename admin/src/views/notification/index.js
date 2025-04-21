import { useContext, useEffect, useState } from 'react';
import {
  CloudUploadOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Divider, Space, Switch, Table, Tabs, Typography } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { fetchNotifications } from 'redux/slices/notification';
import useDidUpdate from 'helpers/useDidUpdate';
import blogService from 'services/blog';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import ResultModal from 'components/result-modal';
import Card from 'components/card';
import getFullDateTime from 'helpers/getFullDateTime';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';

const { TabPane } = Tabs;

const roles = ['published', 'deleted_at'];
const initialFilterValues = {
  page: 1,
  perPage: 10,
  status: 'published',
  type: 'notifications',
};

export default function Notifications() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { notifications, meta, loading } = useSelector(
    (state) => state.notification,
    shallowEqual,
  );
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
              className={`${tableRowClasses.locale} ${1 & index ? tableRowClasses.odd : tableRowClasses.even}`}
            >
              {item}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (created_at) => getFullDateTime(created_at),
    },
    {
      title: t('published.at'),
      dataIndex: 'published_at',
      key: 'published_at',
      is_show: true,
      render: (published_at) => (
        <div className={tableRowClasses.status}>
          <span
            className={`${published_at ? tableRowClasses.published : tableRowClasses.unpublished}`}
          >
            {published_at
              ? getFullDateTime(published_at, false)
              : t('unpublished')}
          </span>
        </div>
      ),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active, row) => (
        <Switch
          disabled={row?.deleted_at}
          checked={active}
          onChange={() => {
            setId(row.uuid);
            setIsDelete(false);
            setIsPublish(false);
            setIsModalVisible(true);
          }}
        />
      ),
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
            className={`${tableRowClasses.option} ${tableRowClasses.location}`}
            disabled={!!row?.deleted_at || !!row?.published_at}
            onClick={(e) => {
              e.stopPropagation();
              setId(uuid);
              setIsDelete(false);
              setIsPublish(true);
              setIsModalVisible(true);
            }}
          >
            <CloudUploadOutlined />
          </button>
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
              setId([row?.id]);
              setIsDelete(true);
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

  const [id, setId] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [isPublish, setIsPublish] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);

  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        url: `notification/${uuid}`,
        id: 'notification_edit',
        name: t('edit.notification'),
      }),
    );
    navigate(`/notification/${uuid}`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: `notification-clone`,
        url: `notification-clone/${uuid}`,
        name: t('notification.clone'),
      }),
    );
    navigate(`/notification-clone/${uuid}`);
  };

  const notificationDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    blogService
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

  const notificationRestoreAll = () => {
    setLoadingBtn(true);
    blogService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setId(null);
        setRestore(null);
        setId(null);
        setIsPublish(false);
      });
  };

  const notificationPublish = () => {
    setLoadingBtn(true);
    blogService
      .publish(id)
      .then(() => {
        toast.success(t('successfully.published'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setIsModalVisible(false);
        setIsPublish(false);
        setLoadingBtn(false);
        setRestore(null);
        setId(null);
      });
  };

  const notificationSetActive = () => {
    setLoadingBtn(true);
    blogService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setIsPublish(false);
        setRestore(null);
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
      toast.warning(t('select.the.notification'));
    } else {
      setIsModalVisible(true);
      setIsDelete(true);
    }
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add.notification',
        url: `notification/add`,
        name: t('add.notification'),
      }),
    );
    navigate(`/notification/add`);
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

  const fetchNotificationsLocal = () => {
    dispatch(fetchNotifications(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchNotificationsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchNotificationsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchNotificationsLocal();
  }, [filters]);

  return (
    <Card
    // title={t('notifications')}
    // extra={
    //   <Space>
    //     {immutable !== 'deleted_at' ? (
    //       <Space wrap>
    //         <DeleteButton size='' onClick={allDelete}>
    //           {t('delete.selected')}
    //         </DeleteButton>
    //         <DeleteButton
    //           size=''
    //           onClick={() => setRestore({ delete: true })}
    //         >
    //           {t('delete.all')}
    //         </DeleteButton>
    //       </Space>
    //     ) : (
    //       <DeleteButton
    //         icon={<FaTrashRestoreAlt className='mr-2' />}
    //         onClick={() => setRestore({ restore: true })}
    //       >
    //         {t('restore.all')}
    //       </DeleteButton>
    //     )}
    //     <Button
    //       icon={<PlusCircleOutlined />}
    //       type='primary'
    //       onClick={goToAdd}
    //     >
    //       {t('add.notification')}
    //     </Button>
    //     <FilterColumns columns={columns} setColumns={setColumns} />
    //   </Space>
    // }
    >
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
          {t('notifications')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.notification')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space className='w-100 justify-content-between align-items-start'>
        <Tabs
          activeKey={filters?.status}
          onChange={(key) => {
            handleFilter('status', key);
          }}
          type='card'
        >
          {roles.map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <Space>
          {filters?.status !== 'deleted_at' ? (
            <OutlinedButton onClick={allDelete} color='red'>
              {t('delete.selection')}
            </OutlinedButton>
          ) : (
            <OutlinedButton
              onClick={() => setRestore({ restore: true })}
              color='green'
            >
              {t('restore.all')}
            </OutlinedButton>
          )}
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
      </Space>
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        rowSelection={rowSelection}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={notifications}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record?.id}
      />
      <CustomModal
        click={
          isPublish
            ? notificationPublish
            : isDelete
              ? notificationDelete
              : notificationSetActive
        }
        text={
          isPublish
            ? t('publish.notification')
            : isDelete
              ? t('delete.notification')
              : t('are.you.sure.you.want.to.change.the.activity?')
        }
        loading={loadingBtn}
        setText={setId}
      />

      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={notificationRestoreAll}
          text={t('restore.modal.text')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </Card>
  );
}
