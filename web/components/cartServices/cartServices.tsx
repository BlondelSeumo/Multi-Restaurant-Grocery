import React from "react";
import cls from "./cartServices.module.scss";
import Price from "components/price/price";
import { selectCurrency } from "redux/slices/currency";
import { useAppSelector } from "hooks/useRedux";
import { useBranch } from "contexts/branch/branch.context";
import { selectUserCart } from "redux/slices/userCart";
import useLocale from "hooks/useLocale";

type Props = {
  deliveryFee?: number;
  totalTax?: number;
  serviceFee?: number;
  totalCalcDiscount?: number;
  subTotal?: number
};

export default function CartServices({
  totalCalcDiscount,
  totalTax,
  serviceFee,
  deliveryFee,
  subTotal
}: Props) {
  const { t } = useLocale();
  const currency = useAppSelector(selectCurrency);
  const { branch } = useBranch();
  const cart = useAppSelector(selectUserCart);

  const totalDiscount = cart?.user_carts.reduce((total, userCart) => {
    const userCartDiscount = userCart?.cartDetails?.reduce(
      (userTotal, item) => {
        const discount = item?.discount || 0;
        return (userTotal += discount);
      },
      0
    );

    return (total += userCartDiscount);
  }, 0);

  const discount = cart?.receipt_discount
    ? cart?.receipt_discount + totalDiscount
    : totalDiscount;

  return (
    <div className={cls.wrapper}>
       {!!subTotal && (
        <div className={cls.flex}>
          <div className={cls.item}>
            <div className={cls.row}>
              <h5 className={cls.title}>{t("sub.total")}</h5>
            </div>
          </div>
          <div className={cls.price}>
            <Price number={subTotal} />
          </div>
        </div>
      )}
      <div className={cls.flex}>
        <div className={cls.item}>
          <div className={cls.row}>
            <h5 className={cls.title}>{t("discount")}</h5>
            {!!cart.receipt_discount && (
              <p className={cls.text}>{t("recipe.discount.definition")}</p>
            )}
          </div>
        </div>
        <div className={cls.price}>
          <Price number={totalCalcDiscount ?? discount} minus />
        </div>
      </div>
      {!!deliveryFee && (
        <div className={cls.flex}>
          <div className={cls.item}>
            <div className={cls.row}>
              <h5 className={cls.title}>{t("delivery")}</h5>
            </div>
          </div>
          <div className={cls.price}>
            <Price number={deliveryFee} />
          </div>
        </div>
      )}
       {!!totalTax && (
        <div className={cls.flex}>
          <div className={cls.item}>
            <div className={cls.row}>
              <h5 className={cls.title}>{t("total.shop.tax")}</h5>
            </div>
          </div>
          <div className={cls.price}>
            <Price number={totalTax} />
          </div>
        </div>
      )}
       {!!serviceFee && (
        <div className={cls.flex}>
          <div className={cls.item}>
            <div className={cls.row}>
              <h5 className={cls.title}>{t("service.fee")}</h5>
            </div>
          </div>
          <div className={cls.price}>
            <Price number={serviceFee} />
          </div>
        </div>
      )}
    </div>
  );
}
