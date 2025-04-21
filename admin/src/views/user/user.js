import { useEffect, useState, useContext } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  ExpandOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaUserCog } from 'react-icons/fa';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import UserShowModal from './userShowModal';
import UserRoleModal from './userRoleModal';
import { fetchClients } from 'redux/slices/client';
import SearchInput from 'components/search-input';
import FilterColumns from 'components/filter-column';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import deliveryService from 'services/delivery';
import ResultModal from 'components/result-modal';
import userService from 'services/user';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';

const { TabPane } = Tabs;

const roles = ['published', 'deleted_at'];
const initialFilterValues = {
  search: '',
  status: 'published',
  page: 1,
  perPage: 10,
};

const User = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { clients, loading, meta } = useSelector(
    (state) => state.client,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [text, setText] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    search: filters?.search || undefined,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
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
      key: 'actions',
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
                goToDetail(uuid);
              }}
            >
              <EyeOutlined />
            </button>
            <Tooltip title={t('change.user.role')}>
              <button
                type='button'
                className={`${tableRowClasses.option} ${tableRowClasses.download}`}
                disabled={!!row?.deleted_at}
                onClick={(e) => {
                  e.stopPropagation();
                  setUserRole(row);
                }}
              >
                <FaUserCog />
              </button>
            </Tooltip>
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
                setText(true);
              }}
            >
              <DeleteOutlined />
            </button>
          </div>
        );
      },
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        url: `user/${uuid}`,
        id: 'user_edit',
        name: t('user.edit'),
      }),
    );
    navigate(`/user/${uuid}`, { state: 'user' });
  };

  const goToDetail = (uuid) => {
    dispatch(
      addMenu({
        url: `users/user/${uuid}`,
        id: 'user_info',
        name: t('user.info'),
      }),
    );
    navigate(`/users/user/${uuid}`, { state: { user_id: id } });
  };

  const goToAddClient = () => {
    dispatch(
      addMenu({
        id: 'user-add',
        url: 'user/add',
        name: t('add.client'),
      }),
    );
    navigate('/user/add');
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
        dispatch(fetchClients(paramsData));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setText([]);
        setId(null);
      });
  };

  const clientRestoreAll = () => {
    setLoadingBtn(true);
    userService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(fetchClients(paramsData));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.client'));
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

  const fetchClientsLocal = () => {
    dispatch(fetchClients(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchClientsLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchClientsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchClientsLocal();
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
          {t('customers')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAddClient}
          style={{ width: '100%' }}
        >
          {t('add.customer')}
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
        {filters?.status !== 'deleted_at' ? (
          <OutlinedButton onClick={allDelete} color='red'>
            {t('delete.selection')}
          </OutlinedButton>
        ) : (
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
        dataSource={clients}
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
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        loading={loadingBtn}
        setText={setId}
      />
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={clientRestoreAll}
          text={t('restore.modal.text')}
          loading={loadingBtn}
          setText={setText}
        />
      )}
      {uuid && <UserShowModal uuid={uuid} handleCancel={() => setUuid(null)} />}
      {userRole && (
        <UserRoleModal data={userRole} handleCancel={() => setUserRole(null)} />
      )}
    </Card>
  );
};

export default User;
