import React from "react";
import cls from "./cart.module.scss";
import CartServices from "components/cartServices/cartServices";
import EmptyCart from "components/emptyCart/emptyCart";
import { UserCart } from "interfaces";
import { useQuery } from "react-query";
import cartService from "services/cart";
import Loading from "components/loader/loading";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  clearUserCart,
  selectUserCart,
  updateUserCart,
} from "redux/slices/userCart";
import { useShop } from "contexts/shop/shop.context";
import MemberCartHeader from "components/cartHeader/memberCartHeader";
import MemberCartProduct from "components/cartProduct/memberCartProduct";
import MemberCartTotal from "components/cartTotal/memberCartTotal";
import { warning } from "components/alert/toast";
import { useTranslation } from "react-i18next";
import { selectCurrency } from "redux/slices/currency";
import TopMemberCartHeader from "components/topCartHeader/topMemberCartHeader";

export default function MemberCart() {
  const { t } = useTranslation();
  const cart = useAppSelector(selectUserCart);
  const dispatch = useAppDispatch();
  const isEmpty = !cart?.user_carts?.some((item) => item.cartDetails.length);
  const { member, clearMember } = useShop();
  const currency = useAppSelector(selectCurrency);

  const { isLoading } = useQuery(
    ["cart", member, currency?.id],
    () =>
      cartService.guestGet(member?.cart_id || 0, {
        shop_id: member?.shop_id,
        user_cart_uuid: member?.uuid,
        currency_id: currency?.id,
      }),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      onError: () => {
        dispatch(clearUserCart());
        clearMember();
        warning(t("you.kicked.from.group"), {
          toastId: "group_order_finished",
        });
      },
      enabled: !!member?.cart_id,
      retry: false,
    },
  );

  return (
    <div className={cls.container}>
      <div className="layout-container">
        {/* if you need fluid container, just remove this div */}
        <TopMemberCartHeader />
        <div className="container">
          <div className={cls.wrapper}>
            <div className={cls.body}>
              {cart?.user_carts?.map((item: UserCart) => (
                <div
                  key={"user" + item.id}
                  className={cls.itemsWrapper}
                  style={{
                    display: item.cartDetails.length ? "block" : "none",
                  }}
                >
                  <MemberCartHeader data={item} cart={cart} />
                  {item.cartDetails.map((el) => (
                    <MemberCartProduct
                      key={"c" + el.id + "q" + el.quantity}
                      data={el}
                      cartId={item.cart_id || 0}
                      disabled={item.uuid !== member?.uuid}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className={cls.details}>
              {isEmpty && !isLoading ? (
                <div className={cls.empty}>
                  <EmptyCart />
                </div>
              ) : (
                <div className={cls.float}>
                  {!isEmpty && <CartServices />}
                  {!isEmpty && (
                    <MemberCartTotal totalPrice={cart.total_price} />
                  )}
                </div>
              )}
            </div>
            {isLoading && <Loading />}
          </div>
        </div>
      </div>
    </div>
  );
}
