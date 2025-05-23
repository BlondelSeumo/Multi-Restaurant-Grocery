import React from "react";
import cls from "./orderProductItem.module.scss";
import getImage from "utils/getImage";
import Price from "components/price/price";
import { Order, OrderDetailsType } from "interfaces";
import { useTranslation } from "react-i18next";
import calculateOrderProductTotal from "utils/calculateOrderProductTotal";
import FallbackImage from "components/fallbackImage/fallbackImage";

type Props = {
  data: OrderDetailsType;
  order: Order;
};

export default function OrderProductItem({ data, order }: Props) {
  const { t } = useTranslation();
  const { addonsTotal, totalPrice, oldPrice } =
    calculateOrderProductTotal(data);

  const interval = data?.stock?.product?.interval
    ? data?.stock?.product?.interval
    : 1;

  const unit =
    data?.stock?.product?.unit && data?.stock?.product?.unit?.active
      ? data?.stock?.product?.unit
      : null;

  return (
    <div className={cls.row}>
      <div className={cls.col}>
        <h4 className={cls.title}>
          {data.stock?.product.translation?.title}
          {data.stock?.extras
            ? data.stock.extras.map((item, idx) => (
                <span key={"extra" + idx}>({item.value})</span>
              ))
            : ""}
          {!!data.bonus && <span className={cls.red}> {t("bonus")}</span>}
        </h4>
        <p className={cls.desc}>
          {data.addons
            .map(
              (item) =>
                item.stock.product?.translation?.title +
                " x " +
                item.quantity * (item?.stock?.product?.interval ?? 1),
            )
            .join(", ")}
        </p>
        <div className={cls.priceContainer}>
          <div className={cls.price}>
            <Price
              number={data.stock.total_price}
              symbol={order.currency?.symbol}
            />{" "}
            x{" "}
            {unit?.position === "before" && (
              <div
                className={cls.unit}
              >{`( ${unit?.translation?.title} )`}</div>
            )}
            {data.quantity * interval}
            {unit?.position === "after" && (
              <div
                className={cls.unit}
              >{`( ${unit?.translation?.title} )`}</div>
            )}
            <span className={cls.additionalPrice}>
              <Price
                number={addonsTotal}
                symbol={order.currency?.symbol}
                plus
              />
            </span>
          </div>
          <div className={cls.price}>
            {!!data.discount && (
              <span className={cls.oldPrice}>
                <Price
                  number={oldPrice}
                  symbol={order.currency?.symbol}
                  position={order?.currency?.position}
                  old
                />
              </span>
            )}
            <Price
              number={totalPrice}
              symbol={order.currency?.symbol}
              position={order?.currency?.position}
            />
          </div>
        </div>
      </div>
      <div className={cls.imageWrapper}>
        <FallbackImage
          fill
          src={getImage(data.stock?.product.img)}
          alt={data.stock?.product.translation?.title}
          sizes="320px"
          quality={90}
        />
      </div>
      {data?.note && (
        <div className={cls.productNote}>
          {t("note")}: {data?.note}
        </div>
      )}
    </div>
  );
}
