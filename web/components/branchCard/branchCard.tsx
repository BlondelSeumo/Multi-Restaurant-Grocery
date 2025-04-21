import React from "react";
import cls from "./branchCard.module.scss";
import { IShop } from "interfaces";
import FallbackImage from "components/fallbackImage/fallbackImage";
import StarSmileFillIcon from "remixicon-react/StarSmileFillIcon";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import useLocale from "hooks/useLocale";

type Props = {
  data: IShop;
  handleClick: (data: IShop) => void;
};

export default function BranchCard({ data, handleClick }: Props) {
  const { t } = useLocale();
  const { workingSchedule, isShopClosed } = useShopWorkingSchedule(data);

  return (
    <div className={cls.wrapper} onClick={() => handleClick(data)}>
      <div className={cls.header}>
        <div className={cls.imageWrapper}>
          <FallbackImage src={data.logo_img} alt={data.translation?.title} />
        </div>
        <div className={cls.naming}>
          <h3 className={cls.title}>{data.translation?.title}</h3>
          <p className={cls.desc}>{data.translation?.address}</p>
        </div>
      </div>
      <div className={cls.flex}>
        <div className={cls.flexItem}>
          <span className={cls.text}>
            {isShopClosed
              ? t("closed")
              : `${workingSchedule.from} — ${workingSchedule.to}`}
          </span>
        </div>
        <div className={cls.flexItem}>
          <StarSmileFillIcon />
          <span className={cls.text}>{data.rating_avg?.toFixed(1) || 0}</span>
        </div>
      </div>
    </div>
  );
}
