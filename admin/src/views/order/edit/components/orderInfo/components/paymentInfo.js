import { Card, Col, Form, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { InfiniteSelect } from 'components/infinite-select';
import { useState } from 'react';
import restPaymentService from 'services/rest/payment';

const PaymentInfo = ({ form }) => {
  const { t } = useTranslation();

  const [hasMore, setHasMore] = useState({
    paymentType: false,
  });

  const deliveryType = Form.useWatch('deliveryType', form);

  const fetchPaymentList = async ({ page = 1, search = '' }) => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
      page,
    };
    return await restPaymentService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        paymentType: !!res?.links?.next,
      }));
      return res?.data
        .filter((el) =>
          deliveryType?.value === 'dine_in'
            ? el.tag === 'cash'
            : el.tag === 'cash' || el.tag === 'wallet',
        )
        .map((item) => ({
          label: t(item.tag) || t('N/A'),
          value: item?.tag,
          key: item?.id,
        }));
    });
  };

  return (
    <Card>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name='currency'
            label={t('currency')}
            rules={[{ required: true, message: t('required') }]}
          >
            <Select placeholder={t('select.currency')} labelInValue disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='paymentType'
            label={t('payment.type')}
            rules={[{ required: true, message: t('required') }]}
          >
            <InfiniteSelect
              placeholder={t('select.payment.type')}
              hasMore={hasMore?.paymentType}
              fetchOptions={fetchPaymentList}
              refetchOnFocus
              allowClear={false}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default PaymentInfo;
