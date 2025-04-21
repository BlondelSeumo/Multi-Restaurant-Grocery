import { Card, Col, Form, Row, Select } from 'antd';
import { useMemo } from 'react';
import { ORDER_TYPES } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import useDidUpdate from 'helpers/useDidUpdate';
import Delivery from './[deliveryType]/delivery';
import DineIn from './[deliveryType]/dineIn';

const renderViewByDeliveryType = (type, form) => {
  switch (type) {
    case 'delivery':
      return <Delivery form={form} />;
    case 'dine_in':
      return <DineIn form={form} />;
    default:
      return null;
  }
};

const DeliveryInfo = ({ form }) => {
  const { t } = useTranslation();

  const { data } = useSelector((state) => state.order, shallowEqual);

  const orderTypes = useMemo(
    () =>
      ORDER_TYPES.map((type, index) => ({
        label: t(type),
        value: type,
        key: index,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.id],
  );

  const deliveryType = Form.useWatch('deliveryType', form);
  const paymentType = Form.useWatch('paymentType', form);

  const handleChangeDeliveryType = () => {
    if (deliveryType?.value === 'dine_in' && paymentType?.value === 'wallet') {
      form.setFieldsValue({ paymentType: null });
    }
  };

  useDidUpdate(() => {
    handleChangeDeliveryType();
    return () => {};
  }, [deliveryType?.value, paymentType?.value]);

  return (
    <Card>
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item
            name='deliveryType'
            label={t('delivery.type')}
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select
              labelInValue
              options={orderTypes}
              placeholder={t('select.delivery.type')}
            />
          </Form.Item>
        </Col>
        {renderViewByDeliveryType(deliveryType?.value, form)}
      </Row>
    </Card>
  );
};

export default DeliveryInfo;
