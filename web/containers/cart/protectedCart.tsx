import React from "react";
import cls from "./cart.module.scss";
import CartServices from "components/cartServices/cartServices";
import CartTotal from "components/cartTotal/cartTotal";
import EmptyCart from "components/emptyCart/emptyCart";
import { UserCart } from "interfaces";
import ProtectedCartProduct from "components/cartProduct/protectedCartProduct";
import ProtectedCartHeader from "components/cartHeader/protectedCartHeader";
import { useQuery } from "react-query";
import cartService from "services/cart";
import Loading from "components/loader/loading";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  clearUserCart,
  selectUserCart,
  updateUserCart,
  selectCartLoading,
} from "redux/slices/userCart";
import { selectCurrency } from "redux/slices/currency";
import TopProtectedCartHeader from "components/topCartHeader/topProtectedCartHeader";

export default function ProtectedCart() {
  const userCart = useAppSelector(selectUserCart);
  const userCartLoading = useAppSelector(selectCartLoading);
  const dispatch = useAppDispatch();
  const isEmpty = !userCart?.user_carts?.some(
    (item) => item.cartDetails.length,
  );
  const currency = useAppSelector(selectCurrency);

  const { isLoading } = useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      onError: () => dispatch(clearUserCart()),
      retry: false,
      refetchInterval: userCart.group ? 5000 : false,
      refetchOnWindowFocus: Boolean(userCart.group),
      staleTime: 0,
      enabled: !!userCart.group,
    },
  );

  return (
    <div className={cls.container}>
      <div className="layout-container">
        {/* if you need fluid container, just remove this div */}
        <TopProtectedCartHeader />
        <div className="container">
          <div className={cls.wrapper}>
            <div className={cls.body}>
              {userCartLoading ? (
                <Loading />
              ) : (
                userCart?.user_carts?.map((item: UserCart) => (
                  <div
                    key={"user" + item.id}
                    className={cls.itemsWrapper}
                    style={{
                      display: item.cartDetails.length ? "block" : "none",
                    }}
                  >
                    {!!userCart.group && (
                      <ProtectedCartHeader
                        data={item}
                        isOwner={item.user_id === userCart.owner_id}
                      />
                    )}
                    {item.cartDetails.map((el) => (
                      <ProtectedCartProduct
                        key={"c" + el.id + "q" + el.quantity}
                        data={el}
                        cartId={item.cart_id || 0}
                        disabled={item.user_id !== userCart.owner_id}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
            <div className={cls.details}>
              {isEmpty && !isLoading ? (
                <div className={cls.empty}>
                  <EmptyCart />
                </div>
              ) : (
                <div className={cls.float}>
                  {!isEmpty && <CartServices />}
                  {!isEmpty && <CartTotal totalPrice={userCart.total_price} />}
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
