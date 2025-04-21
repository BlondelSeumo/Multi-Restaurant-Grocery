import { useEffect, useState } from 'react';
import { Button, Descriptions, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import Loading from 'components/loading';
import transactionService from 'services/transaction';
import numberToPrice from 'helpers/numberToPrice';
import getFullDateTime from 'helpers/getFullDateTime';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';

export default function TransactionShowModal({ id, handleCancel }) {
  const { t } = useTranslation();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  function fetchTransaction(id) {
    setLoading(true);
    transactionService
      .getById(id)
      .then((res) => setData(res?.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTransaction(id);
  }, [id]);

  return (
    <Modal
      visible={!!id}
      title={t('transaction')}
      onCancel={handleCancel}
      footer={
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>
      }
    >
      {!loading ? (
        <Descriptions bordered>
          <Descriptions.Item span={3} label={t('transaction.id')}>
            {data?.id}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('client')}>
            {data.user?.firstname || ''} {data.user?.lastname || ''}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('price')}>
            {numberToPrice(data?.price)}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('payment.type')}>
            {t(data?.payment_system?.tag)}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('created.at')}>
            {getFullDateTime(data?.created_at)}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('status')}>
            <div className={tableRowClasses.paymentStatuses}>
              <span
                className={`${tableRowClasses.paymentStatus} ${tableRowClasses[data?.status || 'progress']}`}
              >
                {t(data?.status)}
              </span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('status.description')}>
            {data?.status_description}
          </Descriptions.Item>
          <Descriptions.Item span={3} label={t('note')}>
            {data?.note}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
