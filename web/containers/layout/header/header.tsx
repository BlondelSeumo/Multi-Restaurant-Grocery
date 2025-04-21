import React, { useContext, useRef } from "react";
import Link from "next/link";
import cls from "./header.module.scss";
import { BrandLogo, BrandLogoDark, LoginIcon } from "components/icons";
import { ThemeContext } from "contexts/theme/theme.context";
import dynamic from "next/dynamic";
import SearchContainer from "containers/searchContainer/searchContainer";
import { useAuth } from "contexts/auth/auth.context";
import useModal from "hooks/useModal";
import { useRouter } from "next/router";
import BranchContainer from "containers/branchContainer/branchContainer";
import useLocale from "hooks/useLocale";
import FirstDeliveryTime from "components/firstDeliveryTime/firstDeliveryTime";
import NotificationStats from "components/notificationStats/notificationStats";
import HeartLineIcon from "remixicon-react/HeartLineIcon";

const AppDrawer = dynamic(() => import("components/appDrawer/appDrawer"));
const ProfileDropdown = dynamic(
  () => import("components/profileDropdown/profileDropdown")
);

export default function Header() {
  const { t } = useLocale();
  const { push, pathname } = useRouter();
  const { isDarkMode } = useContext(ThemeContext);
  const [appDrawer, handleOpenAppDrawer, handleCloseAppDrawer] = useModal();
  const searchContainerRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const isGroupOrderPage = pathname.includes("group/order");

  return (
    <div className={cls.container}>
      <div className="container">
        <header className={cls.header}>
          <div className={cls.flex}>
            <div className={cls.navItem}>
              <button className={cls.menuBtn} onClick={handleOpenAppDrawer}>
                menu
              </button>
            </div>
            <div className={cls.navItem}>
              <Link href="/" className={cls.brandLogo}>
                {isDarkMode ? <BrandLogoDark /> : <BrandLogo />}
              </Link>
            </div>
            <div className={cls.navItem}>
              <div className={cls.actions}>
                <Link href="/liked" className={cls.iconBtn}>
                  <HeartLineIcon />
                </Link>
                <NotificationStats />
              </div>
              {isAuthenticated ? (
                <ProfileDropdown data={user} />
              ) : (
                <button className={cls.loginBtn} onClick={() => push("/login")}>
                  <LoginIcon />
                  <span className={cls.text}>{t("login")}</span>
                </button>
              )}
            </div>
          </div>
          <div className={cls.bottom}>
            <div className={cls.navItem}>
              <div className={cls.actions}>
                <FirstDeliveryTime />
                {!isGroupOrderPage && <BranchContainer />}
              </div>
            </div>
            <div className={cls.navItem} ref={searchContainerRef}>
              <SearchContainer searchContainerRef={searchContainerRef} />
            </div>
          </div>
        </header>
        <AppDrawer open={appDrawer} handleClose={handleCloseAppDrawer} />
      </div>
    </div>
  );
}
