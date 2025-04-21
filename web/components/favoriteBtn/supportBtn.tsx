import React from "react";
import cls from "./favoriteBtn.module.scss";
import CustomerService2FillIcon from "remixicon-react/CustomerService2FillIcon";
import { useTranslation } from "react-i18next";
import { useAuth } from "contexts/auth/auth.context";
import useModal from "hooks/useModal";
import { warning } from "components/alert/toast";
import dynamic from "next/dynamic";
import { useQuery } from "react-query";
import request from "services/request";

const DrawerContainer = dynamic(() => import("containers/drawer/drawer"));
const Chat = dynamic(() => import("containers/chat/chat"));

type Props = {};

export default function SupportBtn({}: Props) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [open, handleOpen, handleClose] = useModal();

  function handleOpenChat() {
    if (!isAuthenticated) {
      warning(t("login.first"));
      return;
    }
    handleOpen();
  }

  const { data } = useQuery({
    queryKey: ["adminInfo", isAuthenticated],
    queryFn: () => request("dashboard/user/admin-info"),
    enabled: isAuthenticated,
  });

  return (
    <>
      <button type="button" className={cls.wrapper} onClick={handleOpenChat}>
        <CustomerService2FillIcon />
      </button>
      <DrawerContainer
        open={open}
        onClose={handleClose}
        PaperProps={{ style: { padding: 0, width: "500px" } }}
      >
        <Chat receiverId={data?.data?.id} />
      </DrawerContainer>
    </>
  );
}
