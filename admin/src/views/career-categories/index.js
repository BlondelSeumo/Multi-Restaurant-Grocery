import { useContext, useEffect, useState } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
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
import { export_url } from 'configs/app-global';
import { Context } from 'context/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import categoryService from 'services/category';
import { fetchCareerCategories } from 'redux/slices/career-category';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import ResultModal from 'components/result-modal';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import RiveResult from 'components/rive-result';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import { CgExport } from 'react-icons/cg';

const { TabPane } = Tabs;

const roles = ['published', 'deleted_at'];
const initialFilterValues = {
  search: '',
  status: 'published',
  page: 1,
  perPage: 10,
  type: 'career',
};

const CareerCategories = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { setIsModalVisible } = useContext(Context);
  const { careerCategory, meta, loading } = useSelector(
    (state) => state.careerCategory,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [restore, setRestore] = useState(null);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [text, setText] = useState(null);
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
              className={`${tableRowClasses.locale} ${1 & index ? tableRowClasses.odd : tableRowClasses.even}`}
            >
              {item}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img, row) => <ColumnImage image={img} id={row?.id} />,
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active) => <Switch checked={active} />,
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
              setId([row.id]);
              setIsModalVisible(true);
              setText(true);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  const paramsData = {
    search: filters?.search || undefined,
    pageSize: filters?.perPage || 10,
    page: filters?.page || 1,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        url: `career-categories/${uuid}`,
        id: 'career-categories-edit',
        name: t('edit.career.categories'),
      }),
    );
    navigate(`/career-categories/${uuid}`);
  };

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        id: 'career-categories-add',
        url: 'career-categories/add',
        name: t('add.career.categories'),
      }),
    );
    navigate('/career-categories/add');
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: `career-categories-clone`,
        url: `career-categories-clone/${uuid}`,
        name: t('career.categories.clone'),
      }),
    );
    navigate(`/career-categories-clone/${uuid}`);
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
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setText(null);
        setId(null);
      });
  };

  const categoryRestoreAll = () => {
    setLoadingBtn(true);
    categoryService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setRestore(null);
        setIsModalVisible(false);
        setText(null);
        setId(null);
      });
  };

  const excelExport = () => {
    setDownloading(true);
    categoryService
      .export(paramsData)
      .then((res) => {
        if (res?.data?.file_name) {
          window.location.href = export_url + res.data.file_name;
        }
      })
      .finally(() => setDownloading(false));
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.category'));
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

  const fetchCareerCategoriesLocal = () => {
    dispatch(fetchCareerCategories(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchCareerCategoriesLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchCareerCategoriesLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchCareerCategoriesLocal();
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
            {t('career.categories')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAddCategory}
            style={{ width: '100%' }}
          >
            {t('add.career.category')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <Space
          wrap
          className='w-100 justify-content-end align-items-center'
          style={{
            marginBottom: '20px',
            rowGap: '6px',
            columnGap: '6px',
          }}
        >
          <Col style={{ minWidth: '228px' }}>
            <SearchInput
              placeholder={t('search.by.title')}
              className='w-100'
              handleChange={(value) => handleFilter('search', value)}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
            />
          </Col>
          {filters?.status !== 'deleted_at' ? (
            <>
              <OutlinedButton loading={downloading} onClick={excelExport}>
                <CgExport />
                {t('export')}
              </OutlinedButton>
              <OutlinedButton onClick={allDelete} color='red'>
                {t('delete.selection')}
              </OutlinedButton>
            </>
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
          dataSource={careerCategory}
          pagination={{
            pageSize: meta?.per_page || 10,
            page: meta?.current_page || 1,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          onChange={onChangePagination}
          rowKey={(record) => record.id}
          expandable={{
            rowExpandable: (record) => !!record?.children?.length,
            expandedRowRender: (record) => record?.translation?.title,
          }}
        />
      </Card>

      <CustomModal
        click={categoryDelete}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        setText={setId}
        loading={loadingBtn}
      />
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={categoryRestoreAll}
          text={t('restore.modal.text')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </>
  );
};

export default CareerCategories;
