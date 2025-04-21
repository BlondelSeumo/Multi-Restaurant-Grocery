import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Card, Divider, Spin } from 'antd';
import { fetchRestProducts } from 'redux/slices/product';
import { useEffect } from 'react';
import { useQueryParams } from 'helpers/useQueryParams';
import ProductList from './components/list';
import ProductsFilter from './components/filter';

const OrderShopProducts = ({ orderLoading }) => {
  const dispatch = useDispatch();
  const queryParams = useQueryParams();

  const { data } = useSelector((state) => state.order, shallowEqual);

  const params = {
    shop_id: data?.shop?.id || undefined,
    search: queryParams.get('search') || undefined,
    brand_id: queryParams.get('brand_id') || undefined,
    category_id: queryParams.get('category_id') || undefined,
    perPage: 20,
    page: 1,
    active: 1,
  };

  useEffect(() => {
    if (data?.shop?.id) {
      dispatch(fetchRestProducts(params));
    }
    return () => {};
    // eslint-disable-next-line
  }, [
    data?.id,
    params?.shop_id,
    params?.search,
    params?.brand_id,
    params?.category_id,
  ]);

  return (
    <Card className='order-add'>
      {orderLoading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <ProductsFilter />
      <Divider />
      <ProductList />
    </Card>
  );
};

export default OrderShopProducts;
