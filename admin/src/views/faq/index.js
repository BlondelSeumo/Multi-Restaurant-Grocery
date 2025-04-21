import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Space, Switch, Table, Typography } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import faqService from 'services/faq';
import { fetchFaqs } from 'redux/slices/faq';
import FilterColumns from 'components/filter-column';
import Card from 'components/card';
import getFullDateTime from 'helpers/getFullDateTime';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

export default function FAQ() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { faqs, meta, loading } = useSelector(
    (state) => state.faq,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('question'),
      dataIndex: 'translation',
      key: 'translation',
      is_show: true,
      render: (translation) => (
        <span style={{ wordBreak: 'break-all' }}>{translation?.question}</span>
      ),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      is_show: true,
      render: (type) => t(type),
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      is_show: true,
      render: (created_at) => getFullDateTime(created_at),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active, row) => (
        <Switch
          checked={active}
          onChange={() => {
            setId(row.uuid);
            setIsDelete(false);
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
      render: (uuid) => {
        return (
          <div className={tableRowClasses.options}>
            <button
              type='button'
              className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
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
              onClick={(e) => {
                e.stopPropagation();
                setId([uuid]);
                setIsDelete(true);
                setIsModalVisible(true);
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

  const paramsData = {
    page: filters?.page || 1,
    perPage: filters?.perPage || 10,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add.faq',
        url: `faq/add`,
        name: t('add.faq'),
      }),
    );
    navigate(`/faq/add`);
  };

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        url: `faq/${uuid}`,
        id: `faq_${uuid}`,
        name: t('edit.faq'),
      }),
    );
    navigate(`/faq/${uuid}`);
  };

  const faqDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    faqService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
      });
  };

  const faqSetActive = () => {
    setLoadingBtn(true);
    faqService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
      });
  };

  const rowSelection = {
    id,
    onChange: (key) => setId(key),
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.faq'));
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

  const fetchFaqsLocal = () => {
    dispatch(fetchFaqs(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchFaqsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchFaqsLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchFaqsLocal();
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
          {t('faqs')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.faq')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        className='w-100 justify-content-end align-items-center'
        style={{ rowGap: '6px', columnGap: '6px' }}
      >
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
        dataSource={faqs}
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
        click={isDelete ? faqDelete : faqSetActive}
        text={
          !isDelete
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : t('confirm.delete.selection')
        }
        loading={loadingBtn}
        setText={setId}
      />
    </Card>
  );
}
