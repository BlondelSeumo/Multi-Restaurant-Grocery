import { Avatar, Card, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';

const Shop = ({ data }) => {
  const { t } = useTranslation();
  return (
    <Card title={t('shop.information')}>
      <Space className='w-100 mb-2'>
        <Avatar size={64} src={data?.shop?.logo_img} shape='square' />
        <Typography.Text strong>
          {data?.shop?.translation?.title}
        </Typography.Text>
      </Space>
      <Space direction='vertical'>
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
