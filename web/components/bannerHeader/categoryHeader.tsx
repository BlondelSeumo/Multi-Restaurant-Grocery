import React from "react";
import cls from "./bannerHeader.module.scss";
import useLocale from "hooks/useLocale";

type Props = {
  title?: string;
};

export default function CategoryHeader({ title }: Props) {
  const { t } = useLocale();

  return (
    <div className={cls.container}>
      <div className="container">
        <div className={cls.header}>
          <h1 className={cls.title}>{title || t("all.products")}</h1>
          {/* <p className={cls.text}>{data.translation?.description}</p> */}
        </div>
      </div>
    </div>
  );
}
