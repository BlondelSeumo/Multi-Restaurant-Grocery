import React from "react";
import PrimaryButton from "components/button/primaryButton";
import SecondaryButton from "components/button/secondaryButton";
import { useTranslation } from "react-i18next";
import useClearCart from "hooks/useClearCart";
import cls from "./addressPopover.module.scss";
import { IShop } from "interfaces";
import { useBranch } from "contexts/branch/branch.context";

type Props = {
  handleCloseBranchPopover: () => void;
  branch?: IShop;
};

export default function BranchPopover({
  handleCloseBranchPopover,
  branch,
}: Props) {
  const { t } = useTranslation();
  const { updateBranch } = useBranch();
  const { clearCart } = useClearCart();

  const rejectAddress = () => {
    handleCloseBranchPopover();
  };

  const acceptAddress = () => {
    clearCart();
    handleCloseBranchPopover();
    updateBranch(branch);
  };

  return (
    <div className={cls.wrapper}>
      <label className={cls.label}>{t("change.branch.near.address")}</label>
      <p className={cls.text}>{branch?.translation?.title}</p>
      <div className={cls.actions}>
        <SecondaryButton size="small" onClick={rejectAddress}>
          {t("no")}
        </SecondaryButton>
        <PrimaryButton size="small" onClick={acceptAddress}>
          {t("yes")}
        </PrimaryButton>
      </div>
    </div>
  );
}
