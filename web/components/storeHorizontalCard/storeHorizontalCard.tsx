import React from "react";
import { IShop } from "interfaces";
import cls from "./storeHorizontalCard.module.scss";
import Link from "next/link";
import getImage from "utils/getImage";
import FallbackImage from "components/fallbackImage/fallbackImage";
import TimeLineIcon from "remixicon-react/TimeLineIcon";
import PhoneLineIcon from "remixicon-react/PhoneLineIcon";
import useLocale from "hooks/useLocale";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import { useDateHourFormat } from "utils/useDateHourFormat";

type Props = {
  data: IShop;
  handleClick?: (event: any) => void;
};

export default function StoreHorizontalCard({ data, handleClick }: Props) {
  const { t } = useLocale();
  const { getFormatedHour } = useDateHourFormat();
  const { workingSchedule, isShopClosed } = useShopWorkingSchedule(data);

  return (
    <Link href="/" onClick={handleClick} className={cls.wrapper}>
      <div className={cls.header}>
        <FallbackImage
          fill
          src={getImage(data.background_img)}
          alt={data.translation?.title}
          sizes="286px"
        />
      </div>
      <div className={cls.body}>
        <h3 className={cls.title}>{data.translation?.title}</h3>
        <p className={cls.text}>{data.translation?.address}</p>
        <div className={cls.actions}>
          <div className={cls.item}>
            <TimeLineIcon />
            <span className={cls.label}>{t("working.time")}:</span>{" "}
            <span className={cls.bold}>
              {isShopClosed
                ? t("closed")
                : `${getFormatedHour(workingSchedule.from)} — ${getFormatedHour(workingSchedule.to)}`}
            </span>
          </div>
          <div className={cls.item}>
            <PhoneLineIcon />
            <span className={cls.label}>{t("phone")}:</span>{" "}
            <span className={cls.value}>{data.phone}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
