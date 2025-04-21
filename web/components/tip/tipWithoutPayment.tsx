import React, { useState } from "react";
import { tipPercents } from "constants/tips";
import Price from "components/price/price";
import { percentToPrice } from "utils/calculatePercentTipToPrice";
import Edit2FillIcon from "remixicon-react/Edit2FillIcon";
import { useTranslation } from "react-i18next";
import { Currency } from "interfaces";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import cls from "./tip.module.scss";

type Props = {
  totalPrice: number;
  currency: Currency | null;
  handleAddTips: (tips: number) => void;
};

export default function TipWithoutPayment({
  totalPrice,
  currency,
  handleAddTips,
}: Props) {
  const { t } = useTranslation();

  const [selectedTip, setSelectedTip] = useState<number | "custom">(
    tipPercents[0],
  );
  const [customTip, setCustomTip] = useState<string>("");

  const disabledSubmitButton =
    selectedTip === "custom" ? !customTip?.length : !selectedTip;

  const handleSubmit = () => {
    const tips =
      selectedTip === "custom"
        ? Number(customTip)
        : percentToPrice(totalPrice, selectedTip);
    handleAddTips(tips);
  };

  return (
    <div className={cls.wrapper}>
      <h2 className={cls.title}>{t("would.you.like.to.add.a.tip")}?</h2>
      <div className={cls.body}>
        {tipPercents.map((percent) => (
          <button
            className={
              percent === selectedTip
                ? `${cls.item} ${cls.selectedItem}`
                : cls.item
            }
            key={percent}
            onClick={() => setSelectedTip(percent)}
          >
            <span className={cls.percent}>{percent}%</span>
            <span className={cls.price}>
              <Price
                number={percentToPrice(percent, totalPrice)}
                symbol={currency?.symbol}
              />
            </span>
          </button>
        ))}
        <button
          className={`${cls.item} ${
            selectedTip === "custom" ? cls.selectedItem : ""
          }`}
          onClick={() => setSelectedTip("custom")}
        >
          <Edit2FillIcon size={20} />
          <span className={cls.price}>{t("custom")}</span>
        </button>
      </div>
      {selectedTip === "custom" && (
        <div className={cls.customTip}>
          <TextInput
            name="customTip"
            label={`${t("custom.tip")} (${currency?.symbol || "$"})`}
            placeholder={t("type.here")}
            type="number"
            value={customTip}
            inputProps={{
              pattern: "[0-9]*",
            }}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 0) {
                return;
              }
              setCustomTip(e.target.value);
            }}
          />
        </div>
      )}
      <div className={cls.footer}>
        <div
          className={`${cls.btnWrapper} ${
            disabledSubmitButton ? cls.btnWrapperDisabled : ""
          }`}
        >
          <PrimaryButton
            type="submit"
            disabled={disabledSubmitButton}
            onClick={handleSubmit}
          >
            {t("submit")}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
