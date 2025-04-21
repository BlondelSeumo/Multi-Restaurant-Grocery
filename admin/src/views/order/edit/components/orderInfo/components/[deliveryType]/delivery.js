import { Col, DatePicker, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { InfiniteSelect } from 'components/infinite-select';
import userService from 'services/user';
import addressService from 'services/address';
import { formatUsers } from 'helpers/formatUsers';
import { useState } from 'react';
import moment from 'moment/moment';
import { getHourFormat } from 'helpers/getHourFormat';

const Delivery = ({ form }) => {
  const { t } = useTranslation();

  const [hasMore, setHasMore] = useState({
    user: false,
    address: false,
  });

  const deliveryDate = Form.useWatch('deliveryDate', form);

  const fetchUsers = async ({ page = 1, search = '' }) => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
      page,
    };
    return await userService.search(params).then((res) => {
      setHasMore((prev) => ({ ...prev, user: !!res?.links?.next }));
      return formatUsers(res?.data);
    });
  };

  const fetchUserAddresses = async ({ page = 1, search = '' }) => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
      page,
    };

    return await addressService.getAll(params).then((res) => {
      setHasMore((prev) => ({ ...prev, address: !!res?.links?.next }));
      return res?.data?.map((item) => ({
        label: item?.address?.address || item?.title,
        value: `${item?.address?.address || item?.title}_${item?.location?.latitude || item?.location?.[0]}_${item?.location?.longitude || item?.location?.[1]}`,
        key: `${item?.address?.address || item?.title}_${item?.location?.latitude}_${item?.location?.longitude}`,
      }));
    });
  };

  return (
    <>
      <Col span={24}>
        <Form.Item
          name='user'
          label={t('user')}
          rules={[{ required: true, message: t('required') }]}
        >
          <InfiniteSelect
            hasMore={hasMore?.user}
            fetchOptions={fetchUsers}
            placeholder={t('select.user')}
            allowClear={false}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          name='address'
          label={t('address')}
          rules={[{ required: true, message: t('required') }]}
        >
          <InfiniteSelect
            hasMore={hasMore?.address}
            fetchOptions={fetchUserAddresses}
            placeholder={t('select.address')}
            allowClear={false}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='deliveryDate'
          label={t('delivery.date')}
          rules={[{ required: true, message: t('required') }]}
        >
          <DatePicker
            placeholder={t('select.delivery.date')}
            format='YYYY-MM-DD'
            className='w-100'
            showToday={false}
            disabledDate={(current) =>
              current && current < moment().startOf('day')
            }
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name='deliveryTime'
          label={t('delivery.time')}
          rules={[{ required: true, message: t('required') }]}
        >
          <DatePicker
            placeholder={t('select.delivery.time')}
            format={getHourFormat()}
            className='w-100'
            showNow={false}
            picker='time'
            disabled={!deliveryDate}
          />
        </Form.Item>
      </Col>
    </>
  );
};

export default Delivery;
