import React from "react";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { numberToPrice } from "utils/numberToPrice";

type Props = {
  number?: number;
  minus?: boolean;
  plus?: boolean;
  symbol?: string;
  digits?: number;
  old?: boolean;
  position?: "before" | "after";
};

export default function Price({
  number = 0,
  minus,
  symbol,
  plus,
  digits,
  old,
  position,
}: Props) {
  const currency = useAppSelector(selectCurrency);
  const currencyPosition = position || currency?.position || "before";
  const currencySymbol = symbol || currency?.symbol || "$";

  return (
    <span className={`${minus ? "red" : ""} ${old ? "strike" : ""}`}>
      {minus ? "-" : ""}
      {plus ? "+" : ""}
      {currencyPosition === "before" ? currencySymbol : ""}
      {numberToPrice(number, digits)}{" "}
      {currencyPosition === "after" ? currencySymbol : ""}
    </span>
  );
}
