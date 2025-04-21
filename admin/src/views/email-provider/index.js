import { useState, useContext, useEffect } from 'react';
import { Button, Divider, Space, Switch, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import CustomModal from 'components/modal';
import { fetchEmailProvider } from 'redux/slices/emailProvider';
import emailService from 'services/emailSettings';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import hideEmail from 'components/hideEmail';
import useDemo from 'helpers/useDemo';
import getFullDateTime from 'helpers/getFullDateTime';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import useDidUpdate from 'helpers/useDidUpdate';
import Card from 'components/card';

export default function EmailProvider() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { setIsModalVisible } = useContext(Context);
  const { isDemo } = useDemo();
  const { emailProvider, loading } = useSelector(
    (state) => state.emailProvider,
    shallowEqual,
  );

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const [modalType, setModalType] = useState('delete'); // delete | active

  const columns = [
    {
      title: t('from_site'),
      dataIndex: 'from_site',
      key: 'from_site',
    },
    {
      title: t('from.to'),
      dataIndex: 'from_to',
      key: 'from_to',
      render: (from_to) => (isDemo ? hideEmail(from_to) : from_to),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setModalType('active');
              setIsModalVisible(true);
              setId(row.id);
            }}
            disabled={row.deleted_at}
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
              goToEditEmailProviders(id);
            }}
          >
            <EditOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(id);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  const goToAddEmailProviders = () => {
    dispatch(
      addMenu({
        id: 'add_email_providers',
        url: `settings/emailProviders/add`,
        name: t('add_email_providers'),
      }),
    );
    navigate(`/settings/emailProviders/add`);
  };

  const goToEditEmailProviders = (id) => {
    dispatch(
      addMenu({
        url: `settings/emailProviders/${id}`,
        id: 'edit_email_providers',
        name: t('edit.email.providers'),
      }),
    );
    navigate(`/settings/emailProviders/${id}`, { state: 'edit' });
  };

  const confirmDelete = (id) => {
    if (!id) {
      toast.warning(t('no.id'));
    } else {
      setModalType('delete');
      setId([id]);
      setIsModalVisible(true);
    }
  };

  const handleDeleteConditions = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    emailService
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

  const setDefaultLang = () => {
    setLoadingBtn(true);
    emailService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setId(null);
        setIsModalVisible(false);
      });
  };

  const fetchEmailProviderLocal = () => {
    dispatch(fetchEmailProvider({}));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchEmailProviderLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchEmailProviderLocal();
    }
  }, [activeMenu.refetch]);

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
          {t('email.providers')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAddEmailProviders}
          style={{ width: '100%' }}
        >
          {t('add.email.provider')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Table
        scroll={{ x: true }}
        columns={columns}
        dataSource={emailProvider}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={false}
      />
      <CustomModal
        click={modalType === 'delete' ? handleDeleteConditions : setDefaultLang}
        text={
          modalType === 'delete'
            ? t('are.you.sure.to.delete')
            : t('are.you.sure.you.want.to.change.the.activity?')
        }
        loading={loadingBtn}
      />
    </Card>
  );
}
