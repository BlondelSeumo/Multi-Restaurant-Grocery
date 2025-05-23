import React from "react";
import cls from "./booking.module.scss";
import useLocale from "hooks/useLocale";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import PrimaryButton from "components/button/primaryButton";
import { useFormik } from "formik";
import { IBookingSchedule } from "interfaces/booking.interface";
import { WEEK } from "constants/weekdays";
import getTimeSlots from "utils/getTimeSlots";
import { useMutation, useQuery } from "react-query";
import bookingService from "services/booking";
import { error, success } from "components/alert/toast";
import { useAuth } from "contexts/auth/auth.context";
import Unauthorized from "components/unauthorized/unauthorized";
import PhoneInputWithVerification from "components/inputs/phoneInputWithVerification";
import Loading from "components/loader/loading";
import { useSettings } from "contexts/settings/settings.context";
import { useDateHourFormat } from "utils/useDateHourFormat";

type Props = { data?: IBookingSchedule; handleClose: () => void };

interface formValues {
  end_time?: string;
  date?: string;
  phone?: string;
  note?: string;
  guest?: number;
}

export default function Booking({ data, handleClose }: Props) {
  const { t } = useLocale();
  const { isAuthenticated, user } = useAuth();
  const { query } = useRouter();
  const { settings } = useSettings();
  const { dateHourFormat } = useDateHourFormat();
  const booking_date = String(query.booking_date);
  const table_id = String(query.table_id || "") || undefined;
  const minReservationHour = settings?.min_reservation_time || 3;
  const shopId = Number(query.id);

  const { data: bookings, isLoading: isBoookingFetching } = useQuery(
    ["bookings"],
    () => bookingService.getAll(),
  );

  const { isLoading, mutate } = useMutation({
    mutationFn: (data: any) => bookingService.create(data),
    onSuccess: () => {
      handleClose();
      success(t("your.place.reserved"));
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  const formik = useFormik({
    initialValues: {
      date: dayjs(booking_date).format("YYYY-MM-DD"),
      end_time: dayjs(booking_date)
        .add(minReservationHour, "hour")
        .format("HH:mm"),
      phone: user?.phone,
      guest: Number(query?.guests),
    },
    enableReinitialize: true,
    onSubmit: (values: formValues) => {
      console.log("values => ", values);
      const payload = {
        table_id: Number(table_id),
        booking_id: bookings?.data.find((item) => item.shop?.id === shopId)?.id,
        start_date: dayjs(booking_date).format("YYYY-MM-DD HH:mm"),
        note: values.note,
        guest: values.guest,
        // end_date: `${values.date} ${values.end_time}`,
      };
      mutate(payload);
    },
    validate: (values: formValues) => {
      const errors: formValues = {};
      if (!values.phone) {
        errors.phone = t("reservation.phone.required");
      }
      return errors;
    },
  });

  // function getSchedule() {
  //   let exactDate = dayjs(booking_date);
  //   let slots: string[] = [];
  //   const today = exactDate.day();
  //   const isToday = exactDate.isSame(dayjs());
  //   const weekDay = WEEK[today];
  //   const workingSchedule = data?.booking_shop_working_days?.find(
  //     (item) => item.day === weekDay,
  //   );
  //   if (workingSchedule) {
  //     const from = exactDate.add(minReservationHour, "hour").format("HH:mm");
  //     const to = workingSchedule.to.replace("-", ":");
  //     slots = getTimeSlots(from, to, isToday);
  //   }
  //   return slots.map((item) => ({ label: item, value: item }));
  // }

  if (isAuthenticated) {
    return (
      <div className={cls.wrapper}>
        <div className={cls.header}>
          <h2 className={cls.title}>{t("make.reservation")}</h2>
          <p className={cls.text}>
            {!!booking_date && dayjs(booking_date).format(dateHourFormat)}
          </p>
        </div>
        <div className={cls.actions}>
          <div className={cls.phoneNumber}>
            <PhoneInputWithVerification
              name="phone"
              label={t("phone")}
              placeholder={t("enter.phone.number")}
              value={formik.values.phone}
              disabled
              error={!!formik.errors.phone && formik.touched.phone}
            />
            <p className={cls.errorText}>
              {!!formik.errors.phone && formik.touched.phone
                ? formik.errors.phone
                : ""}
            </p>
          </div>
        </div>
        <div className={cls.footer}>
          <div className={cls.btnWrapper}>
            <PrimaryButton
              type="submit"
              onClick={formik.handleSubmit}
              loading={isLoading}
            >
              {t("submit")}
            </PrimaryButton>
          </div>
        </div>
        {isBoookingFetching && <Loading />}
      </div>
    );
  }

  return (
    <div className={cls.wrapper}>
      <Unauthorized text={t("sign.in.make.reservation")} />
    </div>
  );
}
