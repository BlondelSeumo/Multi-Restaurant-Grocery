import React from "react";
import cls from "./reviewCreate.module.scss";
import useLocale from "hooks/useLocale";
import { Rating } from "@mui/material";
import { useFormik } from "formik";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";

export interface ReviewFormValues {
  rating?: number;
  comment?: string;
  galleries?: string[];
}
type Props = {};

export default function ReviewCreate({}: Props) {
  const { t } = useLocale();

  const formik = useFormik({
    initialValues: {
      rating: 0,
      comment: "",
      galleries: [],
    },
    onSubmit: (values: ReviewFormValues) => {
      console.log("values => ", values);
    },
    validate: (values: ReviewFormValues) => {
      const errors = {} as ReviewFormValues;
      return errors;
    },
  });

  return (
    <div className={cls.wrapper}>
      <div className={cls.header}>
        <h1 className={cls.title}>{t("add.review")}</h1>
      </div>
      <div className={cls.form}>
        <Rating
          name="rating"
          value={formik.values.rating}
          onChange={formik.handleChange}
          sx={{ color: "#ffa100", "& *": { color: "inherit" } }}
        />
        <div className={cls.spacing} />
        <TextInput
          name="comment"
          label={t("comment")}
          value={formik.values.comment}
          onChange={formik.handleChange}
          placeholder={t("type.here")}
        />
      </div>
      <div className={cls.footer}>
        <div className={cls.btnWrapper}>
          <PrimaryButton>{t("add")}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
