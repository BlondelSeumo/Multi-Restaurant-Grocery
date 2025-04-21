import React from "react";
import cls from "./walletActionButtons.module.scss";
import Price from "components/price/price";
import { useAuth } from "contexts/auth/auth.context";
import { useTranslation } from "react-i18next";
import AddCircleLineIcon from "remixicon-react/AddCircleLineIcon";
import SendPlaneFillIcon from "remixicon-react/SendPlaneFillIcon";
import { useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import { useQueryClient } from "react-query";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const WalletTopup = dynamic(() => import("components/walletTopup/walletTopup"));
const SendWalletMoney = dynamic(
  () => import("components/sendWalletMoney/sendWalletMoney"),
);

export default function WalletActionButtons() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user, refetchUser } = useAuth();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const [topUpOpen, handleTopUpOpen, handleTopUpClose] = useModal();
  const [sendMoneyOpen, handleSendMoneyOpen, handleSendMoneyClose] = useModal();

  const handleActionSuccess = () => {
    queryClient.invalidateQueries(["walletHistory"], { exact: false });
    refetchUser();
  };

  return (
    <>
      <div className={cls.root}>
        <button className={cls.btn} onClick={handleSendMoneyOpen}>
          <SendPlaneFillIcon />
        </button>
        <button className={cls.btn} onClick={handleTopUpOpen}>
          <AddCircleLineIcon />
        </button>
        <span className={cls.bold}>
          <span className={cls.text}>{t("wallet")}: </span>
          <Price number={user?.wallet?.price} />
        </span>
      </div>
      {isDesktop ? (
        <ModalContainer open={topUpOpen} onClose={handleTopUpClose}>
          <WalletTopup handleClose={handleTopUpClose} />
        </ModalContainer>
      ) : (
        <MobileDrawer open={topUpOpen} onClose={handleTopUpClose}>
          <WalletTopup handleClose={handleTopUpClose} />
        </MobileDrawer>
      )}
      {isDesktop ? (
        <ModalContainer open={sendMoneyOpen} onClose={handleSendMoneyClose}>
          <SendWalletMoney
            onActionSuccess={handleActionSuccess}
            handleClose={handleSendMoneyClose}
          />
        </ModalContainer>
      ) : (
        <MobileDrawer open={sendMoneyOpen} onClose={handleSendMoneyClose}>
          <SendWalletMoney
            onActionSuccess={handleActionSuccess}
            handleClose={handleSendMoneyClose}
          />
        </MobileDrawer>
      )}
    </>
  );
}
