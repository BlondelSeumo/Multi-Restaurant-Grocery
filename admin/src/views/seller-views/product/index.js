import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Space, Switch, Typography, Divider } from 'antd';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import productService from 'services/seller/product';
import { fetchSellerProducts } from 'redux/slices/product';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import { CgExport, CgImport } from 'react-icons/cg';
import RiveResult from 'components/rive-result';
import { useNavigate } from 'react-router-dom';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import ProductFilters from 'components/product-filters/product-filters';
import FilterColumns from 'components/filter-column';
import CreateFood from './createFood';
import UpdateFood from './update-food';

const initialFilterValues = {
  search: '',
  status: 'all',
  page: 1,
  perPage: 10,
};

const SellerProduct = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { products, meta, loading } = useSelector(
    (state) => state.product,
    shallowEqual,
  );
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);

  const [update, setUpdate] = useState(null);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState(null);
  const [active, setActive] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);
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
      render: (status, row) => (
        <button
          type='button'
          className={tableRowClasses.status}
          disabled={!!row?.deleted_at}
        >
          <span className={tableRowClasses[status || 'pending']}>
            {t(status)}
          </span>
        </button>
      ),
    },
    {
      title: t('options'),
      dataIndex: 'uuid',
      key: 'options',
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

  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
    shop_id: myShop?.id,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        id: 'product-edit',
        url: `seller/product/${uuid}`,
        name: t('edit.product'),
      }),
    );
    navigate(`/seller/product/${uuid}`);
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'seller-product-import',
        url: `seller/product/import`,
        name: t('product.import'),
      }),
    );
    navigate(`/seller/product/import`);
  };

  const rowSelection = {
    selectedRowKeys: id?.product_id || [],
    onChange: (selectedRowKeys, row) => {
      setId({
        ...id,
        product_id: selectedRowKeys,
        parent_id: row.map((row) => row.parent_id),
      });
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

  const handleCancel = () => {
    setUpdate(null);
    setIsModalOpen(false);
  };

  const productDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.product_id?.map((item, index) => ({
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
        setId(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const excelExport = () => {
    setDownloading(true);
    productService
      .export(paramsData)
      .then((res) => {
        if (res?.data?.file_name) {
          window.location.href = res?.data?.file_name;
        }
      })
      .finally(() => setDownloading(false));
  };

  const handleActive = () => {
    setLoadingBtn(true);
    productService
      .setActive(id)
      .then(() => {
        setIsModalVisible(false);
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.updated'));
        setActive(true);
      })
      .finally(() => setLoadingBtn(false));
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
    handleUpdateFilter({ perPage, page });
  };

  const fetchSellerProductsLocale = () => {
    dispatch(fetchSellerProducts(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useDidUpdate(() => {
    fetchSellerProductsLocale();
  }, [filters]);

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchSellerProductsLocale();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

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
            onClick={() => setIsModalOpen(true)}
            style={{ width: '100%' }}
          >
            {t('add.product')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <ProductFilters
          defaultValues={paramsData}
          role='seller'
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
            <OutlinedButton
              onClick={allDelete}
              color='red'
              key='delete_selection'
            >
              {t('delete.selection')}
            </OutlinedButton>,
            <FilterColumns
              columns={columns}
              setColumns={setColumns}
              key='filter_columns'
            />,
          ]}
        />
        <Divider color='var(--divider)' />
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
      <CustomModal
        click={active ? handleActive : productDelete}
        loading={loadingBtn}
        text={
          active
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : text
              ? t('confirm.delete.selection')
              : t('confirm.delete.selection')
        }
        setText={setId}
        setActive={setActive}
      />

      {isModalOpen && (
        <CreateFood handleCancel={handleCancel} isModalOpen={isModalOpen} />
      )}
      {update && (
        <UpdateFood
          handleCancel={handleCancel}
          isModalOpen={update}
          id={id}
          setId={setId}
          paramsData={paramsData}
        />
      )}
    </>
  );
};

export default SellerProduct;
