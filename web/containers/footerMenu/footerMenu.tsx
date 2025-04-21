import React from "react";
import Link from "next/link";
import cls from "./footerMenu.module.scss";
import RestaurantFillIcon from "remixicon-react/RestaurantFillIcon";
import HistoryFillIcon from "remixicon-react/HistoryFillIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import ReservedLineIcon from "remixicon-react/ReservedLineIcon";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useScrollDirection } from "hooks/useScrollDirection";
import { useAuth } from "contexts/auth/auth.context";
import CartButton from "components/cartButton/cartButton";
import useModal from "hooks/useModal";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@mui/material";
import { useShop } from "contexts/shop/shop.context";
import MemberCartButton from "components/cartButton/memberCartButton";
import ModalContainer from "containers/modal/modal";
import ReservationFind from "components/reservationFind/reservationFind";
import { useSettings } from "../../contexts/settings/settings.context";
import { checkIsTrue } from "../../utils/checkIsTrue";

const SplashDrawer = dynamic(() => import("containers/drawer/splashDrawer"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const CartContainer = dynamic(() => import("containers/cart/cartContainer"));

type Props = {};

export default function FooterMenu({}: Props) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { pathname } = useRouter();
  const scrollDirection = useScrollDirection();
  const { isAuthenticated } = useAuth();
  const { isMember } = useShop();
  const { settings } = useSettings();
  const [openCart, handleOpenCart, handleCloseCart] = useModal();
  const [openReservation, handleOpenReservation, handleCloseReservation] =
    useModal();

  return (
    <div className={cls.root}>
      <div className={`${cls.scroll} ${cls[scrollDirection]}`}>
        <div className={cls.flex}>
          <div className={cls.wrapper}>
            <ul className={cls.list}>
              <li className={cls.item}>
                <Link
                  href={"/"}
                  className={`${cls.link} ${
                    pathname === "/" ? cls.active : ""
                  }`}
                >
                  <RestaurantFillIcon />
                  <span className={cls.text}>{t("foods")}</span>
                </Link>
              </li>
              {isAuthenticated && (
                <li className={cls.item}>
                  <Link
                    href={"/orders"}
                    className={`${cls.link} ${
                      pathname.includes("orders") ? cls.active : ""
                    }`}
                  >
                    <HistoryFillIcon />
                    <span className={cls.text}>{t("orders")}</span>
                  </Link>
                </li>
              )}
              <li className={cls.item}>
                <Link
                  href={"/liked"}
                  className={`${cls.link} ${
                    pathname.includes("liked") ? cls.active : ""
                  }`}
                >
                  <HeartLineIcon />
                  <span className={cls.text}>{t("liked")}</span>
                </Link>
              </li>
              {checkIsTrue(settings?.reservation_enable_for_user) && (
                <li className={cls.item}>
                  <Link
                    href={"/"}
                    className={cls.link}
                    onClick={handleOpenReservation}
                  >
                    <ReservedLineIcon />
                    <span className={cls.text}>{t("reservation")}</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
          {isMember ? (
            <MemberCartButton handleClick={handleOpenCart} />
          ) : isAuthenticated ? (
            <CartButton handleClick={handleOpenCart} />
          ) : (
            <CartButton handleClick={handleOpenCart} />
          )}
        </div>
      </div>
      {isDesktop ? (
        <SplashDrawer anchor="bottom" open={openCart} onClose={handleCloseCart}>
          <CartContainer />
        </SplashDrawer>
      ) : (
        <MobileDrawer anchor="bottom" open={openCart} onClose={handleCloseCart}>
          <CartContainer />
        </MobileDrawer>
      )}
      {isDesktop ? (
        <ModalContainer open={openReservation} onClose={handleCloseReservation}>
          <ReservationFind handleClose={handleCloseReservation} />
        </ModalContainer>
      ) : (
        <MobileDrawer open={openReservation} onClose={handleCloseReservation}>
          <ReservationFind handleClose={handleCloseReservation} />
        </MobileDrawer>
      )}
    </div>
  );
}
