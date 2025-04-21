import React, { useState } from "react";
import cls from "./shopOrderNow.module.scss";
import useLocale from "hooks/useLocale";
import { IShop } from "interfaces";
import PrimaryButton from "components/button/primaryButton";
import Price from "components/price/price";
import { useRouter } from "next/router";

type Props = { data: IShop };

export default function ShopOrderNow({ data }: Props) {
  const { t } = useLocale();
  const { push } = useRouter();
  const [deliveryType, handleChangeTypes] = useState("delivery");

  return (
    <div className={cls.wrapper}>
      <h2 className={cls.title}>{t("order.food")}</h2>
      <div className={cls.tabs}>
        <button
          type="button"
          className={`${cls.tab} ${
            deliveryType === "delivery" ? cls.active : ""
          }`}
          onClick={() => handleChangeTypes("delivery")}
        >
          <span className={cls.text}>{t("delivery")}</span>
        </button>
        <button
          type="button"
          className={`${cls.tab} ${
            deliveryType === "pickup" ? cls.active : ""
          }`}
          onClick={() => handleChangeTypes("pickup")}
        >
          <span className={cls.text}>{t("pickup")}</span>
        </button>
      </div>
      {deliveryType === "delivery" ? (
        <div className={cls.infos}>
          <div className={cls.item}>
            <strong>
              <Price number={data.price} />+
            </strong>{" "}
            {t("delivery.fee")}
          </div>
          <div className={cls.dot} />
          <div className={cls.item}>
            <strong>
              {data.delivery_time?.from}-{data.delivery_time?.to}
            </strong>{" "}
            {t("mins")}
          </div>
        </div>
      ) : (
        <div className={cls.infos}>
          <div className={cls.item}>
            <strong>{t("no.fees")}</strong>
          </div>
        </div>
      )}
      {/* <div className={cls.form}>
        <TextInput
          name="delivery_address"
          label={t("delivery.address")}
          placeholder={t("type.here")}
        />
      </div> */}
      <div className={cls.actions}>
        <PrimaryButton onClick={() => push("/", undefined, { shallow: true })}>
          {t("start.order")}
        </PrimaryButton>
      </div>
    </div>
  );
}
