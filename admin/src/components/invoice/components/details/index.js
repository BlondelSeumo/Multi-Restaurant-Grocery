import { Card, Col, Row, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { BsCalendarDay } from 'react-icons/bs';
import numberToPrice from 'helpers/numberToPrice';
import getFullDateTime from 'helpers/getFullDateTime';
import { getDeliveryDateTime } from 'helpers/getDeliveryDateTime';

const Details = ({ data }) => {
  const { t } = useTranslation();
  const columns = [
    {
      label: t('created.date.&.time'),
      value: getFullDateTime(data?.created_at),
      icon: <BsCalendarDay className='mr-1' />,
      show: true,
    },
    {
      label: t('delivery.date.&.time'),
      value: getDeliveryDateTime(data?.delivery_date, data?.delivery_time),
      icon: <BsCalendarDay className='mr-1' />,
      show: data?.delivery_type === 'delivery',
    },
    {
      label: t('delivery.type'),
      value: t(data?.delivery_type),
      show: true,
    },
    {
      label: t('status'),
      value: <Tag>{t(data?.status)}</Tag>,
      show: true,
    },
    {
      label: t('OTP'),
      value: data?.otp || t('N/A'),
      show: true,
    },
    {
      label: t('table'),
      value: data?.table?.name || t('N/A'),
      show: data?.table,
    },
    {
      label: t('note'),
      value: data?.note || t('N/A'),
      show: true,
    },
    {
      label: t('cash.change'),
      value: numberToPrice(data?.cash_change),
      show: !!data?.cash_change,
    },
    {
      label: t('address'),
      value: data?.address?.address || t('N/A'),
      show: data?.delivery_type === 'delivery',
    },
    {
      label: t('house'),
      value: data?.address?.house || t('N/A'),
      show: data?.delivery_type === 'delivery',
    },
    {
      label: t('floor'),
      value: data?.address?.floor || t('N/A'),
      show: data?.delivery_type === 'delivery',
    },
    {
      label: t('office'),
      value: data?.address?.office || t('N/A'),
      show: data?.delivery_type === 'delivery',
    },
  ];
  return (
    <Card title={t('details')}>
      <Row gutter={12}>
        {columns
          .filter((column) => column.show)
          .map((column, index) => (
            <Col span={24} className='mb-3' key={index}>
              <Typography.Text>
                <Space>
                  {`${column.label}:`}
                  {!!column.icon && column.icon}
                  {column.value}
                </Space>
              </Typography.Text>
            </Col>
          ))}
      </Row>
    </Card>
  );
};

export default Details;
