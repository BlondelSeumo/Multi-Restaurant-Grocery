import React, { useMemo, useRef, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { getCartData } from 'redux/selectors/cartSelector';
import { setCartData } from 'redux/slices/cart';
import { toast } from 'react-toastify';
import addressService from 'services/address';
import { PlusCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import { DebounceSelect } from 'components/search';
import userService from 'services/user';
import { isArray } from 'lodash';
import { InfiniteSelect } from 'components/infinite-select';
import bookingZoneService from 'services/booking-zone';
import bookingTableService from 'services/booking-table';
import createSelectObject from 'helpers/createSelectObject';
import useDidUpdate from 'helpers/useDidUpdate';
import DeliveryUserModal from './delivery-user-modal';
import PosUserModal from './pos-user-modal';
import { getHourFormat } from 'helpers/getHourFormat';

const DeliveryInfo = ({ form }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const data = useSelector((state) => getCartData(state.cart));
  const { currentBag } = useSelector((state) => state.cart, shallowEqual);
  const cartData = useSelector((state) => getCartData(state.cart));

  const [deliveryAddressModal, setDeliveryAddressModal] = useState(false);
  const [userModal, setUserModal] = useState(null);
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState({ deliveryZone: false, table: false });

  const filter = cartData.shop?.shop_closed_date?.map((date) => date?.day);
  const addressesList = useRef([]);

  useDidUpdate(() => {
    if (cartData?.shop?.id) {
      form.setFieldsValue({ deliveryZone: null, table: null });
    }
  }, [cartData?.shop?.id]);

  useDidUpdate(() => {
    if (cartData?.shop?.id) {
      form.setFieldsValue({
        deliveryZone: cartData?.deliveryZone,
        table: cartData?.table,
      });
    }
  }, [currentBag]);

  const disabledDate = (current) => {
    const a = filter?.find(
      (date) => date === moment(current).format('YYYY-MM-DD'),
    );
    const b = moment().add(-1, 'days') >= current;
    if (a) {
      return a;
    } else {
      return b;
    }
  };

  const range = (start, end) => {
    const x = parseInt(start);
    const y = parseInt(end);
    const number = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24,
    ];
    for (let i = x; i <= y; i++) {
      delete number[i];
    }
    return number;
  };

  const disabledDateTime = () => ({
    disabledHours: () =>
      range(
        moment(cartData?.delivery_date).format('YYYYMMDD') ===
          moment(new Date()).format('YYYYMMDD')
          ? moment(new Date()).add(1, 'hour').format('HH')
          : 0,
        24,
      ),
    disabledMinutes: () => [],
    disabledSeconds: () => [],
  });

  const delivery = useMemo(
    () => [
      {
        label: t('dine.in'),
        value: 'dine_in',
        key: 2,
      },
      {
        label: t('delivery'),
        value: 'delivery',
        key: 1,
      },
      {
        label: t('pickup'),
        value: 'pickup',
        key: 0,
      },
    ],
    [t],
  );

  const fetchUserAddresses = (search) => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
      page: 1,
    };

    return addressService.getAll(params).then(({ data }) => {
      addressesList.current = data;
      return data?.map((item) => ({
        label: item?.title || item.address?.address,
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  const handleDeliveryAddressSelect = (e) => {
    if (e === undefined)
      return dispatch(
        setCartData({
          bag_id: currentBag,
          address: '',
        }),
      );

    const selectedAddress = addressesList.current.find(
      (item) => item.id === e.value,
    );
    const body = {
      address: selectedAddress?.address?.address,
      active: 1,
      lat:
        selectedAddress?.location?.[0] || selectedAddress?.location?.latitude,
      lng:
        selectedAddress?.location?.[1] || selectedAddress?.location?.longitude,
    };
    dispatch(
      setCartData({
        address: body,
        deliveryAddress: {
          value: selectedAddress?.title || selectedAddress?.address?.address,
          label: selectedAddress?.title || selectedAddress?.address?.address,
        },
        bag_id: currentBag,
      }),
    );
  };

  const goToAddUserDeliveryAddress = () => {
    if (!data.userUuid) {
      toast.warning(t('please.select.client'));
      return;
    }
    setDeliveryAddressModal(true);
  };

  const setDeliveryPrice = (delivery) =>
    dispatch(setCartData({ delivery_fee: delivery.value, bag_id: currentBag }));

  const goToAddClient = () => setUserModal(true);

  const formatUser = (data) => {
    if (!data) return;
    if (isArray(data)) {
      return data.map((item) => ({
        label: `${item?.firstname} ${item?.lastname ? item?.lastname : ''}`,
        value: item?.id,
      }));
    } else {
      return {
        label: `${data?.firstname} ${data?.lastname ? data?.lastname : ''}`,
        value: data?.id,
      };
    }
  };

  const getUsers = (search) => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
    };
    return userService.search(params).then(({ data }) => {
      setUsers(data);
      return formatUser(data);
    });
  };
  const selectUser = (userObj) => {
    const user = users.find((item) => item?.id === userObj?.value);
    dispatch(
      setCartData({
        user: userObj,
        userUuid: user?.uuid,
        bag_id: currentBag,
        userOBJ: user,
      }),
    );
    form.setFieldsValue({ address: null });
  };

  const fetchDeliveryZone = async ({ search, page = 1 }) => {
    const params = {
      search: search?.length ? search : undefined,
      shop_id: cartData?.shop?.id,
      page,
    };
    return await bookingZoneService.getAll(params).then((res) => {
      setHasMore((prev) => ({ ...prev, deliveryZone: !!res?.links?.next }));
      return res?.data?.map((item) => createSelectObject(item));
    });
  };

  const fetchTable = async ({ search, page = 1 }) => {
    const params = {
      search: search?.length ? search : undefined,
      shop_section_id: cartData?.deliveryZone?.value || undefined,
      shop_id: cartData?.shop?.id,
      page,
    };
    return await bookingTableService.getAll(params).then((res) => {
      setHasMore((prev) => ({ ...prev, table: !!res?.links?.next }));
      return res?.data?.map((item) => ({
        label: item?.name || t('N/A'),
        value: item?.id,
        key: item?.id,
      }));
    });
  };

  return (
    <Card className={!!currentBag ? '' : 'tab-card'}>
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item
            name='delivery'
            label={t('delivery')}
            rules={[{ required: true, message: t('required') }]}
          >
            <Select
              options={delivery}
              labelInValue
              onSelect={setDeliveryPrice}
              placeholder={t('select.delivery.type')}
              onChange={(deliveries) =>
                dispatch(
                  setCartData({
                    deliveries,
                    address: '',
                    deliveryAddress: undefined,
                    bag_id: currentBag,
                    paymentType:
                      deliveries?.value === 'dine_in'
                        ? data?.paymentType?.value === 'cash'
                          ? data?.paymentType
                          : undefined
                        : data?.paymentType,
                  }),
                )
              }
            />
          </Form.Item>
        </Col>
        {cartData?.deliveries?.value === 'dine_in' && (
          <>
            <Col span={12}>
              <Form.Item
                name='deliveryZone'
                label={t('delivery.zone')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InfiniteSelect
                  className='w-100'
                  hasMore={hasMore?.deliveryZone}
                  placeholder={t('select.delivery.zone')}
                  fetchOptions={fetchDeliveryZone}
                  allowClear={false}
                  onChange={(value) => {
                    dispatch(
                      setCartData({
                        bag_id: currentBag,
                        deliveryZone: value,
                        table: null,
                      }),
                    );
                    form.setFieldsValue({ table: null });
                  }}
                  refetchOnFocus={true}
                  value={cartData?.deliveryZone}
                  disabled={!cartData?.shop?.id}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='table'
                label={t('table')}
                rules={[{ required: true, message: t('required') }]}
              >
                <InfiniteSelect
                  className='w-100'
                  hasMore={hasMore?.table}
                  placeholder={t('select.table')}
                  fetchOptions={fetchTable}
                  allowClear={false}
                  onChange={(value) => {
                    dispatch(setCartData({ bag_id: currentBag, table: value }));
                  }}
                  refetchOnFocus={true}
                  value={cartData?.table}
                  disabled={!cartData?.deliveryZone?.value}
                />
              </Form.Item>
            </Col>
          </>
        )}
        {cartData?.deliveries?.value === 'delivery' && (
          <>
            <Col span={21}>
              <Form.Item
                name='user'
                rules={[{ required: true, message: '' }]}
                className='w-100'
                label={t('user')}
              >
                <DebounceSelect
                  placeholder={t('select.client')}
                  fetchOptions={getUsers}
                  onSelect={selectUser}
                />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label={' '}>
                <Button icon={<UserAddOutlined />} onClick={goToAddClient} />
              </Form.Item>
            </Col>
            <Col span={21}>
              <Form.Item
                name='deliveryAddress'
                label={t('address')}
                rules={[
                  {
                    required: true,
                    message: t('address'),
                  },
                ]}
              >
                <DebounceSelect
                  fetchOptions={fetchUserAddresses}
                  placeholder={t('select.address')}
                  allowClear={false}
                  onChange={handleDeliveryAddressSelect}
                  autoComplete='none'
                  refetchOptions
                />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item label=' '>
                <Button
                  icon={<PlusCircleOutlined />}
                  onClick={goToAddUserDeliveryAddress}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name='delivery_date'
                    label={t('delivery.date')}
                    rules={[
                      {
                        required: true,
                        message: t('required'),
                      },
                    ]}
                    // valuePropName={'date'}
                  >
                    <DatePicker
                      placeholder={t('delivery.date')}
                      className='w-100'
                      format='YYYY-MM-DD'
                      disabledDate={disabledDate}
                      allowClear={false}
                      onChange={(e) => {
                        const delivery_date = moment(e).format('YYYY-MM-DD');
                        dispatch(
                          setCartData({
                            delivery_date,
                            bag_id: currentBag,
                          }),
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={`${t('delivery.time')} (${t('up.to')})`}
                    name='delivery_time'
                    rules={[
                      {
                        required: true,
                        message: t('required'),
                      },
                    ]}
                    // valuePropName='date'
                  >
                    <DatePicker
                      disabled={!data.delivery_date}
                      picker='time'
                      placeholder={t('start.time')}
                      className='w-100'
                      format={getHourFormat()}
                      showNow={false}
                      allowClear={false}
                      disabledTime={disabledDateTime}
                      onChange={(e) => {
                        const delivery_time = moment(e).format('HH:mm');
                        dispatch(
                          setCartData({ delivery_time, bag_id: currentBag }),
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </>
        )}
      </Row>
      {deliveryAddressModal && (
        <DeliveryUserModal
          visible={deliveryAddressModal}
          handleCancel={() => setDeliveryAddressModal(false)}
        />
      )}
      {userModal && (
        <PosUserModal
          visible={userModal}
          handleCancel={() => setUserModal(false)}
        />
      )}
    </Card>
  );
};

export default DeliveryInfo;
