import { useState } from 'react';
import { Button, Col, Form, Modal, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import orderService from 'services/order';
import sellerOrderService from 'services/seller/order';
import waiterOrderService from 'services/waiter/order';
import { addMenu, setRefetch } from 'redux/slices/menu';
import { useNavigate } from 'react-router-dom';
import { checkIsTruish } from 'helpers/checkIsTruish';

export default function OrderStatusModal({
  data,
  role,
  handleCancel,
  activeStatuses,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const settings = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual,
  );

  const [loading, setLoading] = useState(false);

  const goToInvoice = (id) => {
    const url =
      role === 'admin'
        ? `orders/generate-invoice/${id}`
        : `seller/generate-invoice/${id}`;
    dispatch(
      addMenu({
        url,
        id: 'generate-invoice ',
        name: t('generate.invoice'),
      }),
    );
    navigate(`/${url}?print=true`);
  };

  const onFinish = (values) => {
    const params = {
      status: values?.status?.value || values?.status,
    };
    setLoading(true);
    (role === 'admin'
      ? orderService
      : role === 'waiter'
        ? waiterOrderService
        : sellerOrderService
    )
      .updateStatus(data.id, params)
      .then((res) => {
        if (
          res?.data?.status === 'accepted' &&
          checkIsTruish(settings?.auto_print_order)
        ) {
          goToInvoice(res?.data?.id);
        } else {
          handleCancel();
          dispatch(setRefetch(activeMenu));
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={!!data}
      title={data.title}
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
          status: data?.status,
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
                {activeStatuses?.map((item) => (
                  <Select.Option key={item?.name} value={item?.name}>
                    {t(item?.name)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
