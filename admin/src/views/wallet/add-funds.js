import { Button, Card, Col, Form, Input, InputNumber, Row, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import userService from 'services/user';
import { useState } from 'react';
import { InfiniteSelect } from 'components/infinite-select';
import { shallowEqual, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const WalletAddFunds = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const [hasMore, setHasMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetForm = () => {
    form.resetFields();
  };

  const fetchUsers = ({ search = '', page = 1 }) => {
    const params = {
      search: search ? search : undefined,
      page,
      perPage: 10,
    };
    return userService.getAll(params).then((res) => {
      setHasMore(!!res?.links?.next);
      return res?.data?.map((item) => ({
        label: `${item?.firstname || ''} ${item?.lastname || ''} (${t(item?.role)})`,
        value: item?.uuid,
        key: item?.id,
      }));
    });
  };

  const onFinish = (values) => {
    console.log(values);
    const body = {
      price: values?.price,
      note: values?.note || undefined,
    };
    setIsSubmitting(true);
    userService
      .topupWallet(values?.user?.value, body)
      .then(() => {
        handleResetForm();
        toast.success(t('successfully.sent'));
      })
      .catch(() => {
        toast.error(t('failed.to.send'));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Card title={t('add.funds')}>
      <Form form={form} layout='vertical' onFinish={onFinish}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name='user'
              label={t('user')}
              rules={[{ required: true, message: t('required') }]}
            >
              <InfiniteSelect hasMore={hasMore} fetchOptions={fetchUsers} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='price'
              label={t('amount')}
              rules={[
                { required: true, message: t('required') },
                {
                  validator: (_, value) => {
                    if (value !== null && value <= 0) {
                      return Promise.reject(
                        t('amount.should.be.greater.than.zero'),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                className='w-100'
                addonAfter={
                  defaultCurrency?.position === 'after' &&
                  defaultCurrency?.symbol
                }
                addonBefore={
                  defaultCurrency?.position === 'before' &&
                  defaultCurrency?.symbol
                }
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name='note' label={t('note')}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button onClick={handleResetForm}>{t('reset')}</Button>
          <Button htmlType='submit' type='primary' loading={isSubmitting}>
            {t('save')}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default WalletAddFunds;
