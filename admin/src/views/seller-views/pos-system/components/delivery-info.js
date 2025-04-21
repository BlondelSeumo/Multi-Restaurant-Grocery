import React, { useMemo, useRef, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { getCartData } from 'redux/selectors/cartSelector';
import { setCartData } from 'redux/slices/cart';
import { toast } from 'react-toastify';
import addressService from 'services/seller/address';
import { DebounceSelect } from 'components/search';
import { PlusCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import userService from 'services/seller/user';
import { isArray } from 'lodash';
import useDidUpdate from 'helpers/useDidUpdate';
import createSelectObject from 'helpers/createSelectObject';
import bookingZoneService from 'services/seller/booking-zone';
import bookingTableService from 'services/seller/booking-table';
import { InfiniteSelect } from 'components/infinite-select';
import PosUserAddress from './pos-user-address';
import DeliveryUserModal from './delivery-user-modal';
import UserAddModal from './user-add-modal';
import { getHourFormat } from 'helpers/getHourFormat';

const DeliveryInfo = ({ form }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const data = useSelector((state) => getCartData(state.cart));
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const { currentBag } = useSelector((state) => state.cart, shallowEqual);
  const addressesList = useRef([]);

  const [addressModal, setAddressModal] = useState(null);
  const [deliveryAddressModal, setDeliveryAddressModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [userModal, setUserModal] = useState(null);
  const [hasMore, setHasMore] = useState({ deliveryZone: false, table: false });

  const filter = shop?.shop_closed_date?.map((date) => date?.day);

  useDidUpdate(() => {
    if (shop?.id) {
      form.setFieldsValue({
        deliveryZone: data?.deliveryZone,
        table: data?.table,
      });
    }
  }, [currentBag]);

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
        moment(data?.delivery_date).format('YYYYMMDD') ===
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

  const setDeliveryPrice = (delivery) =>
    dispatch(setCartData({ delivery_fee: delivery.value, bag_id: currentBag }));

  const goToAddClient = () => {
    setUserModal(true);
  };

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

  const selectUser = (userObj) => {
    const user = users.find((item) => item.id === userObj.value);
    dispatch(
      setCartData({ user: userObj, userUuid: user.uuid, bag_id: currentBag }),
    );
    form.setFieldsValue({ address: null });
  };

  const getUsers = async (search) => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
    };
    return userService.getAll(params).then(({ data }) => {
      setUsers(data);
      return formatUser(data);
    });
  };

  const fetchDeliveryZone = async ({ search, page = 1 }) => {
    const params = {
      search: search?.length ? search : undefined,
      // shop_id: shop?.id,
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
      shop_section_id: data?.deliveryZone?.value || undefined,
      // shop_id: shop?.id,
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
        {data?.deliveries?.value === 'dine_in' && (
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
                  value={data?.deliveryZone}
                  disabled={!shop?.id}
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
                  onChange={(value) => {
                    dispatch(setCartData({ bag_id: currentBag, table: value }));
                  }}
                  refetchOnFocus={true}
                  value={data?.table}
                  disabled={!data?.deliveryZone?.value}
                />
              </Form.Item>
            </Col>
          </>
        )}
        {data?.deliveries?.value === 'delivery' && (
          <>
            <Col span={21}>
              <Form.Item
                name='user'
                rules={[{ required: true, message: '' }]}
                label={t('user')}
              >
                <DebounceSelect
                  placeholder={t('select.client')}
                  fetchOptions={getUsers}
                  onSelect={selectUser}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label=' '>
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
          </>
        )}
      </Row>
      {!!addressModal && (
        <PosUserAddress
          uuid={addressModal}
          handleCancel={() => setAddressModal(null)}
        />
      )}
      {!!deliveryAddressModal && (
        <DeliveryUserModal
          visible={deliveryAddressModal}
          handleCancel={() => setDeliveryAddressModal(false)}
        />
      )}
      {!!userModal && (
        <UserAddModal
          visible={userModal}
          handleCancel={() => setUserModal(false)}
        />
      )}
    </Card>
  );
};

export default DeliveryInfo;
