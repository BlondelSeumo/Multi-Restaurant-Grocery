import React from 'react';
import { Card, Col, Row, Spin } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addCalculateProductsBody,
  removeProductFromCalculateProductsBody,
} from 'redux/slices/order';
import RiveResult from 'components/rive-result';
import OrderItem from './components/item';

const createCalculateBody = (item) => {
  return {
    stock_id: item?.stock?.id,
    quantity: item?.quantity,
    addons: item?.addons?.length
      ? item?.addons?.map((addon) => ({
          stock_id: addon?.id,
          quantity: addon?.quantity,
        }))
      : [],
  };
};

const OrderItems = ({ orderLoading }) => {
  const dispatch = useDispatch();

  const { orderItems, data } = useSelector(
    (state) => state.order,
    shallowEqual,
  );

  const handleChangeProductQuantity = (item) => {
    const body = createCalculateBody(item);
    dispatch(addCalculateProductsBody(body));
  };

  const handleDeleteProduct = (item) => {
    const body = createCalculateBody(item);
    dispatch(removeProductFromCalculateProductsBody(body));
  };

  if (!orderItems?.length) {
    return (
      <Card>
        {orderLoading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <RiveResult id='nosell' />
          </Col>
        </Row>
      </Card>
    );
  }

  return (
    <Card>
      {orderLoading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <Row
        gutter={12}
        style={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: '20px',
        }}
      >
        {orderItems?.map((item, index) => (
          <OrderItem
            key={`${item?.id}_${index}`}
            item={item}
            data={data}
            handleChangeProductQuantity={handleChangeProductQuantity}
            handleDeleteProduct={handleDeleteProduct}
          />
        ))}
      </Row>
    </Card>
  );
};

export default OrderItems;
