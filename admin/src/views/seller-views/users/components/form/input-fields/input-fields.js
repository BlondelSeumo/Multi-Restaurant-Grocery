import { Col, DatePicker, Form, Input, InputNumber, Row, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { userGenders } from 'constants/index';
import moment from 'moment/moment';
import React from 'react';
import MediaUpload from 'components/upload';

const InputFields = ({ avatar, setAvatar, form }) => {
  const { t } = useTranslation();
  return (
    <Row gutter={12}>
      <Col span={24}>
        <Form.Item
          name='images'
          label={t('avatar')}
          rules={[{ required: !avatar?.length, message: t('required') }]}
        >
          <MediaUpload
            type='users'
            imageList={avatar}
            setImageList={setAvatar}
            multiple={false}
            form={form}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='firstname'
          label={t('firstname')}
          rules={[
            { required: true, message: t('required') },
            { type: 'string', min: 2, message: t('min.2.letters') },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='lastname'
          label={t('lastname')}
          rules={[
            { required: true, message: t('required') },
            { type: 'string', min: 2, message: t('min.2.letters') },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='birthday'
          label={t('birthday')}
          rules={[
            {
              required: true,
              message: t('required'),
            },
          ]}
        >
          <DatePicker
            className='w-100'
            disabledDate={(current) => moment().add(-18, 'years') <= current}
            defaultPickerValue={moment().add(-18, 'years')}
            placeholder=''
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='gender'
          label={t('gender')}
          rules={[{ required: true, message: t('required') }]}
        >
          <Select
            labelInValue
            options={userGenders.map((item) => ({
              label: t(item),
              value: item,
              key: item,
            }))}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='phone'
          label={t('phone')}
          rules={[{ required: true, message: t('required') }]}
        >
          <InputNumber min={0} className='w-100' />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='email'
          label={t('email')}
          rules={[
            {
              required: true,
              message: t('required'),
            },
            {
              type: 'email',
              message: t('invalid.email'),
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={t('password')}
          name='password'
          rules={[
            { required: true, message: t('required') },
            {
              validator(_, value) {
                if (value && value?.toString().length < 6) {
                  return Promise.reject(new Error(t('min.6.letters')));
                }
                return Promise.resolve();
              },
            },
          ]}
          normalize={(value) => (value?.trim() === '' ? value?.trim() : value)}
        >
          <Input.Password type='password' className='w-100' />
        </Form.Item>
      </Col>

      <Col span={12}>
        <Form.Item
          label={t('password.confirmation')}
          name='password_confirmation'
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: t('required'),
            },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(t('two.passwords.dont.match'));
              },
            }),
          ]}
          normalize={(value) => (value?.trim() === '' ? value?.trim() : value)}
        >
          <Input.Password type='password' />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default InputFields;
