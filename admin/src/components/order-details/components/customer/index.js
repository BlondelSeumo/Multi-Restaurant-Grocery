import { Avatar, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const Customer = ({ data }) => {
  const { t } = useTranslation();
  return (
    <Card title={t('customer.information')}>
      <Space className='w-100 mb-2'>
        <Avatar size={64} src={data?.user?.img} shape='square' />
        <Typography.Text strong>
          {data?.user?.firstname || ''} {data?.user?.lastname || ''}
        </Typography.Text>
      </Space>
      <Space direction='vertical'>
        <Typography.Text>
          {`${t('phone.number')}: `}
          {data?.user?.phone || t('N/A')}
        </Typography.Text>
        <Typography.Text>
          {`${t('email')}: `}
          {data?.user?.email || t('N/A')}
        </Typography.Text>
        <Typography.Text>
          {`${t('gender')}: `}
          {t(data?.user?.gender || 'N/A')}
        </Typography.Text>
      </Space>
    </Card>
  );
};

export default Customer;
