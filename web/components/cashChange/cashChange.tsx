import { FormikProps } from "formik";
import { OrderFormValues } from "interfaces";
import cls from "./cashChange.module.scss";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import Price from "components/price/price";
import TextInput from "components/inputs/textInput";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "components/button/primaryButton";
import { warning } from "components/alert/toast";
import DarkButton from "components/button/darkButton";

type Props = {
  formik: FormikProps<OrderFormValues>;
  totalPrice?: number;
  onContinue?: () => void;
  onClose?: () => void;
};

export default function CashChange({
  formik,
  onContinue,
  onClose,
  totalPrice = 0,
}: Props) {
  const { t } = useTranslation();
  const { cash_change } = formik.values;
  const [selectedType, setSelectedType] = useState(
    cash_change ? "not_exact" : "exact",
  );
  const handleSelect = (type: "exact" | "not_exact") => {
    switch (type) {
      case "exact":
        formik.setFieldValue("cash_change", undefined);
        setSelectedType("exact");
        break;
      case "not_exact":
        setSelectedType("not_exact");
        break;

      default:
        break;
    }
  };

  const handleContinue = () => {
    if (
      selectedType === "not_exact" &&
      cash_change &&
      cash_change <= totalPrice
    ) {
      warning(t("cash.change.should.be.more.than.total.price"));
      return;
    }
    if (onClose) {
      onClose();
    }
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className={cls.container}>
      <h1 className={cls.title}>{t("cash.on.delivery")}</h1>
      <button
        type="button"
        className={cls.item}
        onClick={() => handleSelect("exact")}
      >
        <span
          className={`${cls.icon} ${selectedType === "exact" && cls.active}`}
        >
          {selectedType === "exact" ? (
            <CheckboxCircleFillIcon size={20} />
          ) : (
            <CheckboxBlankCircleLineIcon size={20} />
          )}
        </span>
        <div className={cls.info}>
          <span className={cls.title}>
            {t("I.have.exactly")} <Price number={totalPrice} />
          </span>
          <span className={cls.description}>
            {t("courier.will.not.give.any.change.back.to.you")}
          </span>
        </div>
      </button>
      <button
        type="button"
        className={cls.item}
        onClick={() => handleSelect("not_exact")}
      >
        <span
          className={`${cls.icon} ${selectedType === "not_exact" && cls.active}`}
        >
          {selectedType === "not_exact" ? (
            <CheckboxCircleFillIcon size={20} />
          ) : (
            <CheckboxBlankCircleLineIcon size={20} />
          )}
        </span>
        <div className={cls.info}>
          <span className={cls.title}>{t("I.do.not.have.exact.amount")}</span>
          <span className={cls.description}>{t("enter.amount.you.have")}</span>
        </div>
      </button>
      {selectedType === "not_exact" && (
        <TextInput
          name="cash_change"
          label={t("amount")}
          onChange={(e) => {
            const value = e.target.value.replace(/^0+(?=\d)/, "");
            formik.setFieldValue(
              "cash_change",
              value ? Number(value) : undefined,
            );
          }}
          value={cash_change}
          type="number"
        />
      )}
      <div className={cls.footer}>
        <DarkButton
          onClick={() => {
            if (onClose) {
              onClose();
            }
          }}
        >
          {t("cancel")}
        </DarkButton>
        <PrimaryButton onClick={handleContinue}>{t("continue")}</PrimaryButton>
      </div>
    </div>
  );
}
