import { useState, useEffect, useContext } from 'react';
import { Button, Space, Table, Typography, Divider, Col } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchExtraValues } from 'redux/slices/extraValue';
import extraService from 'services/extra';
import ExtraValueModal from './extra-value-modal';
import { disableRefetch, setRefetch } from 'redux/slices/menu';
import FilterColumns from 'components/filter-column';
import ResultModal from 'components/result-modal';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import useDidUpdate from 'helpers/useDidUpdate';
import RiveResult from 'components/rive-result';
import SearchInput from 'components/search-input';
import OutlinedButton from 'components/outlined-button';
import { Context } from 'context/context';
import CustomModal from 'components/modal';

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
};

export default function ExtraValue() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { extraValues, loading, meta } = useSelector(
    (state) => state.extraValue,
    shallowEqual,
  );
  const { setIsModalVisible } = useContext(Context);

  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [modal, setModal] = useState(null);
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
      title: t('group'),
      dataIndex: 'group',
      key: 'group',
      is_show: true,
      render: (group) => group?.translation?.title || t('N/A'),
    },
    {
      title: t('value'),
      dataIndex: 'value',
      key: 'value',
      is_show: true,
      render: (value, row) => (
        <Space className='extras'>
          {row?.group?.type === 'color' && (
            <div
              className='extra-color-wrapper-contain'
              style={{ backgroundColor: row.value }}
            />
          )}
          {row?.group?.type === 'image' && (
            <ColumnImage image={row?.value} id={row?.id} />
          )}
          {row?.group?.type !== 'image' && <span>{row?.value}</span>}
        </Space>
      ),
    },
    {
      title: t('actions'),
      dataIndex: 'id',
      key: 'actions',
      is_show: true,
      render: (id, row) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            onClick={(e) => {
              e.stopPropagation();
              setModal(row);
            }}
          >
            <EditOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
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

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const paramsData = {
    search: filters?.search || undefined,
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
  };

  const handleCancel = () => setModal(null);

  const deleteExtra = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    extraService
      .deleteValue(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        setId(null);
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const extraValueDropAll = () => {
    setLoadingBtn(true);
    extraService
      .dropAllValue()
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const extraValueRestoreAll = () => {
    setLoadingBtn(true);
    extraService
      .restoreAllValue()
      .then(() => {
        toast.success(t('successfully.restored'));
        dispatch(setRefetch(activeMenu));
        setRestore(null);
      })
      .finally(() => setLoadingBtn(false));
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.extra.value'));
    } else {
      setIsModalVisible(true);
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

  useEffect(() => {
    dispatch(fetchExtraValues(paramsData));
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    dispatch(fetchExtraValues(paramsData));
    dispatch(disableRefetch(activeMenu));
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      dispatch(fetchExtraValues(paramsData));
      dispatch(disableRefetch(activeMenu));
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
            {t('extra.values')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setModal({})}
            style={{ width: '100%' }}
          >
            {t('add.extra.value')}
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
              placeholder={t('search.by.value')}
              className='w-100'
              handleChange={(value) => handleFilter('search', value)}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
            />
          </Col>
          <OutlinedButton
            color='red'
            onClick={(e) => {
              e.stopPropagation();
              allDelete();
            }}
          >
            {t('delete.selection')}
          </OutlinedButton>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
        <Divider color='var(--divider)' />
        <Table
          locale={{
            emptyText: <RiveResult id='nosell' />,
          }}
          scroll={{ x: true }}
          rowSelection={rowSelection}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={extraValues}
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

      {modal && <ExtraValueModal modal={modal} handleCancel={handleCancel} />}
      <CustomModal
        click={deleteExtra}
        text={t('confirm.delete.selection')}
        loading={loadingBtn}
      />
      {restore && (
        <ResultModal
          open={restore}
          handleCancel={() => setRestore(null)}
          click={restore.restore ? extraValueRestoreAll : extraValueDropAll}
          text={restore.restore ? t('restore.modal.text') : t('read.carefully')}
          subTitle={restore.restore ? '' : t('confirm.deletion')}
          loading={loadingBtn}
          setText={setId}
        />
      )}
    </>
  );
}
