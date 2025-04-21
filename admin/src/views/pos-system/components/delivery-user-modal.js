import { Button, Col, Form, Input, InputNumber, Modal, Row } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import addressService from 'services/address';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { getCartData } from 'redux/selectors/cartSelector';
import PosUserAddress from './pos-user-address';

function DeliveryUserModal({ visible, handleCancel }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [addressModal, setAddressModal] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const cartData = useSelector((state) => getCartData(state.cart));

  const goToAddClientAddress = () => {
    setAddressModal(true);
  };
  const onFinish = (values) => {
    const body = {
      user_id: cartData.user?.value,
      active: 1,
      ...values,
    };
    setLoadingBtn(true);
    addressService
      .create(body)
      .then(() => {
        toast.success(t('successfully.added'));
        handleCancel();
      })
      .finally(() => setLoadingBtn(false));
  };
  return (
    <>
      <Modal
        visible={visible}
        title={t('create.address')}
        onCancel={handleCancel}
        footer={[
          <Button
            type='primary'
            key={'saveBtn'}
            onClick={() => form.submit()}
            loading={loadingBtn}
          >
            {t('save')}
          </Button>,
          <Button type='default' key={'cancelBtn'} onClick={handleCancel}>
            {t('cancel')}
          </Button>,
        ]}
      >
        <Form layout='vertical' form={form} onFinish={onFinish}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name='firstname'
                label={t('firstname')}
                rules={[{ required: true, message: t('required') }]}
              >
                <Input placeholder={t('firstname')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='lastname'
                label={t('lastname')}
                rules={[{ required: true, message: t('required') }]}
              >
                <Input placeholder={t('lastname')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='title'
                label={t('title')}
                rules={[{ required: true, message: t('required') }]}
              >
                <Input placeholder={t('title')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='street_house_number'
                label={t('home.number')}
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                  {
                    type: 'number',
                    max: 99999999,
                    message: t('max.length.8'),
                  },
                ]}
              >
                <InputNumber
                  placeholder={t('home.number')}
                  className='w-100'
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='zipcode'
                label={t('zip.code')}
                rules={[
                  {
                    required: true,
                    message: t('required'),
                  },
                ]}
              >
                <Input
                  placeholder={t('zip.code')}
                  className='w-100'
                  maxLength={15}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['address', 'address']}
                label={t('address')}
                rules={[{ required: true, message: '' }]}
                onClick={goToAddClientAddress}
              >
                <Input autoComplete='off' placeholder={t('address')} />
              </Form.Item>
              <Form.Item name={['location', 'latitude']} hidden />
              <Form.Item name={['location', 'longitude']} hidden />
            </Col>
            <Col span={24}>
              <Form.Item name='additional_details' label={t('details')}>
                <Input placeholder={`${t('details')} (${t('optional')})`} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      {addressModal && (
        <PosUserAddress
          uuid={addressModal}
          handleCancel={() => setAddressModal(null)}
          parentForm={form}
        />
      )}
    </>
  );
}

export default DeliveryUserModal;
