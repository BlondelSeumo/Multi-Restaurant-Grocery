import React, { useState } from 'react';
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Modal, Row, Space, Spin } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  clearCart,
  removeFromCart,
  setCartShops,
  clearCartShops,
  setCartTotal,
  removeBag,
  clearData,
  incrementCart,
  setCartOrder,
} from 'redux/slices/cart';
import getImage from 'helpers/getImage';
import useDidUpdate from 'helpers/useDidUpdate';
import orderService from 'services/seller/order';
import { useTranslation } from 'react-i18next';
import numberToPrice from 'helpers/numberToPrice';
import { getCartData, getCartItems } from 'redux/selectors/cartSelector';
import { toast } from 'react-toastify';
import { fetchSellerProducts } from 'redux/slices/product';
import transactionService from 'services/transaction';
import QueryString from 'qs';
import ColumnImage from 'components/column-image';
import moment from 'moment';
import useDebounce from 'helpers/useDebounce';
import Coupon from './coupon';
import Invoice from 'components/invoice';

export default function OrderCart() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { cartItems, cartShops, currentBag, total, coupons, currency, notes } =
    useSelector((state) => state.cart, shallowEqual);
  const { myShop: shop } = useSelector((state) => state.myShop, shallowEqual);
  const filteredCartItems = useSelector((state) => getCartItems(state.cart));
  const data = useSelector((state) => getCartData(state.cart));

  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const debouncedCartItems = useDebounce(cartItems, 300);

  const deleteCard = (e) => dispatch(removeFromCart(e));

  const clearAll = () => {
    batch(() => {
      dispatch(clearCart());
      dispatch(clearData());
      if (currentBag !== 0) {
        dispatch(removeBag(currentBag));
      }
    });
  };

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

  const formatProducts = (list) => {
    const products = list.map((item) => ({
      quantity: item.quantity,
      stock_id: item.stockID ? item.stockID?.id : item.stock?.id,
      addons: item?.addons?.length
        ? item?.addons?.map((addon) => ({
            quantity: addon?.quantity,
            stock_id: addon?.stockID,
          }))
        : undefined,
    }));

    const result = {
      products,
      currency_id: currency?.id,
      coupon:
        coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
          ?.coupon || undefined,
      shop_id: shop?.id,
      type: data?.deliveries?.value,
      address: {
        latitude: data?.address?.lat,
        longitude: data?.address?.lng,
      },
    };
    return QueryString.stringify(result, { addQueryPrefix: true });
  };

  useDidUpdate(() => {
    dispatch(
      fetchSellerProducts({
        perPage: 12,
        currency_id: currency?.id,
        status: 'published',
      }),
    );
    if (filteredCartItems.length) {
      productCalculate();
    }
  }, [currency]);

  useDidUpdate(() => {
    if (filteredCartItems.length) {
      productCalculate();
    } else {
      dispatch(clearCartShops());
    }
  }, [
    debouncedCartItems,
    currentBag,
    data?.address,
    data?.deliveries?.value,
    coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
      ?.recalculate,
  ]);

  const productCalculate = () => {
    const products = formatProducts(filteredCartItems);

    setLoading(true);
    orderService
      .calculate(products)
      .then(({ data }) => {
        const product = data.data;
        const items = product.stocks.map((item) => ({
          ...filteredCartItems.find((el) => el.id === item.id),
          ...item,
          ...item?.stock?.countable,
          stock: item?.stock?.stock_extras,
          stocks: item?.stock?.stock_extras,
          stockID: item?.stock,
        }));
        const orderData = {
          product_total: product?.price,
          shop_tax: product?.total_shop_tax,
          order_total: product?.total_price,
          delivery_fee: product?.delivery_fee,
          service_fee: product?.service_fee,
          couponOBJ: product?.coupon,
          couponPrice: product?.coupon_price,
          discount: product?.total_discount,
        };
        batch(() => {
          dispatch(setCartShops([{ ...data?.shop, products: items }]));
          dispatch(setCartTotal(orderData));
        });
      })
      .finally(() => setLoading(false));
  };

  const handleSave = (id) => {
    setOrderId(id);
    dispatch(
      fetchSellerProducts({
        perPage: 12,
        currency_id: currency?.id,
        status: 'published',
      }),
    );
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    clearAll();
    toast.success(t('successfully.closed'));
  };

  const handleCreateOrder = () => {
    if (!data.paymentType) {
      toast.warning(t('please.select.payment_type'));
      return;
    }
    if (data?.deliveries?.value === 'dine_in') {
      if (!data?.deliveryZone?.value) {
        toast.warning(t('please.select.delivery.zone'));
        return;
      }
      if (!data?.table?.value) {
        toast.warning(t('please.select.table'));
        return;
      }
    }
    if (data?.deliveries?.value === 'delivery' && !data?.address) {
      toast.warning(t('please.select.address'));
      return;
    }
    if (data?.deliveries?.value === 'delivery' && !data.delivery_date) {
      toast.warning(t('please.select.deliveryDate'));
      return;
    }
    if (data?.deliveries?.value === 'delivery' && !data.delivery_time) {
      toast.warning(t('please.select.delivery_time'));
      return;
    }
    const products = cartShops?.flatMap((item) =>
      item?.products?.map((product) => ({
        stock_id: product?.stockID?.id,
        quantity: product?.quantity,
        bonus: product?.bonus ? product?.bonus : undefined,
        note: notes[product?.stockID?.id] || undefined,
        addons: product?.addons?.map((addon) => ({
          stock_id: addon?.id,
          quantity: addon?.quantity,
        })),
      })),
    );
    const deliveryBody = {
      user_id: data?.user?.value,
      currency_id: currency?.id,
      rate: currency?.rate,
      shop_id: shop?.id,
      delivery_id: data?.deliveries?.value,
      coupon:
        coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
          ?.coupon || undefined,
      tax: total.order_tax,
      payment_type: data?.paymentType?.value,
      delivery_date: data?.delivery_date,
      delivery_address_id: data?.address?.address,
      address: {
        address: data?.address?.address,
        office: '',
        house: '',
        floor: '',
      },
      location: {
        latitude: data?.address?.lat,
        longitude: data?.address?.lng,
      },
      delivery_time: data?.delivery_time
        ? moment(data?.delivery_time, 'HH:mm').format('HH:mm')
        : undefined,
      delivery_type: data?.deliveries?.value,
      delivery_type_id: data?.deliveries?.key,
      phone: data?.phone?.toString(),
      products,
    };

    const pickupAndDineInBody = {
      currency_id: currency?.id,
      rate: currency?.rate,
      shop_id: shop?.id,
      coupon:
        coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
          ?.coupon || undefined,
      tax: total.order_tax,
      payment_type: data?.paymentType?.value,
      delivery_id: data?.deliveries?.value,
      delivery_type: data?.deliveries?.value,
      delivery_type_id: data?.deliveries?.key,
      table_id: data?.table?.value || undefined,
      products,
    };

    const body =
      data?.deliveries?.value === 'delivery'
        ? deliveryBody
        : pickupAndDineInBody;

    const payment = {
      payment_sys_id: data.paymentType.key,
    };

    setLoading(true);

    orderService
      .create(body)
      .then((response) => {
        dispatch(setCartOrder(response.data));
        createTransaction(response.data.id, payment);
        form.resetFields();
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createTransaction = (id, data) => {
    transactionService
      .create(id, data)
      .then((res) => {
        handleSave(res.data.id);
        form.resetFields();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Card>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <div className='card-save'>
        {cartShops?.map((shop, idx) => (
          <div key={`${shop?.uuid}_${idx}`}>
            <div className='all-price'>
              <span className='title'>{t('cart')}</span>
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
                          {item?.stockID?.product?.translation?.title ||
                            t('N/A')}
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
            <Coupon coupons={coupons} currentBag={currentBag} />
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
              onClick={handleCreateOrder}
              disabled={!cartShops.length}
              loading={loading}
            >
              {t('place.order')}
            </Button>
          </Col>
        </Row>
      </div>
      {!!orderId && (
        <Modal
          visible={!!orderId}
          footer={null}
          onCancel={handleCloseInvoice}
          width={1000}
        >
          <Invoice id={orderId} role='seller' />
        </Modal>
      )}
    </Card>
  );
}
