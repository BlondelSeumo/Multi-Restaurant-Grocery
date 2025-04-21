import { Card, Col, Row, Skeleton, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { BiMoney } from 'react-icons/bi';
import { FiShoppingCart } from 'react-icons/fi';
import { AiTwotoneCalendar } from 'react-icons/ai';
import React from 'react';
import { getDeliveryDateTime } from 'helpers/getDeliveryDateTime';

const Header = ({ data, loading = false }) => {
  const { t } = useTranslation();
  const columns = [
    {
      label: t('delivery.date'),
      value: getDeliveryDateTime(data?.delivery_date, data?.delivery_time),
      icon: <AiTwotoneCalendar size={32} />,
      id: 'delivery_date',
      show: data?.delivery_type === 'delivery',
    },
    {
      label: t('total.price'),
      value: numberToPrice(data?.total_price),
      icon: <BiMoney size={32} />,
      id: 'total_price',
      show: true,
    },
    {
      label: t('products.count'),
      value: data?.details?.reduce(
        (total, item) => (total += item?.quantity || 0),
        0,
      ),
      icon: <FiShoppingCart size={32} />,
      id: 'products_count',
      show: true,
    },
  ];
  return (
    <Card>
      <Row gutter={12} justify='space-between'>
        {columns
          .filter((column) => column.show)
          .map((column) => (
            <Col key={column.id}>
              <Space align='center'>
                {column.icon}
                <Space direction='vertical' size={0}>
                  {loading ? (
                    <Skeleton.Button size='small' loading />
                  ) : (
                    <>
                      <Typography.Text style={{ fontSize: '16px' }}>
                        {column.label}
                      </Typography.Text>
                      <Typography.Text
                        style={{ fontSize: '16px', fontWeight: '600' }}
                      >
                        {column.value}
                      </Typography.Text>
                    </>
                  )}
                </Space>
              </Space>
            </Col>
          ))}
      </Row>
    </Card>
  );
};

export default Header;
