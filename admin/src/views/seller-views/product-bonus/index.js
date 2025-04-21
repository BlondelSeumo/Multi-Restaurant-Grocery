import { useContext, useEffect, useState } from 'react';
import { Button, Divider, Space, Switch, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import bonusService from 'services/seller/bonus';
import { fetchBonus } from 'redux/slices/product-bonus';
import moment from 'moment';
import FilterColumns from 'components/filter-column';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import useDidUpdate from 'helpers/useDidUpdate';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';
import getFullDateTime from 'helpers/getFullDateTime';

const initialFilterValues = {
  page: 1,
  perPage: 10,
};

const ProductBonus = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { bonus, meta, loading } = useSelector(
    (state) => state.bonus,
    shallowEqual,
  );

  const [id, setId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [type, setType] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [filters, setFilters] = useState(initialFilterValues);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('order.amount'),
      dataIndex: 'value',
      key: 'value',
      is_show: true,
    },
    {
      title: t('bonus.product'),
      dataIndex: 'bonusStock',
      key: 'bonusStock',
      is_show: true,
      render: (bonusStock) =>
        bonusStock?.product?.translation.title || t('N/A'),
    },
    {
      title: t('active'),
      dataIndex: 'status',
      key: 'status',
      is_show: true,
      render: (status, row) => {
        return (
          <Switch
            key={row.id + status}
            onChange={() => {
              setIsModalVisible(true);
              setActiveId(row.id);
              setType(true);
            }}
            checked={status}
          />
        );
      },
    },
    {
      title: t('expired.at'),
      dataIndex: 'expired_at',
      key: 'expired_at',
      is_show: true,
      render: (date) => (
        <div className={tableRowClasses.status}>
          <span
            className={`${moment(new Date()).isBefore(date) ? tableRowClasses.published : tableRowClasses.unpublished}`}
          >
            {getFullDateTime(date, false)}
          </span>
        </div>
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
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setIsModalVisible(true);
              setId([id]);
              setType(false);
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
    page: filters?.page || 1,
    perPage: filters?.perPage || 10,
  };

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add.bonus',
        url: `seller/product-bonus/add`,
        name: t('add.bonus'),
      }),
    );
    navigate(`/seller/product-bonus/add`);
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `seller/product-bonus/${id}`,
        id: 'bonus_edit',
        name: t('edit.bonus'),
      }),
    );
    navigate(`/seller/product-bonus/${id}`);
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
    bonusService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setId(null);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    bonusService
      .setActive(activeId)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.updated'));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
      });
  };

  const rowSelection = {
    id,
    onChange: (key) => setId(key),
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.bonus'));
    } else {
      setIsModalVisible(true);
    }
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({ perPage, page });
  };

  const fetchBonusLocal = () => {
    dispatch(fetchBonus(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchBonusLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    fetchBonusLocal();
  }, [filters]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchBonusLocal();
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
          {t('product.bonus')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.product.bonus')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space
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
        dataSource={bonus}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChangePagination}
        rowKey={(record) => record?.id}
      />
      <CustomModal
        click={type ? handleActive : bannerDelete}
        text={
          type
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : t('confirm.delete.selection')
        }
        setText={setId}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default ProductBonus;
