import { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import orderService from 'services/order';
import sellerOrderService from 'services/seller/order';
import { setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import userService from 'services/user';
import { DebounceSelect } from 'components/search';
import sellerDeliverymenService from 'services/seller/user';

const OrderDeliverymanModal = ({ data, role, handleCancel }) => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    const params = {
      deliveryman: values?.deliveryman?.value,
    };
    setLoading(true);
    (role === 'admin' ? orderService : sellerOrderService)
      .updateDelivery(data.id, params)
      .then(() => {
        handleCancel();
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoading(false));
  };

  async function fetchDelivery(search) {
    const commonParams = {
      search: search.length ? search : undefined,
      page: 1,
      perPage: 10,
      [`address[latitude]`]: data?.location?.latitude || undefined,
      [`address[longitude]`]: data?.location?.longitude || undefined,
    };
    const adminParams = {
      ...commonParams,
      role: 'deliveryman',
      shop_id: data?.shop?.id,
      exist_token: 1,
    };
    const sellerParams = {
      ...commonParams,
    };
    const params = role === 'admin' ? adminParams : sellerParams;
    return (
      role === 'admin'
        ? userService.getAll
        : sellerDeliverymenService.getDeliverymans
    )(params).then(({ data }) =>
      data?.map((item) => ({
        label: `${item?.firstname || ''} ${item?.lastname || ''}`,
        value: item?.id,
        key: item?.id,
      })),
    );
  }

  return (
    <Modal
      visible={!!data}
      onCancel={handleCancel}
      footer={[
        <Button key='cancelBtn' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
        <Button
          key='saveBtn'
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
          deliveryman: data?.deliveryman
            ? {
                label: `${data?.deliveryman?.firstname || ''} ${data?.deliveryman?.lastname || ''}`,
                value: data?.deliveryman?.id,
                key: data?.deliveryman?.id,
              }
            : undefined,
        }}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={t('deliveryman')}
              name='deliveryman'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <DebounceSelect
                className='w-100'
                debounceTimeout={500}
                placeholder={t('select.deliveryman')}
                fetchOptions={fetchDelivery}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default OrderDeliverymanModal;
