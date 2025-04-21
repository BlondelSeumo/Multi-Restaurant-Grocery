import { Stack } from "@mui/material";
import { IAddress } from "interfaces/address.interface";
import React from "react";
import MapPinRangeLineIcon from "remixicon-react/MapPinRangeLineIcon";
import cls from "./addressModal.module.scss";
import More2FillIcon from "remixicon-react/More2FillIcon";
import usePopover from "hooks/usePopover";
import PopoverContainer from "containers/popover/popover";
import EditLineIcon from "remixicon-react/EditLineIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import { useTranslation } from "react-i18next";

export default function AddressCard({
  address,
  selectedAddress,
  onClick,
  onDelete,
  onEdit,
}: {
  address: IAddress;
  selectedAddress: IAddress | null;
  onClick: (address: IAddress) => void;
  onDelete: (id: number) => void;
  onEdit: (address: IAddress) => void;
}) {
  const { t } = useTranslation();
  const [open, anchor, handleOpen, handleClose] = usePopover();
  return (
    <button
      className={`${cls.addressButton} ${
        address.id === selectedAddress?.id ? cls.buttonActive : ""
      }`}
      onClick={() => onClick(address)}
    >
      <div className={cls.location}>
        <MapPinRangeLineIcon />
      </div>
      <Stack alignItems="flex-start">
        <div className={cls.addressTitle}>
          {address.title || address.address?.address}
        </div>
        <span className={cls.address}>{address.address?.address}</span>
      </Stack>
      <span
        className={cls.moreOptionsBtn}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleOpen(e);
        }}
      >
        <More2FillIcon size={20} />
      </span>
      <PopoverContainer
        open={open}
        anchorEl={anchor}
        onClose={(e) => {
          // @ts-ignore
          e.stopPropagation();
          handleClose();
        }}
        anchorOrigin={{
          vertical: 30,
          horizontal: -55,
        }}
      >
        <div className={cls.popoverContainer}>
          <button
            type="button"
            className={cls.item}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(address);
              handleClose();
            }}
          >
            <EditLineIcon size={16} />
            <span>{t("edit")}</span>
          </button>
          {!(address.id === selectedAddress?.id || !!address?.active) && (
            <button
              type="button"
              className={cls.item}
              onClick={(e) => {
                e.stopPropagation();
                if (address?.id) {
                  onDelete(address?.id);
                }
              }}
            >
              <DeleteBinLineIcon size={16} />
              <span>{t("delete")}</span>
            </button>
          )}
        </div>
      </PopoverContainer>
    </button>
  );
}
