import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import getImage from 'helpers/getImage';
import numberToPrice from 'helpers/numberToPrice';
import { removeFromCart, incrementCart } from 'redux/slices/cart';
import ColumnImage from 'components/column-image';
import { getCartData } from 'redux/selectors/cartSelector';
import Coupon from './coupon';

const CardData = ({ placeOrder, loading }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    total,
    coupons,
    currency,
    cartShops,
    // notes,
    currentBag,
  } = useSelector((state) => state.cart, shallowEqual);
  const data = useSelector((state) => getCartData(state.cart));

  const increment = (item) => {
    if (item.quantity === item?.stockID?.quantity) {
      return;
    }
    if (item.quantity === item.max_qty) {
      return;
    }
    dispatch(incrementCart({ ...item, quantity: 1 }));
  };

  const decrement = (item) => {
    if (item.quantity === 1) {
      return;
    }
    if (item.quantity <= item.min_qty) {
      return;
    }
    dispatch(incrementCart({ ...item, quantity: -1 }));
  };

  const deleteCard = (e) => {
    dispatch(removeFromCart(e));
  };

  return (
    <div className='card-save'>
      {cartShops?.map((shop, idx) => (
        <div key={`${shop?.uuid}_${idx}`}>
          <div className='all-price'>
            <span className='title'>
              {shop?.translation?.title} {t('cart')}
            </span>
            <span className='counter'>
              {`${shop?.products?.length} ${shop?.products?.length > 1 ? t('products') : t('product')}`}
            </span>
          </div>
          {shop?.products?.map((item, index) =>
            !item?.bonus ? (
              <div
                className='custom-cart-container'
                key={`${item?.id}_${index}`}
              >
                <Row className='product-row'>
                  <ColumnImage image={getImage(item?.img)} row={item} />
                  <Col span={18} className='product-col'>
                    <p className='product-name'>{item?.translation?.title}</p>
                    <Space wrap className='mt-2 mb-2'>
                      {item?.stock?.map((el, idy) => {
                        return (
                          <span
                            key={`${idy}_${el?.value}`}
                            className='extras-text rounded pr-2 pl-2'
                          >
                            {el?.value}
                          </span>
                        );
                      })}
                    </Space>
                    <br />
                    <Space wrap className='mt-2 mb-2'>
                      {item?.addons?.map((addon, idk) => {
                        return (
                          <span
                            key={`${idk}_${addon?.quantity}`}
                            className='extras-text rounded pr-2 pl-2'
                          >
                            {`${addon?.product?.translation?.title || t('N/A')} x ${addon?.quantity}`}
                          </span>
                        );
                      })}
                    </Space>
                    <div className='product-counter'>
                      <span>
                        {numberToPrice(
                          item?.total_price ?? item?.price,
                          currency?.symbol,
                          currency?.position,
                        )}
                      </span>

                      <div className='count'>
                        <Button
                          className='button-counter'
                          shape='circle'
                          icon={<MinusOutlined size={14} />}
                          onClick={() => decrement(item)}
                        />
                        <span>
                          {`${(item?.quantity ?? 0) * (item?.interval ?? 1)} ${item?.unit?.translation?.title || t('N/A')}`}
                        </span>
                        <Button
                          className='button-counter'
                          shape='circle'
                          icon={<PlusOutlined size={14} />}
                          onClick={() => increment(item)}
                        />
                        <Button
                          className='button-counter'
                          shape='circle'
                          onClick={() => deleteCard(item)}
                          icon={<DeleteOutlined size={14} />}
                        />
                      </div>
                    </div>
                  </Col>
                  {/*<Col span={24}>*/}
                  {/*  <Input*/}
                  {/*    placeholder={t('note')}*/}
                  {/*    className='w-100 mt-2'*/}
                  {/*    defaultValue={notes[item.stockID.id]}*/}
                  {/*    onBlur={(event) =>*/}
                  {/*      dispatch(*/}
                  {/*        addOrderNotes({*/}
                  {/*          label: item.stockID.id,*/}
                  {/*          value: event.target.value || undefined,*/}
                  {/*        }),*/}
                  {/*      )*/}
                  {/*    }*/}
                  {/*  />*/}
                  {/*</Col>*/}
                </Row>
              </div>
            ) : (
              <>
                <h4 className='mt-2'> {t('bonus.product')} </h4>
                <div
                  className='custom-cart-container'
                  key={`${item.id}_${index}`}
                >
                  <Row className='product-row'>
                    <ColumnImage image={getImage(item?.img)} row={item} />
                    <Col span={18} className='product-col'>
                      <p>
                        {item?.stockID?.product?.translation?.title || t('N/A')}
                      </p>
                      <Space wrap className='mt-2 mb-2'>
                        {item?.stock?.map((el, idj) => {
                          return (
                            <span
                              key={`${idj}_${el?.value}`}
                              className='extras-text rounded pr-2 pl-2'
                            >
                              {el?.value}
                            </span>
                          );
                        })}
                      </Space>
                      <br />
                      <Space wrap className='mt-2 mb-4'>
                        {item?.addons?.map((addon, idp) => {
                          return (
                            <span
                              key={`${idp}_${addon?.quantity}`}
                              className='extras-text rounded pr-2 pl-2'
                            >
                              {`${addon?.product?.translation?.title || t('N/A')} x ${addon?.quantity}`}
                            </span>
                          );
                        })}
                      </Space>
                      <div className='product-counter'>
                        <span>
                          {numberToPrice(
                            item?.total_price ?? item?.price,
                            currency?.symbol,
                            currency?.position,
                          )}
                        </span>
                        <div className='count'>
                          <Button
                            className='button-counter'
                            shape='circle'
                            icon={<MinusOutlined size={14} />}
                            onClick={() => decrement(item)}
                            disabled
                          />
                          <span>
                            {`${(item?.quantity ?? 0) * (item?.stockID?.product?.interval ?? 1)} ${item?.stockID?.product?.unit?.translation?.title || t('N/A')}`}
                          </span>
                          <Button
                            className='button-counter'
                            shape='circle'
                            icon={<PlusOutlined size={14} />}
                            onClick={() => increment(item)}
                            disabled
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </>
            ),
          )}
          <Coupon
            coupons={coupons}
            currentBag={currentBag}
            shopId={data?.shop?.id}
          />
        </div>
      ))}

      <Row className='all-price-row'>
        <Col span={24} className='col'>
          <div className='all-price-container'>
            <span>{t('sub.total')}</span>
            <span>
              {numberToPrice(
                total.product_total,
                currency?.symbol,
                currency?.position,
              )}
            </span>
          </div>
          <div className='all-price-container'>
            <span>{t('shop.tax')}</span>
            <span>
              {numberToPrice(
                total.shop_tax,
                currency?.symbol,
                currency?.position,
              )}
            </span>
          </div>
          <div className='all-price-container'>
            <span>{t('delivery.fee')}</span>
            <span>
              {numberToPrice(
                total.delivery_fee,
                currency?.symbol,
                currency?.position,
              )}
            </span>
          </div>
          <div className='all-price-container'>
            <span>{t('service.fee')}</span>
            <span>
              {numberToPrice(
                total.service_fee,
                currency?.symbol,
                currency?.position,
              )}
            </span>
          </div>
          {!!total?.couponPrice && (
            <div className='all-price-container'>
              <span>{t('coupon')}</span>
              <span style={{ color: 'red' }}>
                -{' '}
                {numberToPrice(
                  total?.couponPrice,
                  currency?.symbol,
                  currency?.position,
                )}
              </span>
            </div>
          )}
          {!!total?.discount && (
            <div className='all-price-container'>
              <span>{t('discount')}</span>
              <span style={{ color: 'red' }}>
                -{' '}
                {numberToPrice(
                  total?.discount,
                  currency?.symbol,
                  currency?.position,
                )}
              </span>
            </div>
          )}
        </Col>
      </Row>

      <Row className='submit-row'>
        <Col span={14} className='col'>
          <span>{t('total.amount')}</span>
          <span>
            {numberToPrice(
              total.order_total,
              currency?.symbol,
              currency?.position,
            )}
          </span>
        </Col>
        <Col className='col2'>
          <Button
            type='primary'
            onClick={placeOrder}
            disabled={!cartShops.length}
            loading={loading}
          >
            {t('place.order')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CardData;
