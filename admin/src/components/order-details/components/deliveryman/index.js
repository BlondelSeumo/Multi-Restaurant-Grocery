import { Avatar, Button, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const Deliveryman = ({ data, handleOpenDeliverymanModal }) => {
  const { t } = useTranslation();

  return (
    <Card
      title={t('deliveryman')}
      extra={
        data?.status === 'ready' &&
        data?.delivery_type === 'delivery' && (
          <Button onClick={handleOpenDeliverymanModal}>
            {t(data?.deliveryman ? 'change' : 'assign')}
          </Button>
        )
      }
    >
      {(data?.status === 'new' ||
        data?.status === 'ready' ||
        data?.status === 'accepted') &&
        !data?.deliveryman && (
          <Typography.Text>{t('order_status_ready')}.</Typography.Text>
        )}
      {data?.status !== 'new' &&
        data?.status !== 'accepted' &&
        !data?.deliveryman && (
          <Typography.Text>
            {' '}
            {t(
              'The supplier is not assigned or delivery type pickup or dine in',
            )}
          </Typography.Text>
        )}
      {!!data?.deliveryman && (
        <>
          <Space className='w-100 mb-2'>
            <Avatar size={64} src={data?.deliveryman?.img} shape='square' />
            <Typography.Text strong>
              {data?.deliveryman?.firstname || ''}{' '}
              {data?.deliveryman?.lastname || ''}
            </Typography.Text>
          </Space>
          <Space direction='vertical'>
            <Typography.Text>
              {`${t('phone.number')}: `}
              {data?.deliveryman?.phone || t('N/A')}
            </Typography.Text>
            <Typography.Text>
              {`${t('email')}: `}
              {data?.deliveryman?.email || t('N/A')}
            </Typography.Text>
            <Typography.Text>
              {`${t('gender')}: `}
              {t(data?.deliveryman?.gender || 'N/A')}
            </Typography.Text>
          </Space>
        </>
      )}
    </Card>
  );
};

export default Deliveryman;
