import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Select, Space, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  CloseOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addBag,
  removeBag,
  setCartData,
  setCurrency,
  setCurrentBag,
} from 'redux/slices/cart';
import { getCartData } from 'redux/selectors/cartSelector';
import moment from 'moment';
import { AsyncSelect } from 'components/async-select';
import restPaymentService from 'services/rest/payment';
import useDidUpdate from 'helpers/useDidUpdate';
import PosUserAddress from './pos-user-address';
import DeliveryInfo from './delivery-info';

const OrderTabs = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { currencies, loading } = useSelector(
    (state) => state.currency,
    shallowEqual,
  );
  const { currentBag, bags, currency } = useSelector(
    (state) => state.cart,
    shallowEqual,
  );
  const data = useSelector((state) => getCartData(state.cart));
  const cartData = useSelector((state) => getCartData(state.cart));

  const [addressModal, setAddressModal] = useState(null);

  useDidUpdate(() => {
    if (data?.deliveries?.value === 'dine_in') {
      form.setFieldsValue({
        payment_type: data?.paymentType,
      });
    }
  }, [data?.deliveries?.value, currentBag]);

  const closeTab = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(removeBag(item));
  };

  const selectCurrency = (item) => {
    const currentCurrency = currencies.find((el) => el.id === item.value);
    dispatch(setCurrency(currentCurrency));
  };

  const fetchPaymentList = async () => {
    return await restPaymentService.getAll().then((res) =>
      res?.data
        .filter((el) =>
          data?.deliveries?.value === 'dine_in'
            ? el.tag === 'cash'
            : el.tag === 'cash' || el.tag === 'wallet',
        )
        .map((item) => ({
          label: t(item.tag) || t('N/A'),
          value: item?.tag,
          key: item?.id,
        })),
    );
  };

  useEffect(() => {
    if (!currency) {
      const currentCurrency = currencies.find((item) => item.default);
      const formCurrency = {
        label: `${currentCurrency?.title} (${currentCurrency?.symbol})`,
        value: currentCurrency?.id,
      };
      dispatch(
        setCartData({
          currentCurrency,
          bag_id: currentBag,
        }),
      );
      dispatch(setCurrency(currentCurrency));
      form.setFieldsValue({
        currency: formCurrency,
      });
    } else {
      const formCurrency = {
        label: `${currency?.title} (${currency?.symbol})`,
        value: currency?.id,
      };
      dispatch(
        setCartData({
          formCurrency,
          bag_id: currentBag,
        }),
      );
      form.setFieldsValue({
        currency: formCurrency,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      user: data?.user || undefined,
      payment_type: data?.paymentType || undefined,
      address: data?.address?.address || undefined,
      deliveryAddress: data?.deliveryAddress,
      delivery: data?.deliveries || undefined,
      delivery_time:
        data?.delivery_time && data?.delivery_time
          ? moment(`${data?.delivery_date} ${data?.delivery_time}`)
          : undefined,
      delivery_date: data?.delivery_date
        ? moment(data?.delivery_date)
        : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBag, data]);

  return (
    <div className='order-tabs'>
      <div className='tabs-container'>
        <div className='tabs'>
          {bags.map((item) => (
            <div
              key={`tab_id_${item}`}
              className={item === currentBag ? 'tab active' : 'tab'}
              onClick={() => dispatch(setCurrentBag(item))}
            >
              <Space>
                <ShoppingCartOutlined />
                <span>
                  {t('bag')} - {item + 1}
                </span>
                {!!item && item === currentBag && (
                  <CloseOutlined
                    onClick={(event) => closeTab(event, item)}
                    className='close-button'
                    size={12}
                  />
                )}
              </Space>
            </div>
          ))}
        </div>
        <Button
          size='small'
          type='primary'
          shape='circle'
          icon={<PlusOutlined />}
          className='tab-add-button'
          onClick={() => dispatch(addBag({ shop: cartData.shop }))}
        />
      </div>
      <Form layout='vertical' name='pos-form' form={form}>
        <DeliveryInfo form={form} />
        <Card>
          {loading && (
            <div className='loader'>
              <Spin />
            </div>
          )}
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item
                name='currency'
                rules={[{ required: true, message: 'missing_currency' }]}
                label={t('currency')}
              >
                <Select
                  placeholder={t('select.currency')}
                  onSelect={selectCurrency}
                  labelInValue
                  disabled
                  onChange={(e) => {
                    const currency = e;
                    dispatch(
                      setCartData({
                        currency,
                        bag_id: currentBag,
                      }),
                    );
                  }}
                >
                  {currencies.map((item, index) => (
                    <Select.Option key={index} value={item?.id}>
                      {`${item?.title} (${item?.symbol})`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='payment_type'
                label={t('payment.type')}
                rules={[{ required: true, message: t('missing.payment.type') }]}
              >
                <AsyncSelect
                  fetchOptions={fetchPaymentList}
                  className='w-100'
                  placeholder={t('select.payment.type')}
                  onSelect={(paymentType) => {
                    dispatch(setCartData({ paymentType, bag_id: currentBag }));
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
      {addressModal && (
        <PosUserAddress
          uuid={addressModal}
          handleCancel={() => setAddressModal(null)}
        />
      )}
    </div>
  );
};

export default OrderTabs;
