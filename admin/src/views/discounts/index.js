import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Space, Switch, Table, Typography } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import discountService from 'services/seller/discount';
import { fetchSellerDiscounts } from 'redux/slices/discount';
import useDidUpdate from 'helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import Card from 'components/card';
import numberToPrice from 'helpers/numberToPrice';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';
import getFullDateTime from 'helpers/getFullDateTime';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

export default function Discounts() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { discounts, meta, loading } = useSelector(
    (state) => state.discount,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { setIsModalVisible } = useContext(Context);

  const [id, setId] = useState(null);
  const [active, setActive] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const [filters, setFilters] = useState(initialFilterValues);

  const paramsData = {
    perPage: filters?.perPage || 10,
    page: filters?.page || 1,
  };

  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      is_show: true,
      render: (type) => t(type),
    },
    {
      title: t('amount'),
      dataIndex: 'price',
      key: 'price',
      is_show: true,
      render: (price) => numberToPrice(price),
    },
    {
      title: t('start.date'),
      dataIndex: 'start',
      key: 'start',
      is_show: true,
      render: (date) => getFullDateTime(date, false),
    },
    {
      title: t('end.date'),
      dataIndex: 'end',
      key: 'end',
      is_show: true,
      render: (date) => getFullDateTime(date, false),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active, row) => (
        <Switch
          onChange={() => {
            setIsModalVisible(true);
            setId([row?.id]);
            setActive(true);
          }}
          disabled={!!row?.deleted_at}
          checked={!!active}
        />
      ),
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
              setId([id]);
              setActive(false);
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

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const discountDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    discountService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
      });
  };

  const discountSetActive = () => {
    setLoadingBtn(true);
    discountService
      .setActive(id[0])
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(setRefetch(activeMenu));
        setIsModalVisible(false);
        setActive(true);
      })
      .finally(() => {
        setId(null);
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
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.discount'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add-restaurant',
        url: `discount/add`,
        name: t('add.discount'),
      }),
    );
    navigate(`/discount/add`);
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `discount/${id}`,
        id: 'discount_edit',
        name: t('edit.discount'),
      }),
    );
    navigate(`/discount/${id}`);
  };

  useEffect(() => {
    dispatch(fetchSellerDiscounts({}));
    dispatch(disableRefetch(activeMenu));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerDiscounts({}));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    dispatch(fetchSellerDiscounts(paramsData));
    dispatch(disableRefetch(activeMenu));
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
            {t('discounts')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAdd}
            style={{ width: '100%' }}
          >
            {t('add.discount')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <Space
          wrap
          style={{ rowGap: '6px', columnGap: '6px' }}
          className='w-100 justify-content-end'
        >
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
          dataSource={discounts}
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
        click={active ? discountSetActive : discountDelete}
        text={
          active
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : text
              ? t('confirm.delete.selection')
              : t('confirm.delete.selection')
        }
        setText={setId}
        loading={loadingBtn}
        setActive={setActive}
      />
    </>
  );
}
