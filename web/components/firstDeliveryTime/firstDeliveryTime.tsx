import React from "react";
import cls from "./firstDeliveryTime.module.scss";
import { useBranch } from "contexts/branch/branch.context";
import { useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import dayjs from "dayjs";
import DeliveryTimes from "components/deliveryTimes/deliveryTimes";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { setDeliveryDate, selectOrder } from "redux/slices/order";
import { DeliveryIcon } from "components/icons";
import useLocale from "hooks/useLocale";
import { useDateHourFormat } from "utils/useDateHourFormat";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));

type Props = {};

export default function FirstDeliveryTime({}: Props) {
  const { t } = useLocale();
  const { branch } = useBranch();
  const { getDeliveryTime } = useDateHourFormat();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [modal, handleOpen, handleClose] = useModal();
  const dispatch = useAppDispatch();
  const { order } = useAppSelector(selectOrder);

  const handleChangeDeliverySchedule = ({
    date,
    time,
  }: {
    date: string;
    time: string;
  }) => {
    dispatch(
      setDeliveryDate({
        delivery_time: time,
        delivery_date: date,
        shop_id: branch?.id,
      }),
    );
  };

  return (
    <div>
      {!!branch?.id && (
        <button className={cls.wrapper} onClick={handleOpen}>
          <DeliveryIcon />
          <div className={cls.text}>
            {order?.delivery_time
              ? `${t("delivery.by")} ${dayjs(order?.delivery_date).format(
                  "ddd",
                )} ${getDeliveryTime(order?.delivery_time)}`
              : t("schedule")}
          </div>
        </button>
      )}

      {isDesktop ? (
        <ModalContainer open={modal} onClose={handleClose}>
          {modal && (
            <DeliveryTimes
              data={branch}
              handleClose={handleClose}
              handleChangeDeliverySchedule={handleChangeDeliverySchedule}
            />
          )}
        </ModalContainer>
      ) : (
        <MobileDrawer open={modal} onClose={handleClose}>
          {modal && (
            <DeliveryTimes
              data={branch}
              handleClose={handleClose}
              handleChangeDeliverySchedule={handleChangeDeliverySchedule}
            />
          )}
        </MobileDrawer>
      )}
    </div>
  );
}
