import React from "react";
import cls from "./cart.module.scss";
import CartProduct from "components/cartProduct/cartProduct";
import CartServices from "components/cartServices/cartServices";
import CartTotal from "components/cartTotal/cartTotal";
import { useAppSelector } from "hooks/useRedux";
import { selectCart, selectTotalPrice } from "redux/slices/cart";
import EmptyCart from "components/emptyCart/emptyCart";
import TopCartHeader from "components/topCartHeader/topCartHeader";
import { useQuery } from "react-query";
import orderService from "services/order";
import { selectCurrency } from "redux/slices/currency";
import { useSettings } from "contexts/settings/settings.context";
import Loading from "components/loader/loading";

export default function Cart() {
  const cartItems = useAppSelector(selectCart);
  const totalPrice = useAppSelector(selectTotalPrice);
  const currency = useAppSelector(selectCurrency);
  const { address, location } = useSettings();
  const products = cartItems.map((item) => ({
    stock_id: item.stock.id,
    quantity: item.quantity,
    addons: item.addons.map((addon) => ({
      stock_id: addon.stock.id,
      quantity: addon.quantity,
    })),
  }));
  const shopId = cartItems?.[0]?.shop_id;
  const locationArr = location.split(",");
  const latitude = locationArr[0];
  const longitude = locationArr[1];

  const { data, isLoading, isFetching } = useQuery(
    ["calculate", cartItems, shopId, products, location],
    () =>
      orderService.restCalculate({
        currency_id: currency?.id,
        shop_id: shopId,
        products,
        type: "delivery",
        address: { address, latitude, longitude },
      }),
    {
      enabled: cartItems.length > 0,
      keepPreviousData: true,
    },
  );

  const calculateRes = data?.data?.data;

  return (
    <div className={cls.container}>
      <div className="layout-container">
        {/* if you need fluid container, just remove this div */}
        <TopCartHeader />
        <div className="container">
          <div className={cls.wrapper}>
            <div className={cls.body}>
              {isLoading && <Loading />}
              <div
                className={cls.itemsWrapper}
                style={{
                  display: cartItems.length ? "block" : "none",
                }}
              >
                {cartItems.map((item, cartItemIndex) => (
                  <CartProduct
                    key={item.stock.id}
                    totalPrice={
                      calculateRes?.stocks.find(
                        (_: any, resIndex: number) =>
                          cartItemIndex === resIndex,
                      )?.total_price
                    }
                    data={item}
                  />
                ))}
              </div>
            </div>
            <div className={cls.details}>
              {cartItems.length < 1 ? (
                <div className={cls.empty}>
                  <EmptyCart />
                </div>
              ) : (
                <div className={cls.float}>
                  {cartItems.length > 0 && (
                    <CartServices
                      // deliveryFee={calculateRes?.delivery_fee}
                      totalCalcDiscount={calculateRes?.total_discount}
                      // serviceFee={calculateRes?.service_fee}
                      // totalTax={calculateRes?.total_shop_tax}
                      // subTotal={calculateRes?.price}
                    />
                  )}
                  {cartItems.length > 0 && (
                    <CartTotal
                      totalPrice={
                        (calculateRes?.price ?? totalPrice) -
                        (calculateRes?.total_discount ?? 0)
                      }
                      loading={isFetching}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
