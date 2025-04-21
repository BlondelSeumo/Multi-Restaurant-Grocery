import React from "react";
import cls from "./shopHeader.module.scss";
import { IShop } from "interfaces";
import TimeLineIcon from "remixicon-react/TimeLineIcon";
import RunFillIcon from "remixicon-react/RunFillIcon";
import StarSmileFillIcon from "remixicon-react/StarSmileFillIcon";
import CouponLineIcon from "remixicon-react/CouponLineIcon";
import ShopLogoBackground from "components/shopLogoBackground/shopLogoBackground";
import { useAppSelector } from "hooks/useRedux";
import Price from "components/price/price";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import { selectCurrency } from "redux/slices/currency";
import DarkButton from "components/button/darkButton";
import { useMediaQuery } from "@mui/material";
import PrimaryButton from "components/button/primaryButton";
import { useRouter } from "next/router";
import getShortTimeType from "utils/getShortTimeType";
import useLocale from "hooks/useLocale";
import useModal from "hooks/useModal";
import ReservationFind from "components/reservationFind/reservationFind";
import dynamic from "next/dynamic";
import { useDateHourFormat } from "utils/useDateHourFormat";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));

type Props = {
  data?: IShop;
};

export default function ShopHeader({ data }: Props) {
  const { t } = useLocale();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { getFormatedHour } = useDateHourFormat();
  const { push } = useRouter();
  const { workingSchedule, isShopClosed } = useShopWorkingSchedule(data);
  const currency = useAppSelector(selectCurrency);
  const [openReservation, handleOpenReservation, handleCloseReservation] =
    useModal();

  return (
    <div className={cls.header}>
      <div className="container">
        <div className={cls.row}>
          <div className={cls.shopBrand}>
            <ShopLogoBackground data={data} size="large" />
            <div className={cls.naming}>
              <h1 className={cls.title}>{data?.translation?.title}</h1>
              <p className={cls.description}>{data?.translation?.address}</p>
            </div>
          </div>
        </div>
        <div className={cls.flex}>
          <div className={cls.shopInfo}>
            <div className={cls.item}>
              <TimeLineIcon />
              <p className={cls.text}>
                <span>{t("working.time")}: </span>
                <span className={cls.bold}>
                  {isShopClosed
                    ? t("closed")
                    : `${getFormatedHour(workingSchedule.from)} — ${getFormatedHour(workingSchedule.to)}`}
                </span>
              </p>
            </div>
            <div className={cls.dot} />
            <div className={`${cls.item} ${cls.rating}`}>
              <StarSmileFillIcon />
              <p className={cls.text}>
                <span></span>
                <span className={cls.semiBold}>
                  {data?.rating_avg?.toFixed(1) || 0}
                </span>
              </p>
            </div>
            <div className={cls.dot} />
            <div className={`${cls.item} ${cls.delivery}`}>
              <span className={cls.badge} />
              <RunFillIcon />
              <p className={cls.text}>
                <span></span>
                <span className={cls.semiBold}>
                  {data?.delivery_time?.from}-{data?.delivery_time?.to}{" "}
                  {t(getShortTimeType(data?.delivery_time?.type))}
                </span>
              </p>
            </div>
            <div className={cls.dot} />
            <div className={cls.item}>
              <CouponLineIcon />
              <p className={cls.text}>
                <span>{t("delivery")} — </span>
                <span className={cls.bold}>
                  <Price
                    number={Number(data?.price) * Number(currency?.rate)}
                  />
                </span>
              </p>
            </div>
          </div>
          <div className={cls.actions}>
            <DarkButton onClick={handleOpenReservation}>
              {t("table.reservation")}
            </DarkButton>
            {!isDesktop && (
              <PrimaryButton
                onClick={() => push("/", undefined, { shallow: true })}
              >
                {t("start.order")}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
      {isDesktop ? (
        <ModalContainer open={openReservation} onClose={handleCloseReservation}>
          <ReservationFind handleClose={handleCloseReservation} />
        </ModalContainer>
      ) : (
        <MobileDrawer open={openReservation} onClose={handleCloseReservation}>
          <ReservationFind handleClose={handleCloseReservation} />
        </MobileDrawer>
      )}
    </div>
  );
}
