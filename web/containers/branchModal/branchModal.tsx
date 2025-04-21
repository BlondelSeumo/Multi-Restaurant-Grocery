import React, { useState } from "react";
import cls from "./branchModal.module.scss";
import ModalContainer from "containers/modal/modal";
import { DialogProps } from "@mui/material";
import BranchListForm from "components/branchListForm/branchListForm";
import { useTranslation } from "react-i18next";
import shopService from "services/shop";
import { useQuery } from "react-query";
import BranchMap from "components/branchMap/branchMap";
import ConfirmationModal from "components/confirmationModal/confirmationModal";
import useModal from "hooks/useModal";
import useClearCart from "hooks/useClearCart";
import { IShop } from "interfaces";
import { useBranch } from "contexts/branch/branch.context";

interface Props extends DialogProps {}

export default function BranchModal({ ...rest }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [view, setView] = useState("list");
  const [tempBranch, setTempBranch] = useState<IShop | undefined>(undefined);
  const { updateBranch } = useBranch();
  const [openPrompt, handleOpenPrompt, handleClosePrompt] = useModal();
  const { isCartEmpty, clearCart } = useClearCart();

  const {
    data: branches,
    isLoading,
    error,
  } = useQuery(["branches", locale], () =>
    shopService.getAll({ page: 1, perPage: 100, open: 1 }),
  );

  if (error) {
    console.log("error => ", error);
  }

  const handleSubmit = (selectedValue: string) => {
    if (!selectedValue) {
      return;
    }
    const selectedBranch = branches?.data.find(
      (item) => String(item.id) == selectedValue,
    );
    setTempBranch(selectedBranch);
    if (!isCartEmpty) {
      handleOpenPrompt();
      return;
    }
    updateBranch(selectedBranch);
    if (rest.onClose) rest.onClose({}, "backdropClick");
  };

  const changeBranch = () => {
    clearCart();
    updateBranch(tempBranch);
    if (rest.onClose) rest.onClose({}, "backdropClick");
  };

  return (
    <ModalContainer {...rest}>
      <div className={cls.container}>
        <div className={cls.header}>
          <h2 className={cls.title}>{t("choose.your.branch")}</h2>
          <div className={cls.tabs}>
            <button
              type="button"
              className={`${cls.tab} ${view === "list" ? cls.active : ""}`}
              onClick={() => setView("list")}
            >
              <span className={cls.text}>{t("list")}</span>
            </button>
            <button
              type="button"
              className={`${cls.tab} ${view === "map" ? cls.active : ""}`}
              onClick={() => setView("map")}
            >
              <span className={cls.text}>{t("on.map")}</span>
            </button>
          </div>
        </div>
        <div style={{ display: view === "map" ? "block" : "none" }}>
          <BranchMap
            data={branches?.data}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </div>
        <div style={{ display: view === "list" ? "block" : "none" }}>
          <BranchListForm
            data={branches?.data}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
      <ConfirmationModal
        open={openPrompt}
        handleClose={handleClosePrompt}
        onSubmit={changeBranch}
        loading={isLoading}
        title={t("branch.change.permission")}
      />
    </ModalContainer>
  );
}
