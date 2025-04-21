import React from "react";
import RadioInput from "components/inputs/radioInput";
import cls from "./shopSorting.module.scss";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  selectProductFilter,
  setProductSorting,
} from "redux/slices/productFilter";
import useLocale from "hooks/useLocale";

const sortingList = [
  {
    label: "recommended",
    value: "trust_you",
  },
  {
    label: "best_sale",
    value: "best_sale",
  },
  {
    label: "low_sale",
    value: "low_sale",
  },
];

type Props = {
  handleClose: () => void;
};

export default function ProductSorting({ handleClose }: Props) {
  const { t } = useLocale();
  const { order_by } = useAppSelector(selectProductFilter);
  const dispatch = useAppDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setProductSorting(event.target.value));
    handleClose();
  };

  const controlProps = (item: string) => ({
    checked: order_by === item,
    onChange: handleChange,
    value: item,
    id: item,
    name: "sorting",
    inputProps: { "aria-label": item },
  });

  return (
    <div className={cls.wrapper}>
      {sortingList.map((item) => (
        <div className={cls.row} key={item.value}>
          <RadioInput {...controlProps(item.value)} />
          <label className={cls.label} htmlFor={item.value}>
            <span className={cls.text}>{t(item.label)}</span>
          </label>
        </div>
      ))}
    </div>
  );
}
