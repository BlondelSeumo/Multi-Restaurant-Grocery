import React from "react";
import cls from "./cartButton.module.scss";
import ShoppingBag3LineIcon from "remixicon-react/ShoppingBag3LineIcon";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  clearUserCart,
  selectUserCart,
  updateUserCart,
} from "redux/slices/userCart";
import { useQuery } from "react-query";
import cartService from "services/cart";
import Price from "components/price/price";
import { selectCurrency } from "redux/slices/currency";
import useLocale from "hooks/useLocale";
import { useShop } from "contexts/shop/shop.context";
import { warning } from "components/alert/toast";

type Props = {
  handleClick: () => void;
};

export default function MemberCartButton({ handleClick }: Props) {
  const { t } = useLocale();
  const cart = useAppSelector(selectUserCart);
  const dispatch = useAppDispatch();
  const isEmpty = !cart?.user_carts?.some((item) => item.cartDetails.length);
  const { member, clearMember } = useShop();
  const currency = useAppSelector(selectCurrency);

  useQuery(
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
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );

  if (!isEmpty) {
    return (
      <button onClick={handleClick} className={cls.cartBtnWrapper}>
        <div className={cls.cartBtn}>
          <ShoppingBag3LineIcon />
          <div className={cls.text}>
            <span>{t("order")}</span>{" "}
            <span className={cls.price}>
              <Price number={cart.total_price} />
            </span>
          </div>
        </div>
      </button>
    );
  } else {
    return <div></div>;
  }
}
