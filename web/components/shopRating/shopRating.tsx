import React from "react";
import cls from "./shopRating.module.scss";
import useLocale from "hooks/useLocale";
import { Rating } from "@mui/material";
import { useQuery } from "react-query";
import shopService from "services/shop";

const arr = [5, 4, 3, 2, 1];

type Props = {};

export default function ShopRating({}: Props) {
  const { t } = useLocale();

  const { data } = useQuery(["shopRating"], () =>
    shopService.getShopGroupRating()
  );

  const getPercentage = (num: number) => {
    if (data) {
      return (num * 100) / data?.count;
    }
    return 0;
  };

  if (!data) {
    return <div></div>;
  }

  return (
    <div className={cls.wrapper}>
      <div className={cls.block}>
        <h4 className={cls.title}>{t("overall.rating")}</h4>
        <Rating
          value={data.avg}
          readOnly
          sx={{ color: "#ffa100", "& *": { color: "inherit" } }}
        />
        <p className={cls.text}>
          {t("number.of.reviews", { count: data.count })}
        </p>
      </div>
      <div className={cls.column}>
        {arr.map((item) => (
          <div key={item} className={cls.row}>
            <span className={cls.label}>
              {t("number.of.stars", { count: item })}
            </span>
            <div className={cls.progress}>
              <div
                className={cls.value}
                style={{ width: getPercentage(data.group[item]) + "%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
