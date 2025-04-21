import { useAuth } from "contexts/auth/auth.context";
import Price from "components/price/price";
import { useTranslation } from "react-i18next";
import PrimaryButton from "components/button/primaryButton";
import useModal from "hooks/useModal";
import dynamic from "next/dynamic";
import { FormikProps } from "formik";
import { OrderFormValues } from "interfaces";
import { useMediaQuery } from "@mui/material";
import cls from "./checkoutWalletFunds.module.scss";
import Image from "next/image";
import { getNearestFloor } from "utils/getNearestFloor";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));
const CheckoutWalletFundsForm = dynamic(
  () => import("./checkoutWalletFundsForm"),
);

type Props = {
  formik: FormikProps<OrderFormValues>;
  totalPrice?: number;
  handleChangePaymentType: (tag: string) => void;
  handleOpenPaymentMethod: () => void;
};

export default function CheckoutWalletFunds({
  formik,
  totalPrice = 0,
  handleChangePaymentType,
  handleOpenPaymentMethod,
}: Props) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(min-width:600px)");
  const { user } = useAuth();
  const [open, handleOpen, handleClose] = useModal();

  const walletPrice = getNearestFloor(user?.wallet?.price);

  const handleChangeValue = (value: number) => {
    formik.setFieldValue("from_wallet_price", value);
  };

  const handleRemove = () => {
    formik.setFieldValue("from_wallet_price", 0);
  };

  return (
    <>
      <div className={cls.container}>
        <div className={cls.wallet}>
          <span className={cls.price}>
            <div className={cls.image}>
              <Image
                src="/images/purse.png"
                alt="wallet"
                width={24}
                height={24}
              />
            </div>
            <Price number={formik.values?.from_wallet_price || walletPrice} />
          </span>
          <span className={cls.description}>
            {t(
              formik.values?.from_wallet_price
                ? "has.paid.by.wallet"
                : "balance.in.your.wallet",
            )}
          </span>
        </div>
        <div className={cls.footer}>
          <span className={cls.text}>
            {t(
              walletPrice < 0
                ? "wallet.balance.negative"
                : formik.values?.from_wallet_price
                  ? "applied"
                  : "do.you.want.to.use.now?",
            )}
          </span>
          {!!formik.values?.from_wallet_price ? (
            <PrimaryButton
              size="small"
              onClick={handleRemove}
              fullWidth={false}
            >
              {t("remove")}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              size="small"
              fullWidth={false}
              onClick={handleOpen}
              disabled={totalPrice <= 0 || walletPrice <= 0 || !walletPrice}
            >
              {t("use")}
            </PrimaryButton>
          )}
        </div>
      </div>
      {isMobile ? (
        <ModalContainer
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: "500px",
            },
          }}
        >
          <CheckoutWalletFundsForm
            totalPrice={totalPrice}
            onClose={handleClose}
            handleChangePaymentType={handleChangePaymentType}
            handleChangeValue={handleChangeValue}
            handleOpenPaymentMethod={handleOpenPaymentMethod}
          />
        </ModalContainer>
      ) : (
        <MobileDrawer open={open} onClose={handleClose}>
          <CheckoutWalletFundsForm
            totalPrice={totalPrice}
            onClose={handleClose}
            handleChangePaymentType={handleChangePaymentType}
            handleChangeValue={handleChangeValue}
            handleOpenPaymentMethod={handleOpenPaymentMethod}
          />
        </MobileDrawer>
      )}
    </>
  );
}
