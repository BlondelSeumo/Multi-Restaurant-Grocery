import React from "react";
import cls from "./topCartHeader.module.scss";
import useLocale from "hooks/useLocale";
import CloseFillIcon from "remixicon-react/CloseFillIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import { clearUserCart, selectUserCartCount } from "redux/slices/userCart";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import useModal from "hooks/useModal";
import { useMutation } from "react-query";
import cartService from "services/cart";
import ClearCartModal from "components/clearCartModal/clearCartModal";
import { clearCart } from "redux/slices/cart";

type Props = {};

export default function TopProtectedCartHeader({}: Props) {
  const { t } = useLocale();
  const [openModal, handleOpen, handleClose] = useModal();
  const cartCount = useAppSelector(selectUserCartCount);
  const dispatch = useAppDispatch();

  const { mutate: deleteCart, isLoading } = useMutation({
    mutationFn: (data: any) => cartService.delete(data),
    onSuccess: () => {
      dispatch(clearUserCart());
      dispatch(clearCart());
      handleClose();
    },
  });

  function clearCartItems() {
    const ids = [cartCount.id];
    deleteCart({ ids });
  }

  return (
    <div className="white-splash">
      <div className="container">
        <div className={cls.wrapper}>
          <div className={cls.naming}>
            <h1 className={cls.title}>
              {cartCount.isGroup ? t("group.order") : t("your.orders")}
            </h1>
            <p className={cls.text}>
              {t("number.of.products", { count: cartCount.count })}
            </p>
          </div>
          <div className={cls.actions}>
            {!!cartCount.count && (
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
        loading={isLoading}
      />
    </div>
  );
}
