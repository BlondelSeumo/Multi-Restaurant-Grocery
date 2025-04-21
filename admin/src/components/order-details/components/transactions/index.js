import { useTranslation } from 'react-i18next';
import { Card, Table } from 'antd';
import numberToPrice from 'helpers/numberToPrice';
import getFullDateTime from 'helpers/getFullDateTime';
import { lazy, Suspense, useState } from 'react';
import Loading from 'components/loading';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import { EditOutlined } from '@ant-design/icons';

const OrderPaymentStatusModal = lazy(() => import('../payment-status-modal'));

const Transactions = ({ data, loading = false, role = 'admin' }) => {
  const { t } = useTranslation();
  const [paymentStatusModal, setPaymentStatusModal] = useState(null);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('payment.system'),
      dataIndex: 'payment_system',
      key: 'payment_system',
      render: (paymentSystem) => t(paymentSystem?.tag),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <div className={tableRowClasses.paymentStatuses}>
          <button
            type='button'
            className='cursor-pointer d-flex align-items-center'
            style={{ columnGap: '5px' }}
            onClick={(e) => {
              e.stopPropagation();
              setPaymentStatusModal({
                orderId: data?.id,
                id: row?.id,
                status,
              });
            }}
          >
            <span
              className={`${tableRowClasses.paymentStatus} ${tableRowClasses[status]}`}
            >
              {t(status)}
            </span>
            {(role === 'admin' || role === 'seller') && (
              <EditOutlined size={18} />
            )}
          </button>
        </div>
      ),
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note',
      render: (note) => note || t('N/A'),
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => getFullDateTime(created_at),
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => numberToPrice(price),
    },
  ];

  return (
    <>
      <Card title={t('transactions')}>
        <Table
          loading={loading}
          columns={columns}
          scroll={{ x: true }}
          rowKey={(item) => item?.id}
          dataSource={data?.transactions || []}
          pagination={false}
        />
      </Card>
      {!!paymentStatusModal && (
        <Suspense fallback={<Loading />}>
          <OrderPaymentStatusModal
            role={role}
            id={paymentStatusModal?.id}
            status={paymentStatusModal?.status}
            orderId={paymentStatusModal?.orderId}
            handleCancel={() => setPaymentStatusModal(null)}
          />
        </Suspense>
      )}
    </>
  );
};

export default Transactions;
