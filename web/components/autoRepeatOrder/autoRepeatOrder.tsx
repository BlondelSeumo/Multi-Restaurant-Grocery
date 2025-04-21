import cls from "./autoRepeatOrder.module.scss";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import dayjs from "dayjs";
import {
  DatePicker,
  // DateTimePicker
} from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrimaryButton from "components/button/primaryButton";
import { error, success } from "components/alert/toast";
import { useMutation, useQueryClient } from "react-query";
import orderService from "services/order";

type Props = {
  orderId: number;
  onClose: () => void;
};

export default function AutoRepeatOrder({ orderId, onClose }: Props) {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const queryClient = useQueryClient();

  const { isLoading, mutate } = useMutation({
    mutationFn: (data: { orderId: number; data: any }) =>
      orderService.autoRepeat(data.orderId, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId, locale]);
      success(t("auto.repeat.order.success"));
    },
    onError: (err: any) => {
      error(err?.data?.message || t("auto.repeat.order.error"));
    },
    onSettled: () => {
      onClose();
    },
  });

  const formik = useFormik({
    initialValues: {
      from: dayjs().add(1, "day").format("YYYY-MM-DD"),
      to: dayjs().add(8, "day").format("YYYY-MM-DD"),
    },
    onSubmit: (values) => {
      if (dayjs(values?.from).isAfter(dayjs(values?.to))) {
        return error(t("start.date.should.be.before.end.date"));
      }
      mutate({ orderId, data: values });
    },
  });

  return (
    <div className={cls.wrapper}>
      <form id="autoRepeatOrder" onSubmit={formik.handleSubmit}>
        <h1 className={cls.title}>{t("select.dates.for.auto.repeat")}</h1>
        <div className={cls.body}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={t("start.date")}
              disablePast
              value={dayjs(formik.values.from)}
              onChange={(event: any) => {
                formik.setFieldValue("from", dayjs(event).format("YYYY-MM-DD"));
              }}
              format="YYYY-MM-DD"
              className={cls.item}
            />
            <DatePicker
              label={t("end.date")}
              disablePast
              value={dayjs(formik.values.to)}
              onChange={(event: any) => {
                formik.setFieldValue("to", dayjs(event).format("YYYY-MM-DD"));
              }}
              format="YYYY-MM-DD"
              className={cls.item}
            />
            {/*date time picker*/}
            {/*<DateTimePicker*/}
            {/*  label={t("start.date")}*/}
            {/*  disablePast*/}
            {/*  ampm={false}*/}
            {/*  value={dayjs(formik.values.from)}*/}
            {/*  onChange={(event: any) => {*/}
            {/*    formik.setFieldValue(*/}
            {/*      "from",*/}
            {/*      dayjs(event).format("YYYY-MM-DD HH:mm"),*/}
            {/*    );*/}
            {/*  }}*/}
            {/*  format="YYYY-MM-DD HH:mm"*/}
            {/*  className={cls.item}*/}
            {/*/>*/}
            {/*<DateTimePicker*/}
            {/*  label={t("end.date")}*/}
            {/*  disablePast*/}
            {/*  ampm={false}*/}
            {/*  value={dayjs(formik.values.to)}*/}
            {/*  onChange={(event: any) => {*/}
            {/*    formik.setFieldValue(*/}
            {/*      "to",*/}
            {/*      dayjs(event).format("YYYY-MM-DD HH:mm"),*/}
            {/*    );*/}
            {/*  }}*/}
            {/*  format="YYYY-MM-DD HH:mm"*/}
            {/*  className={cls.item}*/}
            {/*/>*/}
          </LocalizationProvider>
        </div>
        <PrimaryButton type="submit" loading={isLoading}>
          {t("submit")}
        </PrimaryButton>
      </form>
    </div>
  );
}
