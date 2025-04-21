import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Space, Switch, Typography, Divider, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from 'redux/slices/menu';
import unitService from 'services/unit';
import { fetchUnits } from 'redux/slices/unit';
import { useTranslation } from 'react-i18next';
import useDidUpdate from 'helpers/useDidUpdate';
import Card from 'components/card';
import SearchInput from 'components/search-input';
import OutlinedButton from 'components/outlined-button';
import FilterColumns from 'components/filter-column';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';

export default function Units() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uuid, setUUID] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { setIsModalVisible } = useContext(Context);
  const [active, setActive] = useState(null);

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        id: 'unit-edit',
        url: `unit/${id}`,
        name: t('edit.unit'),
      }),
    );
    navigate(`/unit/${id}`);
  };

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
      render: (translation) => translation?.title,
    },
    {
      title: t('position'),
      dataIndex: 'position',
      is_show: true,
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
              setUUID([row.id]);
              setActive(true);
            }}
            checked={active}
          />
        );
      },
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
              setUUID([id]);
              setIsModalVisible(true);
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

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { units, meta, loading, params } = useSelector(
    (state) => state.unit,
    shallowEqual,
  );

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const unitDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...uuid.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    unitService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
        setActive(false);
        dispatch(fetchUnits());
      })
      .finally(() => {
        setLoadingBtn(false);
        setUUID(null);
      });
  };

  function formatSortType(type) {
    switch (type) {
      case 'ascend':
        return 'asc';

      case 'descend':
        return 'desc';

      default:
        break;
    }
  }

  const handleActive = () => {
    setLoadingBtn(true);
    const data = uuid.find((item) => item);

    unitService
      .setActive(data)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchUnits());
        setUUID([]);
        setActive(false);
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  function onChange(pagination, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(fetchUnits({ ...params, perPage, page, column, sort }));
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchUnits({}));
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  const goToAddUnit = () => {
    dispatch(
      addMenu({
        id: 'unit-add',
        url: 'unit/add',
        name: t('add.unit'),
      }),
    );
    navigate('/unit/add');
  };

  const rowSelection = {
    selectedRowKeys: uuid,
    onChange: (key) => {
      setUUID(key);
    },
  };

  const allDelete = () => {
    if (uuid === null || uuid.length === 0) {
      toast.warning(t('select.the.unit'));
    } else {
      setIsModalVisible(true);
    }
  };

  const handleFilter = (type, value) => {
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...activeMenu.data, [type]: value },
      }),
    );
  };

  useDidUpdate(() => {
    const data = activeMenu.data;
    const paramsData = {
      search: data?.search,
    };
    dispatch(fetchUnits(paramsData));
  }, [activeMenu.data]);

  return (
    <Card>
      <Space className='justify-content-between align-items-center w-100'>
        <Typography.Title
          level={1}
          style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 500 }}
        >
          {t('units')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAddUnit}
          style={{ width: '100%' }}
        >
          {t('add.unit')}
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
            className='w-100'
            handleChange={(search) => handleFilter('search', search)}
            defaultValue={activeMenu.data?.search}
            resetSearch={!activeMenu.data?.search}
          />
        </Col>
        <OutlinedButton color='red' onClick={allDelete}>
          {t('delete.selection')}
        </OutlinedButton>
        <FilterColumns columns={columns} setColumns={setColumns} />
      </Space>
      <Divider color='var(--divider)' />
      <Table
        scroll={{ x: true }}
        rowSelection={rowSelection}
        loading={loading}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={units}
        pagination={{
          pageSize: meta?.per_page || 10,
          page: meta?.current_page || 1,
          total: meta?.total || 0,
          current: meta?.current_page || 1,
        }}
        onChange={onChange}
        rowKey={(record) => record.id}
      />
      <CustomModal
        click={active ? handleActive : unitDelete}
        text={
          active
            ? t('are.you.sure.you.want.to.change.the.activity?')
            : t('confirm.delete.selection')
        }
        loading={loadingBtn}
        setText={setUUID}
        setActive={setActive}
      />
    </Card>
  );
}
