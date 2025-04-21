import { useContext, useEffect, useState } from 'react';
import { Button, Card, Divider, Space, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import pagesService from 'services/pages';
import { fetchPages } from 'redux/slices/pages';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import RiveResult from 'components/rive-result';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import useDidUpdate from 'helpers/useDidUpdate';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

const Page = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { pages, meta, loading } = useSelector(
    (state) => state.pages,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img, row) => <ColumnImage image={img} key={row?.id} />,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      is_show: true,
      render: (type) => type.toUpperCase(),
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
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setIsModalVisible(true);
              setId([row?.type]);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  const paramsData = {
    page: filters?.page || 1,
    perPage: filters?.perPage || 10,
  };

  const goToAddBanners = () => {
    dispatch(
      addMenu({
        id: 'page_add',
        url: 'page/add',
        name: t('add.page'),
      }),
    );
    navigate('/page/add');
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        id: 'page_edit',
        url: `page/${id}`,
        name: t('edit.page'),
      }),
    );
    navigate(`/page/${id}`);
  };

  const pageDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    pagesService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
      });
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

  const fetchPagesLocal = () => {
    dispatch(fetchPages(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchPagesLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchPagesLocal();
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
          {t('custom.pages')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAddBanners}
          style={{ width: '100%' }}
        >
          {t('add.custom.page')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={pages}
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
        click={pageDelete}
        text={t('confirm.delete.selection')}
        loading={loadingBtn}
        setText={setId}
      />
    </Card>
  );
};

export default Page;
