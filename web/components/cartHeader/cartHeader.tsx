import React from "react";
import cls from "./cartHeader.module.scss";
import useLocale from "hooks/useLocale";

type Props = {};

export default function CartHeader({}: Props) {
  const { t } = useLocale();

  return (
    <div className={cls.header}>
      <h2 className={cls.title}>{t("your.orders")}</h2>
    </div>
  );
}
