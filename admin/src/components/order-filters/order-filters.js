import { Button, Col, DatePicker, Select } from 'antd';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';
import { InfiniteSelect } from 'components/infinite-select';
import { useState } from 'react';
import shopService from 'services/shop';
import sellerShopService from 'services/seller/shop';
import createSelectObject from 'helpers/createSelectObject';
import userService from 'services/user';
import sellerUserService from 'services/seller/user';
import moment from 'moment';

const { RangePicker } = DatePicker;
const deliveryOptions = ['delivery', 'pickup', 'dine_in', 'scheduled'];

const OrderFilters = ({
  role = 'admin',
  defaultValues,
  onChange,
  onClearAll,
  extras,
}) => {
  const { t } = useTranslation();
  const [hasMore, setHasMore] = useState({
    shop: false,
    user: false,
  });

  const fetchShops = ({ search = '', page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
    };
    return (role === 'admin' ? shopService : sellerShopService)
      .getAll(params)
      .then((res) => {
        setHasMore((prev) => ({
          ...prev,
          shop: res?.meta?.current_page < res?.meta?.last_page,
        }));
        return res?.data?.map((item) => createSelectObject(item));
      });
  };

  const fetchUsers = ({ search = '', page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
    };
    return (role === 'admin' ? userService : sellerUserService)
      .search(params)
      .then((res) => {
        setHasMore((prev) => ({
          ...prev,
          user: res?.meta?.current_page < res?.meta?.last_page,
        }));
        return res?.data.map((item) => ({
          label: `${item?.firstname || ''} ${item?.lastname || ''}`,
          value: item?.id,
          key: item?.id,
        }));
      });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        rowGap: '6px',
        columnGap: '6px',
      }}
    >
      <Col style={{ minWidth: '253px' }}>
        <SearchInput
          placeholder={t('search.by.order.id.customer')}
          className='w-100'
          handleChange={(value) => onChange('search', value)}
          defaultValue={defaultValues?.search}
          resetSearch={!defaultValues?.search}
        />
      </Col>
      {role === 'admin' && (
        <Col style={{ minWidth: '160px' }}>
          <InfiniteSelect
            placeholder={t('all.branches')}
            hasMore={hasMore?.shop}
            fetchOptions={fetchShops}
            onChange={(item) => onChange('shop', item)}
            className='w-100'
            value={defaultValues?.shop}
          />
        </Col>
      )}
      {role !== 'deliveryman' && (
        <Col style={{ minWidth: '189px' }}>
          <InfiniteSelect
            placeholder={t('select.customer')}
            hasMore={hasMore?.user}
            fetchOptions={fetchUsers}
            onChange={(item) => onChange('user', item)}
            className='w-100'
            value={defaultValues?.user}
          />
        </Col>
      )}
      {role === 'seller' && (
        <Col style={{ minWidth: '189px' }}>
          <Select
            labelInValue
            value={defaultValues?.delivery_type}
            options={deliveryOptions.map((item) => ({
              label: t(item),
              value: item,
              key: item,
            }))}
            onChange={(item) => {
              onChange('delivery_type', item);
            }}
            allowClear
            className='w-100'
            placeholder={t('filter.by.delivery.type')}
          />
        </Col>
      )}
      <Col style={{ minWidth: '242px' }}>
        <RangePicker
          allowClear
          className='w-100'
          placeholder={[t('from.date'), t('to.date')]}
          value={
            defaultValues?.date
              ? [
                  moment(defaultValues?.date?.from, 'YYYY-MM-DD'),
                  moment(defaultValues?.date?.to, 'YYYY-MM-DD'),
                ]
              : undefined
          }
          onChange={(date) => {
            if (date) {
              onChange('date', {
                from: moment(date?.[0]).format('YYYY-MM-DD'),
                to: moment(date?.[1]).format('YYYY-MM-DD'),
              });
            } else {
              onChange('date', null);
            }
          }}
        />
      </Col>
      <Col>
        <Button onClick={() => onClearAll()}>{t('clear')}</Button>
      </Col>
      {extras}
    </div>
  );
};

export default OrderFilters;
