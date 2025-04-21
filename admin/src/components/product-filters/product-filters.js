import SearchInput from 'components/search-input';
import { Button, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { InfiniteSelect } from '../infinite-select';
import { useState } from 'react';
import shopService from 'services/shop';
import sellerShopService from 'services/seller/shop';
import createSelectObject from 'helpers/createSelectObject';
import categoryService from 'services/category';
import brandService from 'services/brand';

const ProductsFilter = ({
  defaultValues,
  role = 'admin',
  onChange,
  onClearAll,
  extras,
}) => {
  const { t } = useTranslation();
  const [hasMore, setHasMore] = useState({
    shop: false,
    category: false,
    brand: false,
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

  const fetchCategories = ({ search = '', page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
      type: 'main',
    };
    return categoryService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        category: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data?.map((item) => createSelectObject(item));
    });
  };

  const fetchBrands = ({ search = '', page = 1 }) => {
    const params = {
      search: search || undefined,
      page,
      perPage: 10,
    };
    return brandService.getAll(params).then((res) => {
      setHasMore((prev) => ({
        ...prev,
        brand: res?.meta?.current_page < res?.meta?.last_page,
      }));
      return res?.data?.map((item) => createSelectObject(item));
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
      <Col style={{ minWidth: '228px' }}>
        <SearchInput
          placeholder={t('search.by.id.title')}
          className='w-100'
          handleChange={(value) => onChange('search', value)}
          defaultValue={defaultValues?.search}
          resetSearch={!defaultValues?.search}
        />
      </Col>
      {role === 'admin' && (
        <>
          <Col style={{ minWidth: '170px' }}>
            <InfiniteSelect
              placeholder={t('select.branch')}
              hasMore={hasMore?.shop}
              fetchOptions={fetchShops}
              onChange={(item) => onChange('shop', item)}
              className='w-100'
              value={defaultValues?.shop}
            />
          </Col>
          <Col style={{ minWidth: '170px' }}>
            <InfiniteSelect
              placeholder={t('select.category')}
              hasMore={hasMore?.category}
              fetchOptions={fetchCategories}
              onChange={(item) => onChange('category', item)}
              className='w-100'
              value={defaultValues?.category}
            />
          </Col>
          <Col style={{ minWidth: '170px' }}>
            <InfiniteSelect
              placeholder={t('select.brand')}
              hasMore={hasMore?.brand}
              fetchOptions={fetchBrands}
              onChange={(item) => onChange('brand', item)}
              className='w-100'
              value={defaultValues?.brand}
            />
          </Col>
          <Col>
            <Button onClick={() => onClearAll()}>{t('clear')}</Button>
          </Col>
        </>
      )}
      {extras}
    </div>
  );
};

export default ProductsFilter;
