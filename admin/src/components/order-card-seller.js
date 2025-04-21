import React from 'react';
import {
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  ContainerOutlined,
  CarOutlined,
  DollarOutlined,
  FieldTimeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Avatar, Card, List, Skeleton, Space } from 'antd';
import numberToPrice from 'helpers/numberToPrice';
import { BiMap } from 'react-icons/bi';
import useDemo from 'helpers/useDemo';
import { BsTruck } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import getFullDateTime from 'helpers/getFullDateTime';
import { getDeliveryDateTime } from 'helpers/getDeliveryDateTime';

const { Meta } = Card;

const OrderCardSeller = ({
  data: item,
  goToShow,
  loading,
  setLocationsMap,
  setId,
  setIsModalVisible,
  setText,
  setDowloadModal,
  setType,
  // setIsTransactionModalOpen,
}) => {
  const { isDemo, demoFunc } = useDemo();
  const { t } = useTranslation();
  const data = [
    {
      title: t('client'),
      icon: <UserOutlined />,
      data: item?.user
        ? `${item?.user?.firstname || ''} ${item?.user?.lastname || ''}`
        : t('deleted.user'),
    },
    {
      title: t('products.number'),
      icon: <ContainerOutlined />,
      data: item?.order_details_count || 0,
    },
    {
      title: t('delivery.type'),
      icon: <BsTruck />,
      data: item?.delivery_type || t('N/A'),
    },
    {
      title: t('deliveryman'),
      icon: <CarOutlined />,
      data: item?.deliveryman
        ? `${item?.deliveryman?.firstname || ''} ${
            item?.deliveryman?.lastname || ''
          }`
        : t('N/A'),
    },
    {
      title: t('total.price'),
      icon: <DollarOutlined />,
      data: numberToPrice(
        item?.total_price,
        item?.currency?.symbol,
        item?.currency?.position,
      ),
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
      actions={[
        <BiMap
          size={20}
          onClick={(e) => {
            e.stopPropagation();
            setLocationsMap(item.id);
          }}
        />,
        <EyeOutlined key='setting' onClick={() => goToShow(item)} />,
        <DeleteOutlined
          onClick={(e) => {
            if (isDemo) {
              demoFunc();
              return;
            }
            e.stopPropagation();
            setId([item.id]);
            setIsModalVisible(true);
            setText(true);
            setType(item.status);
          }}
        />,
        <DownloadOutlined
          key='ellipsis'
          onClick={() => setDowloadModal(item.id)}
        />,
      ]}
      className='order-card'
    >
      <Skeleton loading={loading} avatar active>
        <Meta
          avatar={<Avatar src={item?.user?.img} icon={<UserOutlined />} />}
          description={`#${item?.id}`}
          title={
            item?.user
              ? `${item.user?.firstname || ''} ${item.user?.lastname || ''}`
              : t('deleted.user')
          }
        />
        <List
          itemLayout='horizontal'
          dataSource={data}
          renderItem={(item, key) => (
            <List.Item key={key}>
              <Space>
                {item?.icon}
                <span>
                  {`${item?.title}: `}
                  {item?.data}
                </span>
              </Space>
            </List.Item>
          )}
        />
      </Skeleton>
    </Card>
  );
};

export default OrderCardSeller;
