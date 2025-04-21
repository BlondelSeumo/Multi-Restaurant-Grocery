import { Card, Col, Row, Spin } from 'antd';
import RiveResult from 'components/rive-result';
import React from 'react';
import Meta from 'antd/lib/card/Meta';
import { PlusOutlined } from '@ant-design/icons';
import { BsFillGiftFill } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { useQueryParams } from 'helpers/useQueryParams';
import ProductModal from './productModal';

const ProductList = () => {
  const { t } = useTranslation();
  const queryParams = useQueryParams();

  const { products, loading } = useSelector(
    (state) => state.product,
    shallowEqual,
  );

  const handleOpenProductModal = (uuid) => {
    queryParams.set('uuid', uuid);
  };

  const handleCloseProductModal = () => {
    queryParams.reset('uuid');
  };

  const renderView = () => {
    if (!products?.length) {
      return (
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <RiveResult />
          </Col>
        </Row>
      );
    }
    return products?.map((item) => (
      <Card
        className='products-col'
        key={item?.id}
        cover={
          <img
            alt={item?.translation?.title || t('N/A')}
            src={item?.img || 'https://via.placeholder.com/150'}
          />
        }
        onClick={() => {
          handleOpenProductModal(item?.uuid);
        }}
      >
        <Meta title={item?.translation?.title || t('N/A')} />
        <div className='preview'>
          <PlusOutlined />
        </div>
        {item?.stocks?.map((it) => (
          <span className={it?.bonus ? 'show-bonus' : 'd-none'}>
            <BsFillGiftFill /> {it?.bonus?.value}
            {'+'}
            {it?.bonus?.bonus_quantity}
          </span>
        ))}
      </Card>
    ));
  };
  return (
    <>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <div className='products-row order-items'>{renderView()}</div>
      {!!queryParams.get('uuid') && (
        <ProductModal
          uuid={queryParams.get('uuid')}
          onCancel={handleCloseProductModal}
        />
      )}
    </>
  );
};

export default ProductList;
