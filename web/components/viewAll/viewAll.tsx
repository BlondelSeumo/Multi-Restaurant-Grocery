import React from "react";
import cls from "./viewAll.module.scss";
import Link from "next/link";
import useLocale from "hooks/useLocale";
import ArrowRightUpLineIcon from "remixicon-react/ArrowRightUpLineIcon";

type Props = {
  link: string;
};

export default function ViewAll({ link }: Props) {
  const { t } = useLocale();

  return (
    <Link href={link} shallow={true} className={cls.wrapper}>
      <span className={cls.text}>{t("see.all")}</span>
      <ArrowRightUpLineIcon />
    </Link>
  );
}
