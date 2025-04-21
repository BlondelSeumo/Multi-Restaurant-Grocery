import React from "react";
import cls from "./topCartHeader.module.scss";
import useLocale from "hooks/useLocale";
import CloseFillIcon from "remixicon-react/CloseFillIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import useModal from "hooks/useModal";
import ClearCartModal from "components/clearCartModal/clearCartModal";
import { clearCart, selectCart } from "redux/slices/cart";

type Props = {};

export default function TopCartHeader({}: Props) {
  const { t } = useLocale();
  const [openModal, handleOpen, handleClose] = useModal();
  const cartItems = useAppSelector(selectCart);
  const dispatch = useAppDispatch();

  function clearCartItems() {
    dispatch(clearCart());
    handleClose();
  }

  return (
    <div className="white-splash">
      <div className="container">
        <div className={cls.wrapper}>
          <div className={cls.naming}>
            <h1 className={cls.title}>{t("your.orders")}</h1>
            <p className={cls.text}>
              {t("number.of.products", { count: cartItems.length })}
            </p>
          </div>
          <div className={cls.actions}>
            {!!cartItems.length && (
              <button className={cls.btn} onClick={handleOpen}>
                <DeleteBinLineIcon />
                <span className={cls.text}>{t("delete.all")}</span>
              </button>
            )}
            <button className={cls.iconBtn}>
              <CloseFillIcon />
            </button>
          </div>
        </div>
      </div>
      <ClearCartModal
        open={openModal}
        handleClose={handleClose}
        onSubmit={clearCartItems}
      />
    </div>
  );
}
