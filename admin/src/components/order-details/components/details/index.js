import { Card, Col, Image, Row, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { BsCalendarDay } from 'react-icons/bs';
import { EditOutlined } from '@ant-design/icons';
import numberToPrice from 'helpers/numberToPrice';
import getFullDateTime from 'helpers/getFullDateTime';
import { getDeliveryDateTime } from 'helpers/getDeliveryDateTime';

const Details = ({
  data,
  isRefund,
  refundData,
  handleOpenStatusModal,
  handleOpenRefundStatusModal,
}) => {
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
      value: (
        <Space>
          <Tag>{t(data?.status)}</Tag>
          {data?.status !== 'delivered' &&
            data?.status !== 'canceled' &&
            handleOpenStatusModal && (
              <EditOutlined onClick={handleOpenStatusModal} />
            )}
        </Space>
      ),
      show: true,
    },
    {
      label: t('refund.status'),
      value: (
        <Space>
          <Tag>{t(refundData?.status)}</Tag>
          {refundData?.status !== 'canceled' && handleOpenRefundStatusModal && (
            <EditOutlined onClick={handleOpenRefundStatusModal} />
          )}
        </Space>
      ),
      show: isRefund,
    },
    {
      label: t('refund.cause'),
      value: refundData?.cause || t('N/A'),
      show: isRefund,
    },
    {
      label: t('refund.answer'),
      value: refundData?.answer || t('N/A'),
      show: isRefund,
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
            <Col span={12} className='mb-3' key={index}>
              <Typography.Text>
                <Space align='flex-start'>
                  {`${column.label}:`}
                  {!!column.icon && column.icon}
                  {column.value}
                </Space>
              </Typography.Text>
            </Col>
          ))}
      </Row>
      {!!data?.image_after_delivered && (
        <>
          <Typography.Text className='d-block mb-2'>
            {t('order.image')}:
          </Typography.Text>
          <div
            style={{
              width: '200px',
              height: '200px',
              overflow: 'hidden',
            }}
          >
            <Image
              src={data?.image_after_delivered}
              style={{ objectFit: 'contain' }}
              height='200px'
            />
          </div>
        </>
      )}
    </Card>
  );
};

export default Details;
