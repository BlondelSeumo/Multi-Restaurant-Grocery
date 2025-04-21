import { useContext, useEffect, useState } from 'react';
import { Divider, Switch, Table, Typography } from 'antd';
import CustomModal from 'components/modal';
import { Context } from 'context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from 'redux/slices/menu';
import OrderStatusService from 'services/orderStatus';
import { fetchOrderStatus } from 'redux/slices/orderStatus';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Card from 'components/card';

const OrderStatus = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('status'),
      dataIndex: 'name',
      key: 'name',
      render: (name) => t(name),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => {
        return (
          <Switch
            key={row.id + active}
            onChange={() => {
              setIsModalVisible(true);
              setActiveId(row.id);
            }}
            checked={active}
            disabled={
              row.name === 'canceled' ||
              row.name === 'delivered' ||
              row.name === 'accepted'
            }
          />
        );
      },
    },
  ];

  const { setIsModalVisible } = useContext(Context);
  const [activeId, setActiveId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { statusList, loading } = useSelector(
    (state) => state.orderStatus,
    shallowEqual,
  );

  const handleActive = () => {
    setLoadingBtn(true);
    OrderStatusService.status(activeId)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchOrderStatus());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchOrderStatus());
      dispatch(disableRefetch(activeMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  return (
    <>
      <Card>
        <Typography.Title
          level={1}
          style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 500 }}
        >
          {t('order.statuses')}
        </Typography.Title>
        <Divider color='var(--divider)' />
        <Table
          scroll={{ x: true }}
          columns={columns}
          dataSource={statusList}
          rowKey={(record) => record.id}
          loading={loading}
        />
      </Card>
      <CustomModal
        click={handleActive}
        text={t('are.you.sure.you.want.to.change.the.activity?')}
        loading={loadingBtn}
      />
    </>
  );
};

export default OrderStatus;
