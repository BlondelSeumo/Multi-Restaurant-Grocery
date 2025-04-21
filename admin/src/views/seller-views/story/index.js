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
import storiesService from 'services/seller/storeis';
import { fetchStoreis } from 'redux/slices/storeis';
import FilterColumns from 'components/filter-column';
import useDemo from 'helpers/useDemo';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import useDidUpdate from 'helpers/useDidUpdate';
import RiveResult from 'components/rive-result';
import OutlinedButton from 'components/outlined-button';
import Card from 'components/card';

const Stories = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isDemo } = useDemo();
  const { setIsModalVisible } = useContext(Context);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { storeis, meta, loading } = useSelector(
    (state) => state.storeis,
    shallowEqual,
  );

  const initialFilterValues = {
    page: 1,
    perPage: 10,
    shop_id: shop?.id,
  };

  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('image'),
      dataIndex: 'file_urls',
      key: 'file_urls',
      is_show: true,
      render: (img, row) => <ColumnImage image={img} id={row?.id} />,
    },
    {
      title: t('product'),
      dataIndex: 'product',
      key: 'product',
      is_show: true,
      render: (product) => product?.translation?.title,
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
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const params = {
    ...filters,
    shop_id: shop?.id,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToEdit = (id) => {
    if (isDemo) {
      toast.warning(t('cannot.work.demo'));
      return;
    }
    dispatch(
      addMenu({
        url: `seller/story/${id}`,
        id: 'story_edit',
        name: t('edit.story'),
      }),
    );
    navigate(`/seller/story/${id}`);
  };

  const goToAdd = () => {
    if (isDemo) {
      toast.warning(t('cannot.work.demo'));
      return;
    }
    dispatch(
      addMenu({
        id: 'add.story',
        url: `seller/story/add`,
        name: t('add.story'),
      }),
    );
    navigate(`/seller/story/add`);
  };

  const bannerDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    storiesService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({ perPage, page });
  };

  const rowSelection = {
    id,
    onChange: (newSelectedRowKeys) => setId(newSelectedRowKeys),
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.story'));
    } else {
      setIsModalVisible(true);
    }
  };

  const fetchSellerStoriesLocal = () => {
    if (shop?.id) {
      dispatch(fetchStoreis(params));
      dispatch(disableRefetch(activeMenu));
    }
  };

  useEffect(() => {
    fetchSellerStoriesLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    fetchSellerStoriesLocal();
  }, [filters, shop?.id]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchSellerStoriesLocal();
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
          {t('stories')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.story')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        wrap
        className='w-100 justify-content-end align-items-center'
        style={{ rowGap: '6px', columnGap: '6px', marginBottom: '20px' }}
      >
        <OutlinedButton onClick={allDelete} color='red'>
          {t('delete.selection')}
        </OutlinedButton>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Table
        locale={{
          emptyText: <RiveResult />,
        }}
        scroll={{ x: true }}
        rowSelection={rowSelection}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={storeis}
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
        click={bannerDelete}
        text={t('confirm.delete.selection')}
        setText={setId}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default Stories;
