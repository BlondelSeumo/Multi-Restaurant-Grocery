import { useContext, useEffect, useState } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Table, Space, Switch, Tabs, Typography, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url } from 'configs/app-global';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import productService from 'services/product';
import { fetchProducts } from 'redux/slices/product';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import ProductStatusModal from './productStatusModal';
import FilterColumns from 'components/filter-column';
import ResultModal from 'components/result-modal';
import RiveResult from 'components/rive-result';
import ColumnImage from 'components/column-image';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import ProductFilters from 'components/product-filters';
import { CgExport, CgImport } from 'react-icons/cg';

const { TabPane } = Tabs;

const roles = ['all', 'pending', 'published', 'unpublished', 'deleted_at'];
const initialFilterValues = {
  search: '',
  shop: null,
  category: null,
  brand: null,
  status: 'all',
  page: 1,
  perPage: 10,
};

const ProductCategories = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { products, meta, loading } = useSelector(
    (state) => state.product,
    shallowEqual,
  );
  const [productDetails, setProductDetails] = useState(null);
  const [active, setActive] = useState(null);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
      dataIndex: 'translations',
      key: 'translations',
      is_show: true,
      render: (translations) => (
        <div className={tableRowClasses.locales}>
          {translations?.map((item, index) => (
            <div
              key={item?.id}
              className={`${tableRowClasses.locale} ${1 & index ? tableRowClasses.odd : tableRowClasses.even}`}
            >
              {item?.locale}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('branch'),
      dataIndex: 'shop',
      key: 'shop',
      is_show: true,
      render: (shop) => shop?.translation?.title || t('N/A'),
    },
    {
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
      is_show: true,
      render: (category) => category?.translation?.title || t('N/A'),
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
            disabled={row?.deleted_at}
            checked={active}
          />
        );
      },
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => {
        const isCanEdit = !row?.deleted_at;
        return (
          <button
            type='button'
            className={tableRowClasses.status}
            disabled={!isCanEdit}
            onClick={(e) => {
              e.stopPropagation();
              if (isCanEdit) {
                setProductDetails(row);
              }
            }}
          >
            <span className={tableRowClasses[status || 'pending']}>
              {t(status)}
            </span>
            {isCanEdit && <EditOutlined />}
          </button>
        );
      },
    },
    {
      title: t('actions'),
      dataIndex: 'uuid',
      key: 'actions',
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
              setIsModalVisible(true);
              setId([row?.id]);
              setText(true);
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

  const paramsData = {
    search: filters?.search || undefined,
    brand_id: filters?.brand?.value,
    category_id: filters?.category?.value,
    shop_id: filters?.shop?.value,
    deleted_at: filters?.status === 'deleted_at' ? 'deleted_at' : undefined,
    perPage: filters?.perPage,
    page: filters?.page,
    status:
      filters?.status !== 'all' && filters?.status !== 'deleted_at'
        ? filters?.status
        : undefined,
  };

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        id: `product-edit`,
        url: `product/${uuid}`,
        name: t('edit.product'),
      }),
    );
    navigate(`/product/${uuid}`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: `product-clone`,
        url: `product-clone/${uuid}`,
        name: t('clone.product'),
      }),
    );
    navigate(`/product-clone/${uuid}`);
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'product-import',
        url: `catalog/product/import`,
        name: t('product.import'),
      }),
    );
    navigate(`/catalog/product/import`);
  };

  const productDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    productService
      .delete(params)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setText(null);
        setActive(false);
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  const productDropAll = () => {
    setLoadingBtn(true);
    productService
      .dropAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const productRestoreAll = () => {
    setLoadingBtn(true);
    productService
      .restoreAll()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => {
        setLoadingBtn(false);
        setId(null);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    productService
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.updated'));
        setActive(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const excelExport = () => {
    setDownloading(true);
    productService
      .export(paramsData)
      .then((res) => {
        if (res?.data?.file_name) {
          window.location.href = export_url + res?.data?.file_name;
        }
      })
      .finally(() => setDownloading(false));
  };

  const goToAddProduct = () => {
    dispatch(
      addMenu({
        id: 'product-add',
        url: `product/add`,
        name: t('add.product'),
      }),
    );
    navigate(`/product/add`);
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.product'));
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

  const handleClearAllFilters = () => {
    setFilters({ ...initialFilterValues, page: 1 });
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({
      perPage,
      page: +perPage === +filters.perPage ? page : 1,
    });
  };

  useDidUpdate(() => {
    dispatch(fetchProducts(paramsData));
    dispatch(disableRefetch(activeMenu));
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      dispatch(fetchProducts(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useEffect(() => {
    dispatch(fetchProducts(paramsData));
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            {t('products')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAddProduct}
            style={{ width: '100%' }}
          >
            {t('add.product')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <ProductFilters
          defaultValues={filters}
          role='admin'
          onChange={handleFilter}
          onClearAll={handleClearAllFilters}
          extras={[
            <OutlinedButton
              loading={downloading}
              onClick={excelExport}
              key='export'
            >
              <CgExport />
              {t('export')}
            </OutlinedButton>,
            <OutlinedButton color='green' onClick={goToImport} key='import'>
              <CgImport />
              {t('import')}
            </OutlinedButton>,
          ]}
        />
        <Divider color='var(--divider)' />
        <Space className='w-100 justify-content-between align-items-start'>
          <Tabs
            activeKey={filters?.status}
            onChange={(key) => handleFilter('status', key)}
            type='card'
          >
            {roles.map((item) => (
              <TabPane tab={t(item)} key={item} />
            ))}
          </Tabs>
          <Space className='gap-10'>
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
        </Space>
        <Table
          locale={{
            emptyText: <RiveResult />,
          }}
          scroll={{ x: true }}
          rowSelection={rowSelection}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={products}
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

      {productDetails && (
        <ProductStatusModal
          orderDetails={productDetails}
          handleCancel={() => setProductDetails(null)}
          paramsData={paramsData}
        />
      )}
      <CustomModal
        click={active ? handleActive : productDelete}
        text={
          active
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : text
              ? t('confirm.delete.selection')
              : t('confirm.delete.selection')
        }
        loading={loadingBtn}
        setText={setId}
        setActive={setActive}
      />
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? productRestoreAll : productDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
          setActive={setActive}
        />
      )}
    </>
  );
};

export default ProductCategories;
