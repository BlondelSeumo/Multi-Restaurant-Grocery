import React, { useRef } from "react";
import useModal from "hooks/useModal";
import { useTranslation } from "react-i18next";
import cls from "./branchContainer.module.scss";
import { useQuery } from "react-query";
import useUserLocation from "hooks/useUserLocation";
import usePopover from "hooks/usePopover";
import { useMediaQuery } from "@mui/material";
import dynamic from "next/dynamic";
import BranchPopover from "components/addressPopover/branchPopover";
import shopService from "services/shop";
import BranchModal from "containers/branchModal/branchModal";
import { useBranch } from "contexts/branch/branch.context";
import { useRouter } from "next/router";
import { BranchIcon } from "components/icons";

const PopoverContainer = dynamic(() => import("containers/popover/popover"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));

const STALE_TIME = 1 * 60 * 60 * 1000;

type Props = {};

export default function BranchContainer({}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const branchRef = useRef<any>();
  const [branchModal, handleOpenBranchModal, handleCloseBranchModal] =
    useModal();
  const [
    branchPopover,
    anchorEl,
    handleOpenBranchPopover,
    handleCloseBranchPopover,
  ] = usePopover();
  const { branch, updateBranch } = useBranch();
  const location = useUserLocation();
  const { query } = useRouter();

  const { data } = useQuery(
    ["nearestBranch", locale, location],
    () => shopService.getNearestShop({ address: location }),
    {
      staleTime: branch?.id ? STALE_TIME : 0,
      onSuccess(data) {
        if (!branch?.id || branch?.id === data.data.id) {
          updateBranch(data.data);
        } else {
          if (!query.product) branchRef.current.click();
        }
      },
    }
  );

  const { refetch: refetchBranch } = useQuery(
    ["oldBranch", locale, branch?.id],
    () => shopService.getById(Number(branch?.id)),
    {
      staleTime: 0,
      enabled: false,
      onSuccess(data) {
        updateBranch(data.data);
      },
      onError() {
        if (data?.data) updateBranch(data?.data);
      },
    }
  );

  const handleClickAddressRef = (event: any) => {
    event.stopPropagation();
    handleOpenBranchPopover(event);
  };

  const handleClickBranchClose = () => {
    handleCloseBranchPopover();
    refetchBranch();
  };

  return (
    <>
      <button className={cls.address} onClick={handleOpenBranchModal}>
        <BranchIcon />
        <div
          ref={branchRef}
          className={cls.addressTitle}
          onClick={handleClickAddressRef}
        >
          <p>
            {t("branch")}
            {": "}
            {branch?.translation?.title}
          </p>
        </div>
      </button>
      {isDesktop ? (
        <PopoverContainer
          open={branchPopover}
          anchorEl={anchorEl}
          onClose={handleClickBranchClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <BranchPopover
            handleCloseBranchPopover={handleClickBranchClose}
            branch={data?.data}
          />
        </PopoverContainer>
      ) : (
        <MobileDrawer open={branchPopover} onClose={handleClickBranchClose}>
          <BranchPopover
            handleCloseBranchPopover={handleClickBranchClose}
            branch={data?.data}
          />
        </MobileDrawer>
      )}
      {branchModal && (
        <BranchModal
          open={branchModal}
          onClose={handleCloseBranchModal}
          fullScreen={!isDesktop}
        />
      )}
    </>
  );
}
