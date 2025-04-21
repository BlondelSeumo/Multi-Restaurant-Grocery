import React, { useState } from "react";
import cls from "./reservationFind.module.scss";
import { Grid, useMediaQuery } from "@mui/material";
import { useFormik } from "formik";
import PrimaryButton from "components/button/primaryButton";
import useLocale from "hooks/useLocale";
import RcDatePicker from "components/pickers/rcDatePicker";
import { useBranch } from "contexts/branch/branch.context";
import getFirstReservationDate from "utils/getFirstReservationDate";
import SecondaryButton from "components/button/secondaryButton";
import { useRouter } from "next/router";
import RcSelect from "components/pickers/rcSelect";
import { useQuery } from "react-query";
import shopService from "services/shop";
import OutlinedInput from "components/inputs/outlinedInput";
import bookingService from "services/booking";
import RcZonePicker from "components/pickers/rcZonePicker";
import Loading from "components/loader/loading";

type Props = {
  handleClose: () => void;
};
interface formValues {
  shop_id?: string;
  date?: string;
  zone_id?: string;
  number_of_people?: number;
}

export default function ReservationFind({ handleClose }: Props) {
  const { t, locale } = useLocale();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { branch } = useBranch();
  const { push } = useRouter();
  const [branchId, setBranchId] = useState(String(branch?.id || ""));

  const { data: branches, isLoading: isBranchLoading } = useQuery(
    ["branches", locale],
    () => shopService.getAll({ page: 1, perPage: 100, open: 1 }),
    {
      select: (data) =>
        data.data.map((item) => ({
          label: item.translation.title,
          value: String(item.id),
        })),
    }
  );
  const { data: zones, isLoading: isZoneLoading } = useQuery(
    ["zones", locale, branchId],
    () => bookingService.getZones({ page: 1, perPage: 100, shop_id: branchId }),
    {
      select: (data) =>
        data.data.map((item) => ({
          label: item.translation?.title || "",
          value: String(item.id),
          data: item,
        })),
    }
  );

  const formik = useFormik({
    initialValues: {
      shop_id: branchId,
      zone_id: zones ? zones[0]?.value : undefined,
      date: branch ? getFirstReservationDate(branch).date : undefined,
      number_of_people: 2,
    },
    enableReinitialize: true,
    onSubmit: (values: formValues, { setSubmitting }) => {
      push({
        pathname: `/reservations/${values.shop_id}`,
        query: {
          zone_id: values.zone_id,
          date_from: values.date,
          guests: values.number_of_people,
        },
      }).finally(() => setSubmitting(true));
    },
    validate: (values: formValues) => {
      const errors: formValues = {};
      if (!values.date) {
        errors.date = t("required");
      }
      if (!values.shop_id) {
        errors.shop_id = t("required");
      }
      if (!values.zone_id) {
        errors.zone_id = t("required");
      }
      if (!values.number_of_people) {
        errors.number_of_people = t("required");
      }
      return errors;
    },
  });

  return (
    <div className={cls.wrapper}>
      <h1 className={cls.title}>{t("make.reservation")}</h1>
      <form className={cls.form} onSubmit={formik.handleSubmit}>
        {!isBranchLoading && !isZoneLoading ? (
          <Grid container spacing={isDesktop ? 4 : 2}>
            <Grid item xs={12} md={6}>
              <RcSelect
                name="shop_id"
                label={t("branch")}
                value={formik.values.shop_id}
                options={branches}
                onChange={(event: any) => {
                  formik.handleChange(event);
                  setBranchId(event.target.value);
                  formik.setFieldValue("table_id", undefined);
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RcDatePicker
                name="date"
                label={t("date")}
                value={formik.values.date}
                onChange={(event) => {
                  formik.setFieldValue("date", event);
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RcZonePicker
                name="zone_id"
                label={t("zone")}
                value={formik.values.zone_id}
                options={zones}
                onChange={formik.handleChange}
                error={!!formik.errors.zone_id && formik.touched.zone_id}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <OutlinedInput
                label={t("guests")}
                type="number"
                name="number_of_people"
                value={formik.values.number_of_people}
                onChange={formik.handleChange}
                error={
                  !!formik.errors.number_of_people &&
                  formik.touched.number_of_people
                }
                InputProps={{
                  inputProps: {
                    min: 1,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SecondaryButton type="button" onClick={handleClose}>
                {t("cancel")}
              </SecondaryButton>
            </Grid>
            <Grid item xs={12} md={6}>
              <PrimaryButton type="submit" loading={formik.isSubmitting}>
                {t("find.table")}
              </PrimaryButton>
            </Grid>
          </Grid>
        ) : (
          <div className={cls.loadingBox}>
            <Loading />
          </div>
        )}
      </form>
    </div>
  );
}
