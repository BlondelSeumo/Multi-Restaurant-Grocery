import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Select } from 'antd';
import { transactionStatuses } from 'constants/index';
import orderService from 'services/order';
import sellerOrderService from 'services/seller/order';
import { useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { setRefetch } from 'redux/slices/menu';
import { toast } from 'react-toastify';

const OrderPaymentStatusModal = ({
  role = 'admin',
  id,
  status,
  orderId,
  handleCancel,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const onFinish = (values) => {
    setLoadingBtn(true);
    (role === 'admin' ? orderService : sellerOrderService)
      .updateTransactionStatus(orderId, {
        status: values?.status?.value,
        transaction_id: id,
      })
      .then(() => {
        dispatch(setRefetch(activeMenu));
      })
      .catch((err) => {
        if (err?.response?.data?.params) {
          const errorMessages = Object.values(err?.response?.data?.params);
          toast.dismiss(400);
          errorMessages?.flatMap((item) => toast.error(`${item}`));
        }
      })
      .finally(() => {
        setLoadingBtn(false);
        handleCancel();
      });
  };

  return (
    <Modal
      title={t('payment.status')}
      visible={!!id}
      onCancel={handleCancel}
      destroyOnClose
      footer={[
        <Button onClick={handleCancel}>{t('cancel')}</Button>,
        <Button
          type='primary'
          onClick={() => form.submit()}
          loading={loadingBtn}
        >
          {t('save')}
        </Button>,
      ]}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={onFinish}
        initialValues={{
          status: { label: t(status), value: status, key: status },
        }}
      >
        <Form.Item
          label={t('status')}
          name='status'
          rules={[{ required: true, message: t('required') }]}
        >
          <Select
            labelInValue
            options={transactionStatuses.map((item) => ({
              label: t(item),
              value: item,
              key: item,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderPaymentStatusModal;
