import React from "react";
import { useTranslation } from "react-i18next";
import RadioInput from "components/inputs/radioInput";
import cls from "./paymentMethod.module.scss";
import { FormikProps } from "formik";
import { OrderFormValues, Payment } from "interfaces";

type Props = {
  formik: FormikProps<OrderFormValues>;
  list: Payment[];
  handleClose: () => void;
};

export default function PaymentMethod({ formik, list, handleClose }: Props) {
  const { t } = useTranslation();

  const handleSubmit = (event: string) => {
    const payment = list.find((item) => item.tag === event);
    formik.setFieldValue("payment_type", payment);
    handleClose();
  };

  const controlProps = (item: string) => ({
    checked: formik.values.payment_type?.tag === item,
    value: item,
    id: item,
    name: "payment_method",
    inputProps: { "aria-label": item },
  });

  return (
    <div className={cls.wrapper}>
      <div className={cls.body}>
        {list.map((item) => (
          <button
            onClick={() => handleSubmit(item?.tag)}
            key={item.id}
            className={cls.row}
          >
            <RadioInput {...controlProps(item.tag)} />
            <label className={cls.label} htmlFor={item.tag}>
              <span className={cls.text}>{t(item.tag)}</span>
            </label>
          </button>
        ))}
      </div>
    </div>
  );
}
