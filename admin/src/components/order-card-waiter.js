import React from 'react';
import {
  EyeOutlined,
  UserOutlined,
  ContainerOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Avatar, Card, List, Skeleton, Space } from 'antd';
import { IMG_URL } from 'configs/app-global';
import numberToPrice from 'helpers/numberToPrice';
import { useTranslation } from 'react-i18next';
import { BsTruck } from 'react-icons/bs';
import getFullDateTime from 'helpers/getFullDateTime';
import { getDeliveryDateTime } from 'helpers/getDeliveryDateTime';

const { Meta } = Card;

const OrderCardWaiter = ({ data: item, goToShow, loading }) => {
  const { t } = useTranslation();
  const data = [
    {
      title: t('products.number'),
      icon: <ContainerOutlined />,
      data: item?.order_details_count,
    },
    {
      title: t('delivery.type'),
      icon: <BsTruck />,
      data: item?.delivery_type,
    },
    {
      title: t('table'),
      icon: <TableOutlined />,
      data: item?.table?.name || t('unspecified'),
    },
    {
      title: t('total.price'),
      icon: <DollarOutlined />,
      data: numberToPrice(item.total_price, item.currency?.symbol),
    },
    {
      title: t('delivery.date'),
      icon: <FieldTimeOutlined />,
      data: (
        <span style={{ width: 'max-contant', display: 'block' }}>
          {item?.delivery_date_time
            ? getDeliveryDateTime(item?.delivery_date, item?.delivery_time)
            : t('N/A')}
        </span>
      ),
    },
    {
      title: t('created.at'),
      icon: <FieldTimeOutlined />,
      data: (
        <span style={{ width: 'max-contant', display: 'block' }}>
          {item?.created_at ? getFullDateTime(item?.created_at) : t('N/A')}
        </span>
      ),
    },
  ];

  return (
    <Card
      actions={[<EyeOutlined key='setting' onClick={() => goToShow(item)} />]}
      className='order-card'
    >
      <Skeleton loading={loading} avatar active>
        <Meta
          avatar={
            <Avatar src={IMG_URL + item.user?.img} icon={<UserOutlined />} />
          }
          description={`#${item.id}`}
          title={`${item.user?.firstname || '-'} ${item.user?.lastname || '-'}`}
        />
        <List
          itemLayout='horizontal'
          dataSource={data}
          renderItem={(item, key) => (
            <List.Item key={key}>
              <Space>
                {item.icon}
                {`${item.title}:  ${item.data}`}
              </Space>
            </List.Item>
          )}
        />
      </Skeleton>
    </Card>
  );
};

export default OrderCardWaiter;
