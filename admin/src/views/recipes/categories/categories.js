import Card from 'components/card';
import {
  Button,
  Col,
  Divider,
  Space,
  Switch,
  Table,
  Tabs,
  Typography,
} from 'antd';
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
import { CgExport, CgImport } from 'react-icons/cg';
import OutlinedButton from 'components/outlined-button';
import categoryService from 'services/category';
import { export_url } from 'configs/app-global';
import FilterColumns from 'components/filter-column';
import RiveResult from 'components/rive-result';
import { fetchRecipeCategories } from 'redux/slices/recipe-category';
import { Context } from 'context/context';
import useDidUpdate from 'helpers/useDidUpdate';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
};

const roles = ['published', 'deleted_at'];

const RecipesCategories = () => {
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, categories, meta } = useSelector(
    (state) => state.recipeCategory,
    shallowEqual,
  );
  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [restore, setRestore] = useState(false);
  const [active, setActive] = useState(false);
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
      title: t('active'),
      dataIndex: 'active',
      is_show: true,
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row?.uuid);
              setActive(true);
            }}
            disabled={!!row?.deleted_at}
            checked={active}
          />
        );
      },
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
              setIsModalVisible(true);
              setRestore(false);
              setActive(false);
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
    type: 'receipt',
  };

  const goToAdd = () => {
    const url = 'recipes/categories/add';
    dispatch(
      addMenu({
        url,
        id: 'recipe_categories_add',
        name: t('add.recipe.category'),
        type: 'single',
        parentId: 'recipes',
      }),
    );
    navigate(`/${url}`);
  };

  const goToEdit = (uuid) => {
    const url = `recipes/categories/edit/${uuid}`;
    dispatch(
      addMenu({
        url,
        id: 'recipe_categories_edit',
        name: t('edit.recipe.category'),
        type: 'single',
        parentId: 'recipes',
      }),
    );
    navigate(`/${url}`);
  };

  const goToClone = (uuid) => {
    const url = `recipes/categories/clone/${uuid}`;
    dispatch(
      addMenu({
        url,
        id: 'recipe_categories_clone',
        name: t('clone.recipe.category'),
        type: 'single',
        parentId: 'recipes',
      }),
    );
    navigate(`/${url}`);
  };

  const goToImport = () => {
    const url = 'recipes/categories/import';
    dispatch(
      addMenu({
        url,
        id: 'recipe_categories_import',
        name: t('import.recipe.categories'),
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
      toast.warning(t('select.the.category'));
    } else {
      setIsModalVisible(true);
    }
  };

  const exportExcel = () => {
    setIsExportingExcel(true);
    categoryService
      .export(params)
      .then((res) => {
        if (res?.data?.file_name) {
          window.location.href = export_url + res?.data?.file_name;
        }
      })
      .finally(() => setIsExportingExcel(false));
  };

  const categoryDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    categoryService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setActive(false);
        setRestore(false);
      });
  };

  const categoryChangeActive = () => {
    setLoadingBtn(true);
    categoryService
      .setActive(id)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setActive(false);
        setRestore(false);
      });
  };

  const categoryRestoreAll = () => {
    setLoadingBtn(true);
    categoryService
      .restoreAll()
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.restored'));
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setActive(false);
        setRestore(false);
      });
  };

  const fetchRecipeCategoriesLocal = () => {
    dispatch(fetchRecipeCategories(params));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchRecipeCategoriesLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchRecipeCategoriesLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchRecipeCategoriesLocal();
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
            {t('recipe.categories')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdd}
            style={{ width: '100%' }}
          >
            {t('add.category')}
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
          <OutlinedButton loading={isExportingExcel} onClick={exportExcel}>
            <CgExport />
            {t('export')}
          </OutlinedButton>
          <OutlinedButton color='green' onClick={goToImport}>
            <CgImport />
            {t('import')}
          </OutlinedButton>
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
          dataSource={categories}
          pagination={{
            pageSize: meta?.per_page || 10,
            page: meta?.current_page || 1,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          onChange={onChangePagination}
          rowKey={(record) => record.id}
        />
      </Card>

      <CustomModal
        loading={loadingBtn}
        text={
          active
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : restore
              ? t('confirm.restoring')
              : t('confirm.delete.selection')
        }
        click={
          active
            ? categoryChangeActive
            : restore
              ? categoryRestoreAll
              : categoryDelete
        }
        onCancel={() => {
          setIsModalVisible(false);
          setId(null);
          setActive(false);
          setRestore(false);
        }}
      />
    </>
  );
};

export default RecipesCategories;
