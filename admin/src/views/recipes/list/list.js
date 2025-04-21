import Card from 'components/card';
import { Button, Col, Divider, Space, Table, Tabs, Typography } from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import SearchInput from 'components/search-input';
import OutlinedButton from 'components/outlined-button';
import FilterColumns from 'components/filter-column';
import RiveResult from 'components/rive-result';
import { Context } from 'context/context';
import useDidUpdate from 'helpers/useDidUpdate';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { fetchRecepts } from 'redux/slices/reciept';
import numberToPrice from 'helpers/numberToPrice';
import receiptService from 'services/reciept';

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
};

const roles = ['published', 'deleted_at'];

const RecipesList = () => {
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, recepts, meta } = useSelector(
    (state) => state.reciept,
    shallowEqual,
  );
  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [restore, setRestore] = useState(false);
  const initialColumns = [
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
      render: (img, row) => <ColumnImage image={img} id={row?.id} />,
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
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
      is_show: true,
      render: (category) => category?.translation?.title || t('N/A'),
    },
    {
      title: t('discount'),
      dataIndex: 'discount_price',
      key: 'discount_price',
      is_show: true,
      render: (discountPrice, row) => {
        if (row?.discount_type === 'percent') {
          return `${discountPrice}%`;
        }
        return numberToPrice(discountPrice);
      },
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
            className={`${tableRowClasses.option} ${tableRowClasses.clone}`}
            disabled={!!row?.deleted_at}
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
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setId([row?.id]);
              setIsModalVisible(true);
              setRestore(false);
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

  const params = {
    search: filters?.search || undefined,
    // status: filters?.status !== 'deleted_at' ? filters?.status : undefined,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
  };

  const goToAdd = () => {
    const url = 'recipes/list/add';
    dispatch(
      addMenu({
        url,
        id: 'recipe_list_add',
        name: t('add.recipe'),
        type: 'single',
        parentId: 'recipes',
      }),
    );
    navigate(`/${url}`);
  };

  const goToEdit = (id) => {
    const url = `recipes/list/edit/${id}`;
    dispatch(
      addMenu({
        url,
        id: 'recipe_list_edit',
        name: t('edit.recipe'),
        type: 'single',
        parentId: 'recipes',
      }),
    );
    navigate(`/${url}`);
  };

  const goToClone = (id) => {
    const url = `recipes/list/clone/${id}`;
    dispatch(
      addMenu({
        url,
        id: 'recipe_list_clone',
        name: t('clone.recipe'),
        type: 'single',
        parentId: 'recipes',
      }),
    );
    navigate(`/${url}`);
  };

  const handleFilter = (type, value) => {
    setId(null);
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({ perPage, page });
  };

  const deleteSelection = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.recipe'));
    } else {
      setIsModalVisible(true);
    }
  };

  const recipeDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    receiptService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setRestore(false);
      });
  };

  const recipeRestoreAll = () => {
    setLoadingBtn(true);
    receiptService
      .restoreAll()
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.restored'));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setRestore(false);
        setId(null);
      });
  };

  const fetchRecipesListLocal = () => {
    dispatch(fetchRecepts(params));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchRecipesListLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchRecipesListLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchRecipesListLocal();
  }, [filters]);

  return (
    <>
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
            {t('recipes')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdd}
            style={{ width: '100%' }}
          >
            {t('add.recipe')}
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
          <Space className='gap-10'>
            {filters?.status !== 'deleted_at' ? (
              <OutlinedButton onClick={deleteSelection} color='red'>
                {t('delete.selection')}
              </OutlinedButton>
            ) : (
              <OutlinedButton
                color='green'
                onClick={() => {
                  setRestore(true);
                  setIsModalVisible(true);
                }}
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
          rowSelection={{
            selectedRowKeys: id,
            onChange: (key) => setId(key),
          }}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={recepts}
          pagination={{
            pageSize: +meta?.per_page || 10,
            page: +meta?.current_page || 1,
            total: +meta?.total || 0,
            current: +meta?.current_page || 1,
          }}
          onChange={onChangePagination}
          rowKey={(record) => record.id}
        />
      </Card>

      <CustomModal
        loading={loadingBtn}
        text={restore ? t('confirm.restoring') : t('confirm.delete.selection')}
        click={restore ? recipeRestoreAll : recipeDelete}
        onCancel={() => {
          setIsModalVisible(false);
          setId(null);
          setRestore(false);
        }}
      />
    </>
  );
};

export default RecipesList;
