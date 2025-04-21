import React from "react";
import cls from "./shopHeroCard.module.scss";
import Link from "next/link";
import { Product } from "interfaces";
import getImage from "utils/getImage";
import FallbackImage from "components/fallbackImage/fallbackImage";
import Price from "components/price/price";
import { useRouter } from "next/router";

type Props = {
  data: Product;
};

export default function ShopHeroCard({ data }: Props) {
  const { query } = useRouter();

  return (
    <Link
      href={{
        pathname: "",
        query: JSON.parse(JSON.stringify({ id: query.id, product: data.uuid })),
      }}
      shallow={true}
      replace={true}
      className={cls.wrapper}
    >
      <div className={cls.header}>
        <h4 className={cls.shopTitle}>{data.translation?.title}</h4>
      </div>
      <FallbackImage
        fill
        src={getImage(data.img)}
        alt={data.translation?.title}
        sizes="400px"
      />
      <div className={cls.badge}>
        <span className={cls.text}>
          <Price number={data.stock?.price} />
        </span>
      </div>
    </Link>
  );
}
