import { useState } from 'react';
import { Button, Col, Form, Modal, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setRefetch } from 'redux/slices/menu';
import refundService from 'services/refund';
import sellerRefundService from 'services/seller/refund';
import TextArea from 'antd/lib/input/TextArea';

const refundStatuses = ['pending', 'accepted', 'canceled'];

export default function RefundOrderStatusModal({ data, role, handleCancel }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const selectedStatus = Form.useWatch('status', form);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    const params = {
      status: values?.status?.value,
      answer:
        values?.status?.value !== 'accepeted' ? values?.answer : undefined,
    };
    setLoading(true);
    (role === 'admin' ? refundService : sellerRefundService)
      .update(data?.id, params)
      .then(() => {
        handleCancel();
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={!!data}
      title={data?.title}
      onCancel={handleCancel}
      footer={[
        <Button key='cansel-modal' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
        <Button
          key='save-form'
          type='primary'
          onClick={() => form.submit()}
          loading={loading}
        >
          {t('save')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          status: {
            label: t(data?.status),
            value: data?.status,
            key: data?.status,
          },
        }}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={t('status')}
              name='status'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select labelInValue>
                {refundStatuses?.map((item) => (
                  <Select.Option key={item} value={item}>
                    {t(item)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {selectedStatus?.value !== 'accepted' && (
            <Col span={24}>
              <Form.Item
                label={t('answer')}
                name='answer'
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
}
