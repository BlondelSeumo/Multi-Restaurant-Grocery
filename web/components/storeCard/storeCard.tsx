import React from "react";
import { IShop } from "interfaces";
import cls from "./storeCard.module.scss";
import Link from "next/link";
import getImage from "utils/getImage";
import BonusCaption from "components/bonusCaption/bonusCaption";
import FallbackImage from "components/fallbackImage/fallbackImage";
import StarSmileFillIcon from "remixicon-react/StarSmileFillIcon";

type Props = {
  index?: number;
  data: IShop;
  handleClick?: (event: any) => void;
};

export default function StoreCard({ data, handleClick, index }: Props) {
  return (
    <Link href="/" onClick={handleClick} className={cls.wrapper}>
      <div className={cls.header}>
        <FallbackImage
          fill
          src={getImage(data.background_img)}
          alt={data.translation?.title}
          sizes="286px"
        />
        <div className={cls.badge}>
          <StarSmileFillIcon />
          <span className={cls.text}>{data.rating_avg?.toFixed(1) || 0}</span>
        </div>
      </div>
      <div className={cls.body}>
        <h3 className={cls.title}>
          {index ? `${index}.` : ""} {data.translation?.title}
        </h3>
        <p className={cls.text}>
          {data.bonus ? (
            <BonusCaption data={data.bonus} />
          ) : (
            data.translation?.description
          )}
        </p>
      </div>
    </Link>
  );
}
