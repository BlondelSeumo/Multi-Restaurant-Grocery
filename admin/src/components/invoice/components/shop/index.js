import { Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';

const Shop = ({ data }) => {
  const { t } = useTranslation();
  return (
    <Card title={t('shop.information')}>
      <Space direction='vertical'>
        <Typography.Text strong>
          #{data?.shop?.id} {data?.shop?.translation?.title}
        </Typography.Text>
        <Typography.Text>
          {`${t('phone.number')}: `}
          {data?.shop?.phone || t('N/A')}
        </Typography.Text>
        <Typography.Text>
          {`${t('min.order.price')}: `}
          {numberToPrice(data?.shop?.price)}
        </Typography.Text>
        <Typography.Text>
          {`${t('address')}: `}
          {data?.shop?.translation?.address}
        </Typography.Text>
      </Space>
    </Card>
  );
};

export default Shop;
