import React from "react";
import cls from "./sendWalletMoney.module.scss";
import { Grid, useMediaQuery } from "@mui/material";
import TextInput from "components/inputs/textInput";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import PrimaryButton from "components/button/primaryButton";
import DarkButton from "components/button/darkButton";
import { useMutation } from "react-query";
import profileService from "services/profile";
import SelectUser from "./selectUsers";
import { error, success } from "components/alert/toast";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";

type Props = {
  handleClose: () => void;
  onActionSuccess?: () => void;
};

interface formValues {
  price: number | undefined;
  uuid: string;
}

export default function SendWalletMoney({
  handleClose,
  onActionSuccess,
}: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const currency = useAppSelector(selectCurrency);

  const { mutate: sendMoney, isLoading: isMoneySending } = useMutation({
    mutationFn: (data: { price: number; uuid: string; currency_id?: number }) =>
      profileService.sendMoney(data),
    onSuccess: () => {
      success(t("successfully.transferred"));
      onActionSuccess?.();
      handleClose();
    },
    onError: (err: any) => {
      error(err?.data?.message || err?.message);
      console.error(err);
    },
  });

  const formik = useFormik({
    initialValues: {
      price: undefined,
      uuid: "",
    },
    onSubmit: (values: formValues) => {
      const body = {
        price: values.price!,
        uuid: values.uuid!,
        currency_id: currency?.id,
      };
      sendMoney(body);
    },
    validate: (values: formValues) => {
      const errors = {} as formValues;
      if (!values.price) {
        errors.price = t("required");
      }
      if (!values.uuid) {
        errors.uuid = t("required");
      }
      return errors;
    },
  });

  return (
    <div className={cls.wrapper}>
      <h1 className={cls.title}>{t("send.money")}</h1>
      <form className={cls.form} onSubmit={formik.handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={12}>
            <TextInput
              name="price"
              type="number"
              label={t("amount")}
              placeholder={t("type.here")}
              value={formik.values.price}
              onChange={formik.handleChange}
              error={!!formik.errors.price && formik.touched.price}
            />
            <div style={{ color: "red", fontSize: "14px" }}>
              {formik.errors?.price && formik.touched?.price
                ? formik.errors?.price
                : ""}
            </div>
          </Grid>

          <Grid item xs={12} md={12}>
            <SelectUser
              value={formik.values.uuid}
              label={t("user")}
              onChange={formik.handleChange}
              name="uuid"
              placeholder={t("search.user")}
              error={!!formik.errors.uuid && formik.touched.uuid}
            />
            <div style={{ color: "red", fontSize: "14px" }}>
              {formik.errors?.uuid && formik.touched?.uuid
                ? formik.errors?.uuid
                : ""}
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <PrimaryButton type="submit" loading={isMoneySending}>
              {t("send")}
            </PrimaryButton>
          </Grid>
          <Grid item xs={12} md={6} mt={isDesktop ? 0 : -2}>
            <DarkButton type="button" onClick={handleClose}>
              {t("cancel")}
            </DarkButton>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}
