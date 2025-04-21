import React, { useState } from "react";
import PrimaryButton from "components/button/primaryButton";
import cls from "./cartTotal.module.scss";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import Price from "components/price/price";
import { useAuth } from "contexts/auth/auth.context";
import useRouterStatus from "hooks/useRouterStatus";
import { useAppSelector } from "hooks/useRedux";
import { selectUserCart } from "redux/slices/userCart";
import useModal from "hooks/useModal";
import ConfirmationModal from "components/confirmationModal/confirmationModal";
import GroupOrderButton from "components/groupOrderButton/groupOrderButton";

type Props = {
  totalPrice: number;
  loading?: boolean;
};

export default function CartTotal({ loading, totalPrice = 0 }: Props) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { isAuthenticated } = useAuth();
  const { isLoading } = useRouterStatus();
  const cart = useAppSelector(selectUserCart);
  const [clicked, setClicked] = useState(false);
  const [openPrompt, handleOpenPrompt, handleClosePrompt] = useModal();
  const { user } = useAuth();

  function handleCheck() {
    setClicked(true);
    if (isAuthenticated) {
      const members = cart.user_carts.filter(
        (item) => item.user_id !== cart.owner_id
      );
      const isMemberActive = members.some((item) => item.status);
      if (isMemberActive) {
        handleOpenPrompt();
        return;
      }
      goToCheckout();
    } else {
      push("/login");
    }
  }

  function goToCheckout() {
    push(`/checkout/${cart.shop_id}`);
  }

  return (
    <div className={cls.wrapper}>
      <div className={cls.flex}>
        <div className={cls.label}>{t("total")}</div>
        <h4 className={cls.text}>
          <Price number={totalPrice} />
        </h4>
      </div>
      <div className={cls.actions}>
        <PrimaryButton
          onClick={handleCheck}
          loading={(isLoading && clicked) || loading}
        >
          {t("order")}
        </PrimaryButton>
        {user && <GroupOrderButton />}
      </div>
      {user && (
        <ConfirmationModal
          open={openPrompt}
          handleClose={handleClosePrompt}
          onSubmit={goToCheckout}
          loading={isLoading}
          title={t("group.order.permission")}
        />
      )}
    </div>
  );
}
