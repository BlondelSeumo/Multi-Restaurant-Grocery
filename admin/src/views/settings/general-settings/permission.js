import { Card, Col, Form, InputNumber, Row, Switch } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { shallowEqual } from 'react-redux';
import { toast } from 'react-toastify';
import settingService from 'services/settings';
import { fetchSettings as getSettings } from 'redux/slices/globalSettings';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import useDemo from 'helpers/useDemo';
import useDebounce from 'helpers/useDebounce';
import useDidUpdate from 'helpers/useDidUpdate';

const Permission = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { isDemo } = useDemo();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [splitMin, setSplitMin] = useState();
  const [splitMax, setSplitMax] = useState();
  const debounceSplitMin = useDebounce(splitMin, 1000);
  const debounceSplitMax = useDebounce(splitMax, 1000);

  useDidUpdate(() => {
    if (debounceSplitMin || debounceSplitMin === 0) {
      updateSettings({ split_min: debounceSplitMin });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSplitMin]);

  useDidUpdate(() => {
    if (debounceSplitMax || debounceSplitMax === 0) {
      updateSettings({ split_max: debounceSplitMax });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSplitMax]);

  const updateSettings = async (data) => {
    setLoadingBtn(true);
    await settingService
      .update(data)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(getSettings());
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  return (
    <Form
      layout='vertical'
      form={form}
      name='global-settings'
      initialValues={{
        ...activeMenu.data,
      }}
    >
      <Card title={t('permission')}>
        <Row gutter={24}>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('system.refund')}</b>
                <p>{t('enable.or.disable.refund.system')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item name='system_refund' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ system_refund: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('refund.delete')}</b>
                <p>{t('enable.or.disable.refund.deletion')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item name='refund_delete' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ refund_delete: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('order.auto.approved')}</b>
                <p>{t('enable.or.disable.automatically.order.approval')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item name='order_auto_approved' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ order_auto_approved: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('order.auto.deliveryMan')}</b>
                <p>
                  {t(
                    'enable.or.disable.automatic.deliveryman.assignment.to.the.order',
                  )}
                </p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item
                  name='order_auto_delivery_man'
                  valuePropName='checked'
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) =>
                      updateSettings({ order_auto_delivery_man: e })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('blog.active')}</b>
                <p>{t('enable.or.disable.blog.page')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item name='blog_active' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ blog_active: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {/*<Col span={24}>*/}
          {/*  <Row gutter={24}>*/}
          {/*    <Col span={12}>*/}
          {/*      <b>{t('prompt.email.modal')}</b>*/}
          {/*      <p>{t('Send.sms.to.email.subscribers')}</p>*/}
          {/*    </Col>*/}
          {/*    <Col*/}
          {/*      span={12}*/}
          {/*      className='mt-3'*/}
          {/*      style={{*/}
          {/*        display: 'flex',*/}
          {/*        justifyContent: 'end',*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      <Form.Item name='prompt_email_modal' valuePropName='checked'>*/}
          {/*        <Switch*/}
          {/*          checkedChildren={<CheckOutlined />}*/}
          {/*          unCheckedChildren={<CloseOutlined />}*/}
          {/*          loading={loadingBtn}*/}
          {/*          onChange={(e) => updateSettings({ prompt_email_modal: e })}*/}
          {/*        />*/}
          {/*      </Form.Item>*/}
          {/*    </Col>*/}
          {/*  </Row>*/}
          {/*</Col>*/}
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('referral.active')}</b>
                <p>{t('enable.or.disable.referral.system')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item name='referral_active' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ referral_active: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('aws.active')}</b>
                <p>{t('enable.or.disable.aws.for.image.storage')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item name='aws' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    disabled={isDemo}
                    onChange={(e) => updateSettings({ aws: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {/*<Col span={24}>*/}
          {/*  <Row gutter={24}>*/}
          {/*    <Col span={12}>*/}
          {/*      <b>{t('by.subscription')}</b>*/}
          {/*      <p>*/}
          {/*        {t('You.choose.whether.the.by.subscription.will.work.or.not')}*/}
          {/*      </p>*/}
          {/*    </Col>*/}
          {/*    <Col*/}
          {/*      span={12}*/}
          {/*      className='mt-3'*/}
          {/*      style={{*/}
          {/*        display: 'flex',*/}
          {/*        justifyContent: 'end',*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      <Form.Item name='by_subscription' valuePropName='checked'>*/}
          {/*        <Switch*/}
          {/*          checkedChildren={<CheckOutlined />}*/}
          {/*          unCheckedChildren={<CloseOutlined />}*/}
          {/*          loading={loadingBtn}*/}
          {/*          disabled={isDemo}*/}
          {/*          onChange={(e) => updateSettings({ by_subscription: e })}*/}
          {/*        />*/}
          {/*      </Form.Item>*/}
          {/*    </Col>*/}
          {/*  </Row>*/}
          {/*</Col>*/}
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('reservation_enable_for_user')}</b>
                <p>{t('enable.or.disable.reservation.system')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item
                  name='reservation_enable_for_user'
                  valuePropName='checked'
                >
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    disabled={isDemo}
                    onChange={(e) =>
                      updateSettings({ reservation_enable_for_user: e })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('is_demo')}</b>
                <p>{t('enable.or.disable.demo.mode')}</p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item name='is_demo' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => updateSettings({ is_demo: e })}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('auto.print.order')}</b>
                <p>
                  {t(
                    'automatically.print.order.invoice.when.order.status.changes.to.accepted',
                  )}
                </p>
              </Col>
              <Col
                span={12}
                className='mt-3'
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Form.Item name='auto_print_order' valuePropName='checked'>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    loading={loadingBtn}
                    onChange={(e) => {
                      updateSettings({ auto_print_order: e });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {/*<Col span={24}>*/}
          {/*  <Row gutter={24}>*/}
          {/*    <Col span={12}>*/}
          {/*      <b>{t('order.auto.remove')}</b>*/}
          {/*      <p>{t('Auto.removing.order')}</p>*/}
          {/*    </Col>*/}
          {/*    <Col span={12} className='mt-3'>*/}
          {/*      <Form.Item*/}
          {/*        name='order_auto_remove'*/}
          {/*        rules={[{ required: true, message: t('required') }]}*/}
          {/*      >*/}
          {/*        <InputNumber*/}
          {/*          onChange={(e) =>*/}
          {/*            setInputValue((prev) => {*/}
          {/*              return {*/}
          {/*                ...prev,*/}
          {/*                orderAutoRemove: e,*/}
          {/*              };*/}
          {/*            })*/}
          {/*          }*/}
          {/*          className='w-100'*/}
          {/*          disabled={loadingBtn}*/}
          {/*        />*/}
          {/*      </Form.Item>*/}
          {/*    </Col>*/}
          {/*  </Row>*/}
          {/*</Col>*/}
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('split.min')}</b>
                <p>{t('split.min.description')}</p>
              </Col>
              <Col span={12} className='mt-3'>
                <Form.Item name='split_min'>
                  <InputNumber
                    min={0}
                    className='w-100'
                    onChange={(e) => setSplitMin(e)}
                    disabled={loadingBtn}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={24}>
              <Col span={12}>
                <b>{t('split.max')}</b>
                <p>{t('split.max.description')}</p>
              </Col>
              <Col span={12} className='mt-3'>
                <Form.Item name='split_max'>
                  <InputNumber
                    min={0}
                    className='w-100'
                    onChange={(e) => setSplitMax(e)}
                    disabled={loadingBtn}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </Form>
  );
};

export default Permission;
