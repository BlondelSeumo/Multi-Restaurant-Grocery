import { Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const Customer = ({ data }) => {
  const { t } = useTranslation();
  return (
    <Card title={t('customer.information')}>
      <Space direction='vertical'>
        <Typography.Text strong>
          #{data?.user?.id} {data?.user?.firstname || ''}{' '}
          {data?.user?.lastname || ''}
        </Typography.Text>
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
