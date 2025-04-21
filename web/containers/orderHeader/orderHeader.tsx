import React from "react";
import { Order } from "interfaces";
import cls from "./orderHeader.module.scss";
import { useTranslation } from "react-i18next";
import StepperComponent from "components/stepperComponent/stepperComponent";
import dayjs from "dayjs";
import { Skeleton } from "@mui/material";
import { useDateHourFormat } from "utils/useDateHourFormat";

type Props = {
  data?: Order;
  loading?: boolean;
};

export default function OrderHeader({ data, loading = false }: Props) {
  const { t } = useTranslation();
  const { hourFormat } = useDateHourFormat();

  return (
    <div className={cls.root}>
      <div className="container">
        <div className={cls.wrapper}>
          <div className={cls.shopInfo}>
            {!loading ? (
              <div className={cls.naming}>
                <h1 className={cls.title}>{t(`status.${data?.status}`)}</h1>
              </div>
            ) : (
              <div className={cls.naming}>
                <Skeleton variant="text" className={cls.shimmerTitle} />
              </div>
            )}
          </div>
          <div className={cls.statusWrapper}>
            {!loading ? (
              <>
                <div className={cls.status}>
                  <label>{t(data?.status)}</label>
                  <div className={cls.time}>
                    <span className={cls.text}>
                      {dayjs(data?.updated_at).format(hourFormat)}
                    </span>
                  </div>
                </div>
                <StepperComponent status={data?.status || ""} />
              </>
            ) : (
              <Skeleton variant="rectangular" className={cls.shimmer} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
