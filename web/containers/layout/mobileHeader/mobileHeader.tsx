import React, { useContext } from "react";
import Link from "next/link";
import cls from "./mobileHeader.module.scss";
import { BrandLogo, BrandLogoDark } from "components/icons";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import { ThemeContext } from "contexts/theme/theme.context";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import NotificationStats from "components/notificationStats/notificationStats";
import BranchContainer from "containers/branchContainer/branchContainer";
import { useBranch } from "contexts/branch/branch.context";
import { ChatContext } from "contexts/chat/chat.context";

const AppDrawer = dynamic(() => import("components/appDrawer/appDrawer"));
const MobileSearchContainer = dynamic(
  () => import("containers/mobileSearchContainer/mobileSearchContainer"),
);
const DrawerContainer = dynamic(() => import("containers/drawer/drawer"));
const Chat = dynamic(() => import("containers/chat/chat"));

export default function MobileHeader() {
  const { branch } = useBranch();
  const { isDarkMode } = useContext(ThemeContext);
  const { isChatOpen, toggleChat } = useContext(ChatContext);
  const [appDrawer, handleOpenAppDrawer, handleCloseAppDrawer] = useModal();
  const [searchModal, handleOpenSearchModal, handleCloseSearchModal] =
    useModal();

  return (
    <header className={`container ${cls.header}`}>
      <div className={cls.navItem}>
        <button className={cls.menuBtn} onClick={handleOpenAppDrawer}>
          menu
        </button>
        <Link href="/" className={cls.brandLogo}>
          {isDarkMode ? <BrandLogoDark /> : <BrandLogo />}
        </Link>
        <div className={cls.actions}>
          <div style={{ display: "none" }}>
            <BranchContainer />
          </div>
          <NotificationStats />
          <button className={cls.iconBtn} onClick={handleOpenSearchModal}>
            <Search2LineIcon />
          </button>
        </div>
      </div>

      <AppDrawer open={appDrawer} handleClose={handleCloseAppDrawer} />
      <MobileSearchContainer
        open={searchModal}
        onClose={handleCloseSearchModal}
        fullScreen
      />
      <DrawerContainer
        open={isChatOpen}
        onClose={toggleChat}
        PaperProps={{ style: { padding: 0, width: "500px" } }}
      >
        <Chat receiverId={branch?.user_id} title="shop" translateTitle />
      </DrawerContainer>
    </header>
  );
}
