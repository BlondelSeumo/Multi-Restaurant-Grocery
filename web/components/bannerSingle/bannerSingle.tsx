import React from "react";
import { Banner } from "interfaces";
import Link from "next/link";
import cls from "./bannerSingle.module.scss";
import getImage from "utils/getImage";
import FallbackImage from "components/fallbackImage/fallbackImage";

type Props = {
  data: Banner;
};

export default function BannerSingle({ data }: Props) {
  return (
    <Link href={`/promotion/${data.id}`} className={cls.banner}>
      <div className={cls.wrapper}>
        <FallbackImage
          fill
          src={getImage(data.img)}
          alt={data.translation?.title}
          sizes="360px"
          quality={90}
          priority
        />
        <div className={cls.caption}>
          <span className={cls.text}>{data.translation?.button_text}</span>
        </div>
        <div className={cls.content}>
          <h3 className={cls.title}>{data.translation?.title}</h3>
          <p className={cls.text}>{data.translation?.description}</p>
        </div>
      </div>
    </Link>
  );
}
