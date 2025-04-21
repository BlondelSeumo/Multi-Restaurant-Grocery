import {
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  DeleteOutlined,
  FieldTimeOutlined,
  ContainerOutlined,
  ShopFilled,
} from '@ant-design/icons';
import { Avatar, Card, List, Skeleton, Space } from 'antd';
import numberToPrice from 'helpers/numberToPrice';
import { BiMap } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import useDemo from 'helpers/useDemo';
import { BsTruck } from 'react-icons/bs';
import getFullDateTime from 'helpers/getFullDateTime';
import { getDeliveryDateTime } from 'helpers/getDeliveryDateTime';

const { Meta } = Card;

const OrderCard = ({
  data: item,
  goToShow,
  loading,
  setLocationsMap,
  setId,
  setIsModalVisible,
  setText,
  setDowloadModal,
  setTabType,
  // setIsTransactionModalOpen,
}) => {
  const { t } = useTranslation();
  const data = [
    {
      title: t('shop'),
      icon: <ShopFilled />,
      data: item?.shop ? item?.shop?.translation?.title : t('N/A'),
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
        <span
          style={{
            display: 'block',
            width: 'max-content',
          }}
        >
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
        <span style={{ width: 'max-content', display: 'block' }}>
          {item?.created_at ? getFullDateTime(item?.created_at) : t('N/A')}
        </span>
      ),
    },
  ];
  const { isDemo } = useDemo();
  const actions = [
    <BiMap
      size={20}
      onClick={(e) => {
        e.stopPropagation();
        setLocationsMap(item.id);
      }}
    />,
    <DeleteOutlined
      onClick={(e) => {
        if (isDemo) {
          toast.warning(t('cannot.work.demo'));
          return;
        }
        e.stopPropagation();
        setId([item.id]);
        setIsModalVisible(true);
        setText(true);
        setTabType(item.status);
      }}
    />,
    <DownloadOutlined
      onClick={(e) => {
        e.stopPropagation();
        setDowloadModal(item.id);
      }}
    />,
    <EyeOutlined
      onClick={(e) => {
        e.stopPropagation();
        goToShow(item);
      }}
    />,
  ];

  return (
    <Card actions={actions} className='order-card'>
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

export default OrderCard;
