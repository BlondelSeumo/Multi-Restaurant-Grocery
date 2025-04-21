import React from "react";
import cls from "./cartHeader.module.scss";
import { UserCart } from "interfaces";
import useLocale from "hooks/useLocale";

type Props = {
  data: UserCart;
  isOwner: boolean;
};

export default function ProtectedCartHeader({ data, isOwner }: Props) {
  const { t } = useLocale();

  return (
    <div className={cls.header}>
      <h2 className={cls.title}>{isOwner ? t("your.orders") : data.name}</h2>
    </div>
  );
}
