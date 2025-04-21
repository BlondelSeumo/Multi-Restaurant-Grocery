import React from "react";
import cls from "./cartButton.module.scss";
import ShoppingBag3LineIcon from "remixicon-react/ShoppingBag3LineIcon";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "hooks/useRedux";
import { selectCart, selectTotalPrice } from "redux/slices/cart";
import { selectCartLoading, selectUserCart } from "redux/slices/userCart";
import Price from "components/price/price";
import CartButtonLoader from "components/loader/cartButtonLoader";

type Props = {
  handleClick: () => void;
};

export default function CartButton({ handleClick }: Props) {
  const { t } = useTranslation();
  const cart = useAppSelector(selectCart);
  const cartTotalPrice = useAppSelector(selectTotalPrice);
  const userCart = useAppSelector(selectUserCart);
  const userCartLoading = useAppSelector(selectCartLoading);

  if (cart.length) {
    return (
      <button onClick={handleClick} className={cls.cartBtnWrapper}>
        <div className={cls.cartBtn}>
          <ShoppingBag3LineIcon />
          <div className={cls.text}>
            {!userCartLoading ? (
              <>
                <span>{t("order")}</span>{" "}
                <span className={cls.price}>
                  <Price number={userCart.total_price || cartTotalPrice} />
                </span>
              </>
            ) : (
              <CartButtonLoader size={20} clsnm={cls.loader} />
            )}
          </div>
        </div>
      </button>
    );
  } else {
    return <div></div>;
  }
}
