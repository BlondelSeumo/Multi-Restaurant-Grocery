import React from "react";
import cls from "./cartHeader.module.scss";
import { CartType, UserCart } from "interfaces";
import { useShop } from "contexts/shop/shop.context";
import useLocale from "hooks/useLocale";

type Props = {
  data: UserCart;
  cart: CartType;
};

export default function MemberCartHeader({ data, cart }: Props) {
  const { t } = useLocale();
  const { member } = useShop();

  return (
    <div className={cls.header}>
      <h2 className={cls.title}>
        {data.uuid === member?.uuid ? t("your.orders") : data.name}
        {data.user_id === cart.owner_id ? ` (${t("owner")})` : ""}
      </h2>
    </div>
  );
}
