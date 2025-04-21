import React from "react";
import cls from "./checkoutDelivery.module.scss";
import TextInput from "components/inputs/textInput";
import CalendarCheckLineIcon from "remixicon-react/CalendarCheckLineIcon";
import MapPinRangeFillIcon from "remixicon-react/MapPinRangeFillIcon";
import PencilFillIcon from "remixicon-react/PencilFillIcon";
import { useTranslation } from "react-i18next";
import usePopover from "hooks/usePopover";
import dayjs from "dayjs";
import { FormikProps } from "formik";
import { OrderFormValues, IShop } from "interfaces";
import useModal from "hooks/useModal";
import { useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import checkIsDisabledDay from "utils/checkIsDisabledDay";
import Map from "components/map/map";
import { useDateHourFormat } from "utils/useDateHourFormat";

const DeliveryTimes = dynamic(
  () => import("components/deliveryTimes/deliveryTimes"),
);
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const DeliveryTimePopover = dynamic(
  () => import("components/deliveryTimePopover/deliveryTimePopover"),
);
const ModalContainer = dynamic(() => import("containers/modal/modal"));

type Props = {
  data: IShop;
  formik: FormikProps<OrderFormValues>;
};

export default function CheckoutPickupForm({ formik, data }: Props) {
  const { t } = useTranslation();
  const { getDeliveryTime } = useDateHourFormat();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [timePopover, anchorEl, handleOpenTimePopover, handleCloseTimePopover] =
    usePopover();
  const [timeDrawer, handleOpenTimeDrawer, handleCloseTimeDrawer] = useModal();

  const { delivery_date, delivery_time, address, location } = formik.values;
  const isToday = dayjs(delivery_date).isSame(dayjs().format("YYYY-MM-DD"));
  const isTomorrow = dayjs(delivery_date).isSame(
    dayjs().add(1, "day").format("YYYY-MM-DD"),
  );
  const day = dayjs(delivery_date).format("ddd");

  const branchLocation = {
    lat: Number(location?.latitude) || 0,
    lng: Number(location?.longitude) || 0,
  };

  const openTimePicker = (event: any) => {
    if (checkIsDisabledDay(0, data)) {
      handleOpenTimeDrawer();
    } else {
      handleOpenTimePopover(event);
    }
  };

  const handleChangeDeliverySchedule = ({
    date,
    time,
  }: {
    date: string;
    time: string;
  }) => {
    formik.setFieldValue("delivery_time", time);
    formik.setFieldValue("delivery_date", date);
  };

  return (
    <>
      <div className={cls.row}>
        <button type="button" className={cls.rowBtn} onClick={openTimePicker}>
          <div className={cls.item}>
            <CalendarCheckLineIcon />
            <div className={cls.naming}>
              <div className={cls.label}>{t("pickup.time")}</div>
              <div className={cls.value}>
                {isToday ? t("today") : isTomorrow ? t("tomorrow") : day},{" "}
                {getDeliveryTime(delivery_time)}
              </div>
            </div>
          </div>
          <div className={cls.icon}>
            <PencilFillIcon />
          </div>
        </button>
        <button type="button" className={cls.rowBtn}>
          <div className={cls.item}>
            <MapPinRangeFillIcon />
            <div className={cls.naming}>
              <div className={cls.label}>{t("pickup.address")}</div>
              <div className={cls.value}>{address?.address}</div>
            </div>
          </div>
        </button>
      </div>
      <div className={cls.map}>
        <Map location={branchLocation} readOnly />
      </div>
      <div className={cls.form}>
        <TextInput
          name="note"
          label={t("comment")}
          value={formik.values.note}
          onChange={formik.handleChange}
          placeholder={t("type.here")}
        />
      </div>

      <DeliveryTimePopover
        open={timePopover}
        anchorEl={anchorEl}
        onClose={handleCloseTimePopover}
        weekDay={isToday ? t("today") : isTomorrow ? t("tomorrow") : day}
        time={data?.delivery_time?.to || "0"}
        handleOpenDrawer={handleOpenTimeDrawer}
        formik={formik}
        timeType={data.delivery_time?.type || "minute"}
      />
      {isDesktop ? (
        <ModalContainer open={timeDrawer} onClose={handleCloseTimeDrawer}>
          <DeliveryTimes
            data={data}
            handleClose={handleCloseTimeDrawer}
            handleChangeDeliverySchedule={handleChangeDeliverySchedule}
          />
        </ModalContainer>
      ) : (
        <MobileDrawer open={timeDrawer} onClose={handleCloseTimeDrawer}>
          <DeliveryTimes
            data={data}
            handleClose={handleCloseTimeDrawer}
            handleChangeDeliverySchedule={handleChangeDeliverySchedule}
          />
        </MobileDrawer>
      )}
    </>
  );
}
