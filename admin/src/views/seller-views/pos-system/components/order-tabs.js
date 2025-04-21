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
import { AsyncSelect } from 'components/async-select';
import { getCartData } from 'redux/selectors/cartSelector';
import restPaymentService from 'services/rest/payment';
import moment from 'moment/moment';
import useDidUpdate from 'helpers/useDidUpdate';
import DeliveryInfo from './delivery-info';
import PosUserAddress from './pos-user-address';

export default function OrderTabs() {
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

  function selectCurrency(item) {
    const data = currencies.find((el) => el.id === item.value);
    dispatch(setCurrency(data));
  }

  useEffect(() => {
    if (!currency) {
      const currentCurrency = currencies.find((item) => item.default);
      const formCurrency = {
        label: `${currentCurrency?.title} (${currentCurrency?.symbol})`,
        value: currentCurrency.id,
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
        value: currency.id,
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
      user: data.user || null,
      payment_type: data.paymentType || null,
      address: data.address.address || null,
      deliveryAddress: data.deliveryAddress,
      delivery: data.deliveries || null,
      delivery_time: data?.delivery_time
        ? moment(`${data?.delivery_date} ${data?.delivery_time}`)
        : null,
      delivery_date: data?.delivery_date ? moment(data?.delivery_date) : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBag, data]);

  async function fetchPaymentList() {
    return restPaymentService.getAll().then((res) =>
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
  }

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
          onClick={() => dispatch(addBag())}
        />
      </div>
      <Form layout='vertical' name='seller-pos-form' form={form}>
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
                label={t('currency')}
                name='currency'
                rules={[{ required: true, message: t('required') }]}
              >
                <Select
                  placeholder={t('select.currency')}
                  onSelect={selectCurrency}
                  labelInValue
                  disabled
                >
                  {currencies?.map((item, index) => (
                    <Select.Option key={index} value={item?.id}>
                      {`${item?.title} (${item?.symbol})`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('payment.type')}
                name='payment_type'
                rules={[{ required: true, message: t('required') }]}
              >
                <AsyncSelect
                  fetchOptions={fetchPaymentList}
                  className='w-100'
                  placeholder={t('select.payment.type')}
                  onSelect={(paymentType) => {
                    dispatch(setCartData({ paymentType, bag_id: currentBag }));
                  }}
                  refetch={true}
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
}
