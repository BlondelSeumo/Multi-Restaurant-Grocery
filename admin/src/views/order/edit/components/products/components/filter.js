import { Space } from 'antd';
import SearchInput from 'components/search-input';
import { useQueryParams } from 'helpers/useQueryParams';
import { useTranslation } from 'react-i18next';
import { InfiniteSelect } from 'components/infinite-select';
import brandService from 'services/brand';
import categoryService from 'services/category';
import createSelectObject from 'helpers/createSelectObject';
import { useState } from 'react';

const ProductsFilter = () => {
  const { t } = useTranslation();
  const queryParams = useQueryParams();
  const [hasMore, setHasMore] = useState({
    shop: false,
    brand: false,
    category: false,
  });

  const fetchBrands = ({ page = 1, search = '' }) => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
      page,
    };
    return brandService.getAll(params).then((res) => {
      setHasMore((prev) => ({ ...prev, brand: !!res?.meta?.links?.next }));
      return res?.data?.map((item) => createSelectObject(item));
    });
  };

  const fetchCategories = ({ page = 1, search = '' }) => {
    const params = {
      search: search?.length ? search : undefined,
      perPage: 20,
      page,
      type: 'main',
    };
    return categoryService.search(params).then((res) => {
      setHasMore((prev) => ({ ...prev, category: !!res?.meta?.links?.next }));
      return res?.data?.map((item) => createSelectObject(item));
    });
  };

  const handleFilter = (key, value) => {
    queryParams.set(key, value);
  };

  return (
    <Space wrap>
      <SearchInput
        defaultValue={queryParams.get('search')}
        handleChange={(value) => {
          handleFilter('search', value);
        }}
        placeholder={t('product.search')}
        style={{ width: 200 }}
      />
      <InfiniteSelect
        fetchOptions={fetchBrands}
        hasMore={hasMore?.brand}
        placeholder={t('select.brand')}
        defaultValue={queryParams.get('brand_id')}
        onChange={(item) => {
          handleFilter('brand_id', item?.value);
        }}
        style={{ width: 200 }}
      />
      <InfiniteSelect
        fetchOptions={fetchCategories}
        hasMore={hasMore?.category}
        placeholder={t('select.category')}
        defaultValue={queryParams.get('category_id')}
        onChange={(item) => {
          handleFilter('category_id', item?.value);
        }}
        style={{ width: 200 }}
      />
    </Space>
  );
};

export default ProductsFilter;
