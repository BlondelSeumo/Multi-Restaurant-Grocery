import { Card, Col, Divider, Row, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import numberToPrice from 'helpers/numberToPrice';
import React, { useCallback } from 'react';

const TotalPrices = ({ loading }) => {
  const { t } = useTranslation();
  const { data, totalPrices } = useSelector(
    (state) => state.order,
    shallowEqual,
  );
  const numberToPriceLocal = useCallback(
    (price = 0) =>
      numberToPrice(price, data?.currency?.symbol, data?.currency?.position),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.id],
  );
  return (
    <Card>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <Row gutter={12}>
        <Col span={24}>
          <div className='flex'>
            <h4 style={{ fontSize: '16px' }}>{t('sub.total')}</h4>
            <h4 style={{ fontSize: '16px' }}>
              {numberToPriceLocal(totalPrices?.price)}
            </h4>
          </div>
          <div className='flex'>
            <h4 style={{ fontSize: '16px' }}>{t('shop.tax')}</h4>
            <h4 style={{ fontSize: '16px' }}>
              {numberToPriceLocal(totalPrices?.total_shop_tax)}
            </h4>
          </div>
          <div className='flex'>
            <h4 style={{ fontSize: '16px' }}>{t('delivery.fee')}</h4>
            <h4 style={{ fontSize: '16px' }}>
              {numberToPriceLocal(totalPrices?.delivery_fee)}
            </h4>
          </div>
          <div className='flex'>
            <h4 style={{ fontSize: '16px' }}>{t('service.fee')}</h4>
            <h4 style={{ fontSize: '16px' }}>
              {numberToPriceLocal(totalPrices?.service_fee)}
            </h4>
          </div>
          <div className='flex'>
            <h4 style={{ fontSize: '16px' }}>{t('discount')}</h4>
            <h4 style={{ fontSize: '16px', color: 'orangered' }}>
              {`- ${numberToPriceLocal(totalPrices?.total_discount)}`}
            </h4>
          </div>
          <div className='flex'>
            <h4 style={{ fontSize: '16px' }}>{t('coupon')}</h4>
            <h4 style={{ fontSize: '16px', color: 'orangered' }}>
              {`- ${numberToPriceLocal(totalPrices?.coupon_price)}`}
            </h4>
          </div>
          <Divider />
          <div className='flex'>
            <h3 style={{ fontSize: '18px' }}>{t('total.price')}</h3>
            <h3 style={{ fontSize: '18px' }}>
              {numberToPriceLocal(totalPrices?.total_price)}
            </h3>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TotalPrices;
