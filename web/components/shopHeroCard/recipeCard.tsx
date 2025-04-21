import React from "react";
import cls from "./shopHeroCard.module.scss";
import Link from "next/link";
import getImage from "utils/getImage";
import FallbackImage from "components/fallbackImage/fallbackImage";
import useLocale from "hooks/useLocale";
import { RecipeCategory } from "interfaces";

type Props = {
  data: RecipeCategory;
};

export default function FeaturedRecipeCard({ data }: Props) {
  const { t } = useLocale();

  return (
    <Link href={`/recipes?category_id=${data.id}`} className={cls.wrapper}>
      <div className={cls.header}>
        <h4 className={cls.title}>{data.translation.title}</h4>
      </div>
      <FallbackImage
        fill
        src={getImage(data.img)}
        alt={data.translation?.title}
        sizes="400px"
      />
      <div className={cls.badge}>
        <span className={cls.text}>
          <span>{t("foodWithCount", { count: data.receipts_count })}</span>
        </span>
      </div>
    </Link>
  );
}
