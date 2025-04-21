import React, { useState } from 'react';
import { Card, Form, Modal, Spin } from 'antd';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  clearCart,
  setCartShops,
  clearCartShops,
  setCartTotal,
  removeBag,
  setCartOrder,
  clearData,
} from 'redux/slices/cart';
import useDidUpdate from 'helpers/useDidUpdate';
import orderService from 'services/order';
import { useTranslation } from 'react-i18next';
import { getCartData, getCartItems } from 'redux/selectors/cartSelector';
import { toast } from 'react-toastify';
import { fetchPosProducts } from 'redux/slices/pos-system';
import useDebounce from 'helpers/useDebounce';
import transactionService from 'services/transaction';
import QueryString from 'qs';
import { DEMO_ADMIN } from 'configs/app-global';
import moment from 'moment';
import CardData from './cardData';
import Invoice from 'components/invoice';

export default function OrderCart() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { cartItems, currentBag, total, coupons, currency, cartShops, notes } =
    useSelector((state) => state.cart, shallowEqual);
  const filteredCartItems = useSelector((state) => getCartItems(state.cart));
  const data = useSelector((state) => getCartData(state.cart));

  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const debouncedCartItems = useDebounce(cartItems, 300);

  const clearAll = () => {
    batch(() => {
      dispatch(clearCart());
      dispatch(clearData());
      if (currentBag !== 0) {
        dispatch(removeBag(currentBag));
      }
    });
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
      shop_id: data?.shop?.id,
      type: data?.deliveries?.value,
      address: {
        latitude: data?.address?.lat,
        longitude: data?.address?.lng,
      },
    };
    return QueryString.stringify(result, { addQueryPrefix: true });
  };

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
  };

  const handleCloseInvoice = () => {
    clearAll();
    toast.success(t('successfully.closed'));
    dispatch(
      fetchPosProducts({
        perPage: 12,
        currency_id: currency?.id,
        shop_id: data?.shop?.id || DEMO_ADMIN,
        status: 'published',
      }),
    );
    setOrderId(null);
  };

  useDidUpdate(() => {
    dispatch(
      fetchPosProducts({
        perPage: 12,
        currency_id: currency?.id,
        shop_id: data?.shop?.id || DEMO_ADMIN,
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
    currency,
    data?.deliveries?.value,
    coupons?.find((item) => item?.bag_id === currentBag && item?.verified)
      ?.recalculate,
  ]);

  const createTransaction = (id, data) => {
    transactionService
      .create(id, data)
      .then((res) => handleSave(res?.data?.id))
      .finally(() => setLoading(false));
  };

  const handleCreateOrder = () => {
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
    if (!data.paymentType) {
      toast.warning(t('please.select.payment_type'));
      return;
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
      shop_id: data?.shop?.id,
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
      shop_id: data?.shop?.id,
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
      .catch((err) => console.error('Error in order creation: ', err))
      .finally(() => setLoading(false));
  };

  return (
    <Card>
      {loading && (
        <div className='loader'>
          <Spin />
        </div>
      )}
      <CardData placeOrder={handleCreateOrder} loading={loading} />
      {!!orderId && (
        <Modal
          visible={!!orderId}
          footer={null}
          onCancel={handleCloseInvoice}
          width={1000}
        >
          <Invoice id={orderId} role='admin' />
        </Modal>
      )}
    </Card>
  );
}
