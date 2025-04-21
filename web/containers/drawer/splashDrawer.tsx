import React from "react";
import { Drawer, DrawerProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import cls from "./drawer.module.scss";
import CloseFillIcon from "remixicon-react/CloseFillIcon";

const Wrapper = styled(Drawer)(() => ({
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  "& .MuiPaper-root": {
    backgroundColor: "var(--secondary-bg)",
    boxShadow: "var(--popover-box-shadow)",
    borderRadius: "10px 10px 0 0",
    "@media (max-width: 576px)": {
      minWidth: "100vw",
      maxWidth: "100vw",
      borderRadius: "15px 15px 0 0",
    },
  },
}));

export default function SplashDrawer({
  anchor = "bottom",
  open,
  onClose,
  children,
  title,
  sx,
  PaperProps,
}: DrawerProps) {
  return (
    <Wrapper
      anchor={anchor}
      open={open}
      onClose={onClose}
      sx={sx}
      PaperProps={PaperProps}
    >
      <div className="layout-container">
        <div className="container" style={{ position: "relative" }}>
          {title ? <h1 className={cls.title}>{title}</h1> : ""}
          <button
            type="button"
            className={cls.splashCloseBtn}
            onClick={() => {
              if (onClose) onClose({}, "backdropClick");
            }}
          >
            <CloseFillIcon />
          </button>
        </div>
        {children}
      </div>
    </Wrapper>
  );
}
