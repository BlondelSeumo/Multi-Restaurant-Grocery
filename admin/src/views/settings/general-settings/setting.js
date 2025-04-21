import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tooltip,
} from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { shallowEqual, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ImageUploadSingle from '../../../components/image-upload-single';
import settingService from '../../../services/settings';
import { Time } from './deliveryman_time';
import { fetchSettings as getSettings } from '../../../redux/slices/globalSettings';
import useDemo from '../../../helpers/useDemo';
import { checkIsTruish } from '../../../helpers/checkIsTruish';
import { FiHelpCircle } from 'react-icons/fi';

const hourFormats = ['24 hour', '12 hour'];

const Setting = ({
  setFavicon,
  favicon,
  setLogo,
  logo,
  darkLogo,
  setDarkLogo,
}) => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [form] = Form.useForm();
  const { isDemo } = useDemo();

  function updateSettings(data) {
    setLoadingBtn(true);
    settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => setLoadingBtn(false));
  }

  const onFinish = (values) => {
    const body = {
      ...values,
      favicon: favicon?.name,
      logo: logo?.name,
      dark_logo: darkLogo?.name,
      using_12_hour_format: +(
        values?.using_12_hour_format?.value === hourFormats[1]
      ),
      hour_format:
        values?.using_12_hour_format?.value === hourFormats[1]
          ? 'hh:mm A'
          : 'HH:mm',
    };
    updateSettings(body);
  };

  return (
    <Form
      layout='vertical'
      form={form}
      name='global-settings'
      onFinish={onFinish}
      initialValues={{
        delivery: '1',
        payment_type: 'admin',
        ...activeMenu.data,
        recommended_count: Number(activeMenu.data?.recommended_count) || 1,
        using_12_hour_format: {
          label: t(
            hourFormats[+checkIsTruish(activeMenu.data?.using_12_hour_format)],
          ),
          value:
            hourFormats[+checkIsTruish(activeMenu.data?.using_12_hour_format)],
          key: hourFormats[
            +checkIsTruish(activeMenu.data?.using_12_hour_format)
          ],
        },
      }}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('title')}
            name='title'
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.reject(new Error(t('required')));
                  } else if (value && value?.trim() === '') {
                    return Promise.reject(new Error(t('no.empty.space')));
                  } else if (value?.length < 2) {
                    return Promise.reject(new Error(t('must.be.at.least.2')));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <Space className='align-items-center w-100'>
                {t('deliveryman.order.acceptance.time')}
                <Tooltip
                  title={t(
                    'the.time.(in.seconds).a.deliveryman.has.to.accept.or.decline.an.order.notification.before.it.disappears',
                  )}
                  className='d-flex align-items-center justify-content-center'
                >
                  <FiHelpCircle size={18} />
                </Tooltip>
              </Space>
            }
            name='deliveryman_order_acceptance_time'
          >
            <Select options={Time} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('payment.type')}
            name='payment_type'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <Select>
              <Select.Option value='admin'>{t('admin')}</Select.Option>
              <Select.Option value='seller'>{t('seller')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={
              <Space className='align-items-center w-100'>
                {t('recommended.count')}
                <Tooltip
                  title={t(
                    'number.of.products.sold.to.make.it.into.the.recommendations',
                  )}
                  className='d-flex align-items-center justify-content-center'
                >
                  <FiHelpCircle size={18} />
                </Tooltip>
              </Space>
            }
            name='recommended_count'
            rules={[
              {
                type: 'number',
                min: 1,
                message: t('required'),
              },
            ]}
          >
            <InputNumber min={1} className='w-100' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('hour.format')} name='using_12_hour_format'>
            <Select
              labelInValue
              options={hourFormats.map((item) => ({
                label: t(item),
                value: item,
                key: item,
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Space>
            <Form.Item
              label={t('favicon')}
              name='favicon'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <ImageUploadSingle
                type='languages'
                image={favicon}
                setImage={setFavicon}
                form={form}
                name='favicon'
              />
            </Form.Item>
            <Form.Item
              label={t('logo')}
              name='logo'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <ImageUploadSingle
                type='languages'
                image={logo}
                setImage={setLogo}
                form={form}
                name='logo'
              />
            </Form.Item>
            <Form.Item
              label={t('dark.logo')}
              name='dark_logo'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <ImageUploadSingle
                type='languages'
                image={darkLogo}
                setImage={setDarkLogo}
                form={form}
                name='dark_logo'
              />
            </Form.Item>
          </Space>
        </Col>
      </Row>
      <Button
        onClick={() => form.submit()}
        type='primary'
        disabled={isDemo}
        loading={loadingBtn}
      >
        {t('save')}
      </Button>
    </Form>
  );
};

export default Setting;
