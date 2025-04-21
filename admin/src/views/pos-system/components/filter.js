import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'antd';
import { DebounceSelect } from 'components/search';
import shopService from 'services/shop';
import brandService from 'services/brand';
import categoryService from 'services/category';
import useDidUpdate from 'helpers/useDidUpdate';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchPosProducts } from 'redux/slices/pos-system';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';
import { clearCart, setCartData } from 'redux/slices/cart';
import { disableRefetch } from 'redux/slices/menu';
import { getCartData } from 'redux/selectors/cartSelector';
import { DEMO_ADMIN } from 'configs/app-global';
import createSelectObject from 'helpers/createSelectObject';

const Filter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currentBag } = useSelector((state) => state.cart, shallowEqual);
  const cartData = useSelector((state) => getCartData(state.cart));
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const [brand, setBrand] = useState(null);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState(null);
  const [shop, setShop] = useState(createSelectObject(myShop));

  const fetchUserShop = (search) => {
    const params = { search, status: 'approved' };
    return shopService.search(params).then((res) =>
      res?.data?.map((item) => ({
        label:
          item?.translation !== null ? item?.translation?.title : 'no name',
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  const fetchUserBrand = (username) => {
    return brandService.search(username).then((res) =>
      res?.data?.map((item) => ({
        label: item?.title,
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  const fetchUserCategory = (search) => {
    const params = { search, type: 'main' };
    return categoryService.search(params).then((res) =>
      res?.data?.map((item) => ({
        label:
          item?.translation !== null ? item?.translation?.title : 'no name',
        value: item?.id,
        key: item?.id,
      })),
    );
  };

  const fetchShopById = () => {
    shopService.getById(shop?.value || DEMO_ADMIN).then((res) =>
      dispatch(
        setCartData({
          bag_id: currentBag,
          currency_shop: res?.data,
          shop: res?.data,
        }),
      ),
    );
  };

  useDidUpdate(() => {
    const params = {
      search: search?.length ? search : undefined,
      brand_id: brand?.value,
      category_id: category?.value,
      shop_id: shop?.value || DEMO_ADMIN,
      status: 'published',
      active: 1,
      perPage: 12,
    };
    dispatch(fetchPosProducts(params));
  }, [brand?.value, category?.value, search?.length, shop?.value]);

  useEffect(() => {
    if (activeMenu.refetch) {
      batch(() => {
        dispatch(setCartData({ bag_id: currentBag, shop: cartData?.shop }));
        dispatch(disableRefetch(activeMenu));
      });
      fetchShopById();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchShopById();
  }, [shop?.value]);

  useDidUpdate(() => {
    if (!cartData?.shop) {
      fetchShopById();
    }
  }, [cartData?.shop]);

  return (
    <Card>
      <Row gutter={12}>
        <Col span={6}>
          <SearchInput
            className='w-100'
            placeholder={t('search')}
            handleChange={setSearch}
          />
        </Col>
        <Col span={6}>
          <DebounceSelect
            className='w-100'
            debounceTimeout={500}
            placeholder={t('select.shop')}
            allowClear={shop?.value !== DEMO_ADMIN}
            value={shop}
            fetchOptions={fetchUserShop}
            onSelect={(value) => {
              if (value) {
                setShop(value);
              }
              dispatch(clearCart());
            }}
            onClear={() => {
              setShop(createSelectObject(myShop));
            }}
          />
        </Col>
        <Col span={6}>
          <DebounceSelect
            className='w-100'
            placeholder={t('select.category')}
            fetchOptions={fetchUserCategory}
            onChange={(value) => setCategory(value)}
            value={category}
          />
        </Col>
        <Col span={6}>
          <DebounceSelect
            className='w-100'
            placeholder={t('select.brand')}
            fetchOptions={fetchUserBrand}
            onChange={(value) => setBrand(value)}
            value={brand}
          />
        </Col>
      </Row>
    </Card>
  );
};
export default Filter;
