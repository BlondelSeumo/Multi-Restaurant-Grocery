/* eslint-disable @next/next/no-img-element */
import React, { useContext } from "react";
import DrawerContainer from "containers/drawer/drawer";
import cls from "./appDrawer.module.scss";
import { useTranslation } from "react-i18next";
import { BrandLogoRounded } from "components/icons";
import SecondaryButton from "components/button/secondaryButton";
import DarkButton from "components/button/darkButton";
import { useRouter } from "next/router";
import { ThemeContext } from "contexts/theme/theme.context";
import MoonFillIcon from "remixicon-react/MoonFillIcon";
import SunFillIcon from "remixicon-react/SunFillIcon";
import { useAuth } from "contexts/auth/auth.context";
import MobileAppDrawer from "./mobileAppDrawer";
import { useSettings } from "contexts/settings/settings.context";

type Props = {
  open: boolean;
  handleClose: () => void;
};

export default function AppDrawer({ open, handleClose }: Props) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();

  return (
    <DrawerContainer anchor="left" open={open} onClose={handleClose}>
      <button className={cls.iconBtn} onClick={toggleDarkMode}>
        {isDarkMode ? <MoonFillIcon /> : <SunFillIcon />}
        <span className={cls.iconBtnText}>
          {isDarkMode ? t("dark.mode") : t("light.mode")}
        </span>
      </button>
      <div className={cls.wrapper}>
        <MobileAppDrawer handleClose={handleClose} />
        {!isAuthenticated ? (
          <div className={cls.actions}>
            <DarkButton
              onClick={() => {
                push("/register");
                handleClose();
              }}
            >
              {t("sign.up")}
            </DarkButton>
            <SecondaryButton
              onClick={() => {
                push("/login");
                handleClose();
              }}
            >
              {t("login")}
            </SecondaryButton>
          </div>
        ) : (
          ""
        )}
        <div className={cls.footer}>
          <div className={cls.flex}>
            <BrandLogoRounded />
            <p className={cls.text}>{t("app.text")}</p>
          </div>
          <div className={cls.flex}>
            <a
              href={settings?.customer_app_ios}
              className={cls.item}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={cls.imgWrapper}>
                <img src="/images/app-store.webp" alt="App store" />
              </span>
            </a>
            <a
              href={settings?.customer_app_android}
              className={cls.item}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={cls.imgWrapper}>
                <img src="/images/google-play.webp" alt="Google play" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </DrawerContainer>
  );
}
