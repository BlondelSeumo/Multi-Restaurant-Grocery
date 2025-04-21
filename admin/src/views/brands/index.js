import { useContext, useEffect, useState } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Col, Divider, Space, Table, Tabs, Typography } from 'antd';
import { toast } from 'react-toastify';
import { export_url } from 'configs/app-global';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import brandService from 'services/brand';
import { fetchBrands } from 'redux/slices/brand';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import ResultModal from 'components/result-modal';
import { CgExport, CgImport } from 'react-icons/cg';
import ColumnImage from 'components/column-image';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';

const { TabPane } = Tabs;

const roles = ['published', 'deleted_at'];
const initialFilterValues = {
  page: 1,
  perPage: 10,
  status: 'published',
  search: '',
};

const Brands = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { brands, meta, loading } = useSelector(
    (state) => state.brand,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [downloading, setDownloading] = useState(false);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [restore, setRestore] = useState(null);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
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
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active) => (
        <span style={{ color: active ? 'var(--green)' : 'var(--red)' }}>
          {t(active ? 'active' : 'inactive')}
        </span>
      ),
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
              setId([id]);
              setIsModalVisible(true);
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
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    status: filters?.status !== 'deleted_at' ? filters?.status : undefined,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToClone = (id) => {
    dispatch(
      addMenu({
        id: `brand-clone`,
        url: `brand-clone/${id}`,
        name: t('brand.clone'),
      }),
    );
    navigate(`/brand-clone/${id}`, { state: 'clone' });
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `brand/${id}`,
        id: 'brand_edit',
        name: t('edit.brand'),
      }),
    );
    navigate(`/brand/${id}`, { state: 'edit' });
  };

  const goToAddBrand = () => {
    dispatch(
      addMenu({
        id: 'brand/add',
        url: 'brand/add',
        name: t('add.brand'),
      }),
    );
    navigate('/brand/add');
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        url: `catalog/brands/import`,
        id: 'brand_import',
        name: t('import.brand'),
      }),
    );
    navigate(`/catalog/brands/import`);
  };

  const brandDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    brandService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setLoadingBtn(false);
        setId(null);
        setIsModalVisible(false);
      });
  };

  const excelExport = () => {
    setDownloading(true);
    brandService
      .export(paramsData)
      .then((res) => {
        if (res.data.file_name) {
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
      toast.warning(t('select.the.brand'));
    } else {
      setIsModalVisible(true);
    }
  };

  const brandRestoreAll = () => {
    setLoadingBtn(true);
    brandService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchBrands());
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({
      perPage,
      page: +perPage === +filters?.perPage ? page : 1,
    });
  };

  const fetchBrandsLocal = () => {
    dispatch(fetchBrands(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchBrandsLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    fetchBrandsLocal();
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchBrandsLocal();
    }
  }, [activeMenu.refetch]);

  return (
    <>
      <Card>
        <Space className='justify-content-between align-items-center w-100'>
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
            {t('brands')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAddBrand}
            style={{ width: '100%' }}
          >
            {t('add.brand')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <Space
          wrap
          className='w-100 align-items-center justify-content-end gap-10'
        >
          <Col style={{ minWidth: '253px' }}>
            <SearchInput
              placeholder={t('search.by.title')}
              handleChange={(e) => {
                handleFilter('search', e);
              }}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
              disabled={filters?.status === 'deleted_at'}
            />
          </Col>
          <OutlinedButton
            loading={downloading}
            onClick={excelExport}
            disabled={filters?.status === 'deleted_at'}
          >
            <CgExport />
            {t('export')}
          </OutlinedButton>
          <OutlinedButton
            color='green'
            onClick={goToImport}
            disabled={filters?.status === 'deleted_at'}
          >
            <CgImport />
            {t('import')}
          </OutlinedButton>
        </Space>
        <Divider color='var(--divider)' />
        <Space className='justify-content-between align-items-start w-100'>
          <Tabs
            activeKey={filters?.status}
            onChange={(key) => {
              handleFilter('status', key);
            }}
            type='card'
          >
            {roles.map((item) => (
              <TabPane tab={t(item)} key={item} />
            ))}
          </Tabs>
          <Space>
            {filters?.status === 'published' ? (
              <OutlinedButton onClick={allDelete} color='red'>
                {t('delete.selection')}
              </OutlinedButton>
            ) : (
              <OutlinedButton
                color='green'
                onClick={(e) => {
                  e.stopPropagation();
                  setRestore({ restore: true });
                }}
              >
                {t('restore.all')}
              </OutlinedButton>
            )}
            <FilterColumns columns={columns} setColumns={setColumns} />
          </Space>
        </Space>
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((items) => items.is_show)}
          dataSource={brands}
          loading={loading}
          pagination={{
            pageSize: meta?.per_page || 10,
            page: meta?.current_page || 1,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          rowKey={(record) => record?.id}
          onChange={onChangePagination}
        />
      </Card>
      <CustomModal
        click={brandDelete}
        text={t('confirm.delete.selection')}
        setText={setId}
        loading={loadingBtn}
      />

      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={brandRestoreAll}
          text={t('restore.modal.text')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </>
  );
};

export default Brands;
