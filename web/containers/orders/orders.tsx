import React from "react";
import cls from "./orders.module.scss";
import dynamic from "next/dynamic";

const OrdersRefundButton = dynamic(
  () => import("components/ordersRefundButton/ordersRefundButton"),
);
const WalletActionButtons = dynamic(
  () => import("components/walletActionButtons/walletActionButtons"),
);

type Props = {
  title: string;
  children: any;
  refund?: boolean;
  wallet?: boolean;
};

export default function OrdersContainer({
  title,
  children,
  refund,
  wallet,
}: Props) {
  return (
    <section className={cls.root}>
      <div className="container">
        <div className={cls.wrapper}>
          <h1 className={cls.title}>{title}</h1>
          <div className={cls.main}>{children}</div>
          {refund && <OrdersRefundButton />}
          {wallet && <WalletActionButtons />}
        </div>
      </div>
    </section>
  );
}
