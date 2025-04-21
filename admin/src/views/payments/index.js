import { useContext, useEffect, useState } from 'react';
import { Table, Switch, Typography, Space, Divider } from 'antd';
import { Context } from 'context/context';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from 'redux/slices/payment';
import { disableRefetch, setRefetch } from 'redux/slices/menu';
import paymentService from 'services/payment';
import { useTranslation } from 'react-i18next';
import PaymentEditModal from './paymentEditModal';
import Card from 'components/card';
import useDidUpdate from 'helpers/useDidUpdate';

export default function Payments() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { setIsModalVisible } = useContext(Context);
  const { payments, loading } = useSelector(
    (state) => state.payment,
    shallowEqual,
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [id, setId] = useState(null);
  const [modal, setModal] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const columns = [
    {
      title: t('title'),
      dataIndex: 'tag',
      key: 'tag',
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.id);
            }}
            checked={active}
          />
        );
      },
    },
  ];

  const setActivePayments = () => {
    setLoadingBtn(true);
    paymentService
      .setActive(id)
      .then(() => {
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setLoadingBtn(false);
        setIsModalVisible(false);
        setId(null);
      });
  };

  const fetchPaymentsLocal = () => {
    dispatch(fetchPayments({}));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchPaymentsLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchPaymentsLocal();
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
          {t('payments')}
        </Typography.Title>
      </Space>
      <Divider color='var(--divider)' />
      <Table
        scroll={{ x: true }}
        columns={columns}
        dataSource={payments}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={false}
      />
      <CustomModal
        click={setActivePayments}
        text={t('are.you.sure.you.want.to.change.the.activity?')}
        loading={loadingBtn}
      />
      {modal && (
        <PaymentEditModal modal={modal} handleCancel={() => setModal(null)} />
      )}
    </Card>
  );
}
