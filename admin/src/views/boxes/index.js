import React, { useContext, useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Image, Space, Table, Tabs } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setMenuData } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import DeleteButton from 'components/delete-button';
import FilterColumns from 'components/filter-column';
import useDidUpdate from 'helpers/useDidUpdate';
import formatSortType from 'helpers/formatSortType';
import numberToPrice from 'helpers/numberToPrice';
import { fetchRecepts } from 'redux/slices/reciept';
import { IMG_URL } from 'configs/app-global';
import receiptService from 'services/reciept';

const roles = ['published', 'deleted_at'];
const { TabPane } = Tabs;

const Boxes = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const immutable = activeMenu.data?.role || 'published';
  const data = activeMenu?.data;
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);

  const paramsData = {
    sort: data?.sort,
    column: data?.column,
    search: data?.search ? data.search : undefined,
    perPage: data?.perPage,
    page: data?.page,
    shop_id: myShop?.id,
    deleted_at: data?.role === 'deleted_at' ? data?.role : null,
  };

  const { recepts, meta, loading } = useSelector(
    (state) => state.reciept,
    shallowEqual,
  );

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `box/edit/${row.id}`,
        id: 'box_edit',
        name: t('edit.box'),
      }),
    );
    navigate(`/box/edit/${row.id}`, { state: 'edit' });
  };

  const goToAdd = () => {
    dispatch(
      addMenu({
        url: 'box/add',
        id: 'box_add',
        name: t('add.box'),
      }),
    );
    navigate('/box/add');
  };

  const [columns, setColumns] = useState([
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
      sorter: true,
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      render: (_, row) => row.translation?.title,
      is_show: true,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img, row) => (
        <Image
          width={100}
          src={!row.deleted_at ? IMG_URL + img : 'https://fakeimg.pl/640x360'}
          preview
          placeholder
          className='rounded'
        />
      ),
    },
    {
      title: t('box.category'),
      dataIndex: 'category',
      key: 'category',
      is_show: true,
      render: (category) => category?.translation?.title,
    },
    {
      title: t('discount'),
      dataIndex: 'discount',
      key: 'discount',
      is_show: true,
      render: (_, row) =>
        row.discount_type === 'fix'
          ? numberToPrice(
              row.discount_price,
              defaultCurrency?.symbol,
              defaultCurrency?.position,
            )
          : `${row.discount_price} %`,
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      is_show: true,
      render: (_, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
              disabled={row.deleted_at}
            />
            <DeleteButton
              disabled={row.deleted_at}
              icon={<DeleteOutlined />}
              onClick={() => {
                setId([row.id]);
                setIsModalVisible(true);
                setText(true);
              }}
            />
          </Space>
        );
      },
    },
  ]);

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
    receiptService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchRecepts(paramsData));
        setIsModalVisible(false);
        setText(null);
        setId(null);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  function onChangePagination(pagination, filter, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, perPage, page, column, sort },
      }),
    );
  }

  useDidUpdate(() => {
    dispatch(fetchRecepts(paramsData));
  }, [activeMenu.data]);

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchRecepts(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.box'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const handleFilter = (items) => {
    const data = activeMenu.data;
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, ...items },
      }),
    );
  };

  return (
    <>
      <Card
        title={t('boxes')}
        extra={
          <Space wrap className='justify-content-end w-100'>
            {immutable !== 'deleted_at' && (
              <>
                <DeleteButton size='' onClick={allDelete}>
                  {t('delete.selected')}
                </DeleteButton>
                <Button
                  type='primary'
                  icon={<PlusCircleOutlined />}
                  onClick={goToAdd}
                >
                  {t('add.box')}
                </Button>
              </>
            )}
            <FilterColumns columns={columns} setColumns={setColumns} />
          </Space>
        }
      >
        <Tabs
          className='mt-3'
          activeKey={immutable}
          onChange={(key) => {
            handleFilter({ role: key, page: 1 });
          }}
          type='card'
        >
          {roles.map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <Table
          scroll={{ x: true }}
          rowSelection={rowSelection}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={recepts}
          pagination={{
            pageSize: meta?.per_page,
            page: meta?.current_page,
            total: meta?.total,
          }}
          rowKey={(record) => record.id}
          onChange={onChangePagination}
          loading={loading}
        />
      </Card>
      <CustomModal
        click={brandDelete}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        setText={setId}
        loading={loadingBtn}
      />
    </>
  );
};

export default Boxes;
