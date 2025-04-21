import React from "react";
import Link from "next/link";
import { Category } from "interfaces";
import cls from "./mobileShopCategories.module.scss";
import { useAppDispatch } from "hooks/useRedux";
import { setShopCategory } from "redux/slices/shopFilter";

type Props = {
  data: Category[];
  onClose: () => void;
};

export default function MobileShopCategories({ data, onClose }: Props) {
  const dispatch = useAppDispatch();

  function filterByCategory(event: any, id: any = null) {
    event.preventDefault();
    dispatch(setShopCategory(id));
    onClose();
  }

  return (
    <div className={cls.wrapper}>
      {data.map((item) => (
        <Link
          href="/"
          key={item.id}
          className={cls.item}
          onClick={(event) => filterByCategory(event, item.id)}
        >
          <span className={cls.text}>{item.translation.title}</span>
        </Link>
      ))}
    </div>
  );
}
