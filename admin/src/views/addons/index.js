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
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url } from 'configs/app-global';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenuData,
  setRefetch,
} from 'redux/slices/menu';
import productService from 'services/product';
import useDidUpdate from 'helpers/useDidUpdate';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';
import ProductStatusModal from './productStatusModal';
import FilterColumns from 'components/filter-column';
import { fetchAddons } from 'redux/slices/addons';
import RiveResult from 'components/rive-result';
import ResultModal from 'components/result-modal';
import { CgExport, CgImport } from 'react-icons/cg';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';

const { TabPane } = Tabs;

const initialFilterValues = {
  search: '',
  status: 'all',
  page: 1,
  perPage: 10,
};
const roles = ['all', 'published', 'pending', 'unpublished', 'deleted_at'];

const AddonsCategories = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { addonsList, meta, loading } = useSelector(
    (state) => state.addons,
    shallowEqual,
  );
  const { setIsModalVisible } = useContext(Context);

  const [filters, setFilters] = useState(initialFilterValues);
  const [productDetails, setProductDetails] = useState(null);
  const [id, setId] = useState(null);
  const [active, setActive] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [text, setText] = useState(null);
  const [restore, setRestore] = useState(null);

  const initialColumns = [
    {
      title: t('id'),
      key: 'id',
      dataIndex: 'id',
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
      key: 'translations',
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
      key: 'active',
      is_show: true,
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.uuid);
              setActive(true);
            }}
            disabled={row.deleted_at}
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
              setId([row.id]);
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
    perPage: filters?.perPage,
    page: filters?.page,
    search: filters?.search || undefined,
    deleted_at: filters?.status === 'deleted_at' ? filters?.status : undefined,
    status:
      filters?.status !== 'all' && filters?.status !== 'deleted_at'
        ? filters?.status
        : undefined,
  };

  const clearData = () => {
    dispatch(
      setMenuData({
        activeMenu,
        data: null,
      }),
    );
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'addon-import',
        url: `catalog/addon/import`,
        name: t('addon.import'),
      }),
    );
    navigate(`/catalog/addon/import`);
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
      })
      .finally(() => {
        setLoadingBtn(false);
        setId(null);
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
      .export({
        ...paramsData,
        addon: 1,
      })
      .then((res) => {
        if (res.data.data.file_name) {
          window.location.href = export_url + res.data.data.file_name;
        }
      })
      .finally(() => setDownloading(false));
  };

  const goToEdit = (uuid) => {
    dispatch(
      addMenu({
        id: `addon-edit`,
        url: `addon/${uuid}`,
        name: t('edit.addon'),
      }),
    );
    clearData();
    navigate(`/addon/${uuid}`);
  };

  const goToClone = (uuid) => {
    dispatch(
      addMenu({
        id: `addon-clone`,
        url: `addon-clone/${uuid}`,
        name: t('clone.addon'),
      }),
    );
    clearData();
    navigate(`/addon-clone/${uuid}`);
  };

  const goToAddAddon = () => {
    dispatch(
      addMenu({
        id: 'addon-add',
        url: `addon/add`,
        name: t('add.addon'),
      }),
    );
    clearData();
    navigate(`/addon/add`);
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

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.addon'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  useEffect(() => {
    dispatch(fetchAddons(paramsData));
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    dispatch(fetchAddons(paramsData));
    dispatch(disableRefetch(activeMenu));
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      dispatch(fetchAddons(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
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
            {t('addons')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAddAddon}
            style={{ width: '100%' }}
          >
            {t('add.addon')}
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
          <Col>
            <OutlinedButton loading={downloading} onClick={excelExport}>
              <CgExport />
              {t('export')}
            </OutlinedButton>
          </Col>
          <Col>
            <OutlinedButton color='green' onClick={goToImport}>
              <CgImport />
              {t('import')}
            </OutlinedButton>
          </Col>
        </Space>
        <Divider color='var(--divider)' />
        <Space className='w-100 justify-content-between align-items-start'>
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
            emptyText: <RiveResult id='nosell' />,
          }}
          scroll={{ x: true }}
          rowSelection={rowSelection}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={addonsList}
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

export default AddonsCategories;
