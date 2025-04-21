import { useContext, useEffect, useState } from 'react';
import { Button, Divider, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { fetchMessageSubscriber } from 'redux/slices/messegeSubscriber';
import messageSubscriberService from 'services/messageSubscriber';
import moment from 'moment';
import FilterColumns from 'components/filter-column';
import ResultModal from 'components/result-modal';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import getFullDateTime from 'helpers/getFullDateTime';
import RiveResult from 'components/rive-result';
import useDidUpdate from 'helpers/useDidUpdate';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

const EmailTemplates = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { subscribers, loading, meta } = useSelector(
    (state) => state.messageSubscriber,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [type, setType] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('send.to'),
      dataIndex: 'send_to',
      key: 'send_to',
      is_show: true,
      render: (date) => (
        <div className={tableRowClasses.status}>
          <span
            className={`${moment(new Date()).isBefore(date) ? tableRowClasses.published : tableRowClasses.unpublished}`}
          >
            {getFullDateTime(date)}
          </span>
        </div>
      ),
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
              setIsModalVisible(true);
              setId([id]);
              setType(false);
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

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'message_subscriber_add',
        url: `message/subscriber/add`,
        name: t('add.subciribed'),
      }),
    );
    navigate(`/message/subscriber/add`);
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `message/subscriber/${id}`,
        id: 'subciribed_edit',
        name: t('edit.subscriber'),
      }),
    );
    navigate(`/message/subscriber/${id}`);
  };

  const subscriberDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    messageSubscriberService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setId(null);
        setRestore(null);
      });
  };

  const subscriberRestoreAll = () => {
    setLoadingBtn(true);
    messageSubscriberService
      .restoreAll()
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.restored'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setId(null);
        setRestore(null);
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
      toast.warning(t('select.the.email.template'));
    } else {
      setIsModalVisible(true);
    }
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({
      perPage,
      page: +perPage === +filters.perPage ? page : 1,
    });
  };

  const fetchMessageSubscriberLocal = () => {
    dispatch(fetchMessageSubscriber({}));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchMessageSubscriberLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchMessageSubscriberLocal();
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
          {t('email.templates')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.email.template')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space className='w-100 justify-content-end align-items-center'>
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
        dataSource={subscribers}
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
        click={subscriberDelete}
        text={
          type
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : t('confirm.delete.selection')
        }
        loading={loadingBtn}
        setText={setId}
      />

      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={subscriberRestoreAll}
          text={t('restore.modal.text')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </Card>
  );
};

export default EmailTemplates;
