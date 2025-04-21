import React from "react";
import cls from "./shopPageContainer.module.scss";
import { IShop } from "interfaces";
import ShopLocationHours from "components/shopLocationHours/shopLocationHours";
import ShopOrderNow from "components/shopOrderNow/shopOrderNow";
import ShopReview from "containers/shopReview/shopReview";

type Props = {
  data: IShop;
};

export default function ShopPageContainer({ data }: Props) {
  return (
    <div className="container">
      <div className={cls.wrapper}>
        <main className={cls.main}>
          <ShopLocationHours data={data} />
          <ShopReview />
        </main>
        <aside className={cls.aside}>
          <ShopOrderNow data={data} />
        </aside>
      </div>
    </div>
  );
}
