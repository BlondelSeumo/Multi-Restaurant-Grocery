import { Col, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import bookingZoneService from 'services/booking-zone';
import bookingTableService from 'services/booking-table';
import createSelectObject from 'helpers/createSelectObject';
import { shallowEqual, useSelector } from 'react-redux';
import { useState } from 'react';
import { InfiniteSelect } from 'components/infinite-select';

const DineIn = ({ form }) => {
  const { t } = useTranslation();

  const { data } = useSelector((state) => state.order, shallowEqual);

  const [hasMore, setHasMore] = useState({
    deliveryZone: false,
    table: false,
  });

  const deliveryZone = Form.useWatch('deliveryZone', form);

  const fetchDeliveryZone = async ({ search, page = 1 }) => {
    const params = {
      search: search?.length ? search : undefined,
      shop_id: data?.shop?.id,
      perPage: 20,
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
      shop_section_id: deliveryZone?.value || undefined,
      shop_id: data?.shop?.id,
      perPage: 20,
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
    <>
      <Col span={12}>
        <Form.Item
          name='deliveryZone'
          label={t('delivery.zone')}
          rules={[{ required: true, message: t('required') }]}
        >
          <InfiniteSelect
            hasMore={hasMore?.deliveryZone}
            fetchOptions={fetchDeliveryZone}
            placeholder={t('select.delivery.zone')}
            allowClear={false}
            onChange={() => {
              form.setFieldsValue({ table: undefined });
            }}
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
            hasMore={hasMore?.table}
            fetchOptions={fetchTable}
            placeholder={t('select.table')}
            allowClear={false}
            refetchOnFocus
            disabled={!deliveryZone}
          />
        </Form.Item>
      </Col>
    </>
  );
};

export default DineIn;
