import { useEffect, useState, useContext } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExpandOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Col, Divider, Space, Table, Tabs, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from 'redux/slices/user';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import UserShowModal from './userShowModal';
import { useTranslation } from 'react-i18next';
import UserRoleModal from './userRoleModal';
import SearchInput from 'components/search-input';
import FilterColumns from 'components/filter-column';
import { Context } from 'context/context';
import { toast } from 'react-toastify';
import deliveryService from 'services/delivery';
import CustomModal from 'components/modal';
import ResultModal from 'components/result-modal';
import userService from 'services/user';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';
import Card from 'components/card';

const { TabPane } = Tabs;

const roles = [
  'admin',
  'seller',
  'moderator',
  'manager',
  'cook',
  'deliveryman',
  'waiter',
  'deleted_at',
];

const initialFilterValues = {
  search: '',
  role: 'admin',
  page: 1,
  perPage: 10,
};

export default function Admin() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { users, loading, meta } = useSelector(
    (state) => state.user,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);

  const paramsData = {
    role: filters?.role !== 'deleted_at' ? filters?.role : undefined,
    deleted_at: filters?.role === 'deleted_at' ? filters?.role : undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    search: filters?.search || undefined,
  };

  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('firstname'),
      dataIndex: 'firstname',
      key: 'firstname',
      is_show: true,
    },
    {
      title: t('lastname'),
      dataIndex: 'lastname',
      key: 'lastname',
      is_show: true,
    },
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
      is_show: true,
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
      is_show: true,
      render: (role) => t(role),
    },
    {
      title: t('actions'),
      dataIndex: 'uuid',
      key: 'uuid',
      is_show: true,
      render: (uuid, row) => {
        return (
          <div className={tableRowClasses.options}>
            <button
              type='button'
              className={`${tableRowClasses.option} ${tableRowClasses.location}`}
              disabled={!!row?.deleted_at}
              onClick={(e) => {
                e.stopPropagation();
                setUuid(uuid);
              }}
            >
              <ExpandOutlined />
            </button>
            <button
              type='button'
              className={`${tableRowClasses.option} ${tableRowClasses.details}`}
              disabled={!!row?.deleted_at}
              onClick={(e) => {
                e.stopPropagation();
                goToDetail(uuid, row?.id);
              }}
            >
              <EyeOutlined />
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
            {row?.role !== 'admin' && (
              <>
                <button
                  type='button'
                  className={`${tableRowClasses.option} ${tableRowClasses.clone}`}
                  disabled={!!row?.deleted_at || row?.role === 'admin'}
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
                  disabled={!!row?.deleted_at || row?.role === 'admin'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setId([row.id]);
                    setIsModalVisible(true);
                  }}
                >
                  <DeleteOutlined />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToAdduser = (e) => {
    dispatch(
      addMenu({
        id: 'user-add-role',
        url: `user/add/${e}`,
        name: t(`add.${e}`),
      }),
    );
    navigate(`/user/add/${e}`);
  };

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        url: `user/${uuid}`,
        id: 'user_edit',
        name: 'User edit',
      }),
    );
    navigate(`/user/${uuid}`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        url: `user-clone/${uuid}`,
        id: 'user-clone',
        name: 'user.clone',
      }),
    );
    navigate(`/user-clone/${uuid}`);
  };

  const goToDetail = (uuid, id) => {
    dispatch(
      addMenu({
        url: `/users/user/${uuid}`,
        id: 'user_info',
        name: t('user.info'),
      }),
    );
    navigate(`/users/user/${uuid}`, { state: { user_id: id } });
  };

  const userDelete = () => {
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
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setRestore(null);
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
      });
  };

  const userRestoreAll = () => {
    setLoadingBtn(true);
    userService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setRestore(null);
        setLoadingBtn(false);
        setIsModalVisible(false);
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
      toast.warning(t('select.the.user'));
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

  const fetchUsersLocal = () => {
    dispatch(fetchUsers(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchUsersLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchUsersLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchUsersLocal();
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
          {t('staff.&.admin.users')}
        </Typography.Title>
        {filters?.role !== 'deleted_at' && filters?.role !== 'admin' && (
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdduser}
            style={{ width: '100%' }}
          >
            {t(`add.${filters?.role}`)}
          </Button>
        )}
      </Space>
      <Divider color='var(--divider)' />
      <Space
        className='w-100 justify-content-end align-items-center'
        style={{ rowGap: '6px', columnGap: '6px' }}
      >
        <Col style={{ minWidth: '228px' }}>
          <SearchInput
            placeholder={t('search.by.id.name')}
            className='w-100'
            handleChange={(value) => handleFilter('search', value)}
            defaultValue={filters?.search}
            resetSearch={!filters?.search}
          />
        </Col>
        {filters?.role !== 'deleted_at' && filters?.role !== 'admin' && (
          <OutlinedButton onClick={allDelete} color='red'>
            {t('delete.selection')}
          </OutlinedButton>
        )}
        {filters?.role === 'deleted_at' && (
          <OutlinedButton
            color='green'
            onClick={() => setRestore({ restore: true })}
          >
            {t('restore.all')}
          </OutlinedButton>
        )}
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Divider color='var(--divider)' />
      <Tabs
        scroll={{ x: true }}
        activeKey={filters?.role}
        onChange={(key) => {
          handleFilter('role', key);
        }}
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
        dataSource={users}
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
        click={userDelete}
        text={t('confirm.delete.selection')}
        loading={loadingBtn}
        setText={setId}
      />
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={userRestoreAll}
          text={t('restore.modal.text')}
          loading={loadingBtn}
        />
      )}
      {uuid && <UserShowModal uuid={uuid} handleCancel={() => setUuid(null)} />}
      {userRole && (
        <UserRoleModal data={userRole} handleCancel={() => setUserRole(null)} />
      )}
    </Card>
  );
}
