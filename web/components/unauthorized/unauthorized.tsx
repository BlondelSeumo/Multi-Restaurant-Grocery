/* eslint-disable @next/next/no-img-element */
import React from "react";
import cls from "./unauthorized.module.scss";
import { useTranslation } from "react-i18next";
import PrimaryButton from "components/button/primaryButton";
import { useRouter } from "next/router";
import { useAppDispatch } from "hooks/useRedux";
import { setHistory } from "redux/slices/history";

type Props = {
  text: string;
};

export default function Unauthorized({ text }: Props) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const dispatch = useAppDispatch();

  function goToLogin() {
    const link = window.location.pathname + window.location.search;
    dispatch(setHistory(link));
    push("/login");
  }

  return (
    <div className={cls.wrapper}>
      <img src="/images/delivery.webp" alt="Unauthorized" />
      <p className={cls.text}>{text}</p>
      <div className={cls.actions}>
        <PrimaryButton onClick={goToLogin}>
          {t("login.or.create.account")}
        </PrimaryButton>
      </div>
    </div>
  );
}
