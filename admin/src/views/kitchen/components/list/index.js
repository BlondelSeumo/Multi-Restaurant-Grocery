import { Switch, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useQueryParams } from 'helpers/useQueryParams';
import { fetchKitchens } from 'redux/slices/kitchen';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch } from 'redux/slices/menu';
import { useContext, useEffect } from 'react';
import useDidUpdate from 'helpers/useDidUpdate';
import RiveResult from 'components/rive-result';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';

const KitchenList = ({ id = null, setId = (a) => {} }) => {
  const { t } = useTranslation();
  const queryParams = useQueryParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { kitchens, loading, meta, initialParams } = useSelector(
    (state) => state.kitchen,
    shallowEqual,
  );
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);

  const params = {
    ...initialParams,
    search: queryParams.get('search') || undefined,
    shop_id: myShop?.id,
  };

  const columns = [
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
      title: t('active'),
      dataIndex: 'active',
      is_show: true,
      render: (active) => <Switch checked={!!active} />,
    },
    {
      title: t('options'),
      dataIndex: 'id',
      key: 'options',
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
              handleDelete(id);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetch(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetch(params);
    }
  }, [activeMenu.refetch]);

  const fetch = (params = {}) => {
    batch(() => {
      dispatch(fetchKitchens(params));
      dispatch(disableRefetch(activeMenu));
    });
  };

  const handleDelete = (selectedShopId) => {
    if (!selectedShopId) {
      toast.warning(t('no.id'));
    } else {
      setId([selectedShopId]);
      setIsModalVisible(true);
    }
  };

  const onChangePagination = (pagination) => {
    const { pageSize, current } = pagination;

    const paramsData = {
      ...params,
      perPage: pageSize,
      page: current,
    };

    fetch(paramsData);
  };

  const goToEdit = (id) => {
    const url = `kitchen/edit/${id}`;
    dispatch(
      addMenu({
        id: 'admin-edit-kitchen',
        url,
        name: t('edit.place'),
      }),
    );
    navigate(`/${url}`);
  };

  return (
    <Table
      locale={{
        emptyText: <RiveResult />,
      }}
      columns={columns.filter((column) => column.is_show)}
      scroll={{ x: true }}
      loading={loading}
      rowKey={(record) => record?.id}
      pagination={{
        defaultCurrent: 1,
        current: meta?.current_page || 1,
        pageSize: meta?.per_page || 10,
        total: meta?.total || 0,
      }}
      dataSource={kitchens}
      rowSelection={{
        selectedRowKeys: id,
        onChange: (selectedRowKeys) => setId(selectedRowKeys),
      }}
      onChange={onChangePagination}
    />
  );
};

export default KitchenList;
