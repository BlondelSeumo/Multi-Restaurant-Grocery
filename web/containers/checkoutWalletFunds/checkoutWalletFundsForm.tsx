import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { useAuth } from "contexts/auth/auth.context";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import SecondaryButton from "components/button/secondaryButton";
import { useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import Price from "components/price/price";
import { IconButton, InputAdornment, Stack } from "@mui/material";
import SwapLineIcon from "remixicon-react/SwapLineIcon";
import cls from "./checkoutWalletFundsForm.module.scss";
import { getNearestFloor } from "../../utils/getNearestFloor";

interface FormValues {
  from_wallet_price: number;
}

type Props = {
  onClose?: () => void;
  totalPrice?: number;
  handleChangeValue: (value: number) => void;
  handleChangePaymentType: (tag: string) => void;
  handleOpenPaymentMethod: () => void;
};

export default function CheckoutWalletFundsForm({
  totalPrice = 0,
  onClose,
  handleChangePaymentType,
  handleChangeValue,
  handleOpenPaymentMethod,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currency = useAppSelector(selectCurrency);

  const localWalletPrice = Number(getNearestFloor(user?.wallet?.price));
  const localTotalPrice = Number(totalPrice?.toFixed(2));

  const formik = useFormik({
    initialValues: {
      from_wallet_price:
        localWalletPrice >= localTotalPrice
          ? localTotalPrice
          : localWalletPrice,
    },
    validate: (values) => {
      let errors = {};
      const fromWalletPrice = values.from_wallet_price;
      if (
        fromWalletPrice < 1 ||
        fromWalletPrice > localWalletPrice ||
        fromWalletPrice > localTotalPrice
      ) {
        errors = {
          ...errors,
          from_wallet_price: `${t("must.be.between")} 1 ${t("and")} ${localWalletPrice > localTotalPrice ? localTotalPrice : localWalletPrice}`,
        };
      }
      return errors;
    },
    onSubmit: (values: FormValues) => {
      const { from_wallet_price } = values;
      if (from_wallet_price === localTotalPrice) {
        handleChangePaymentType("wallet");
      } else {
        handleOpenPaymentMethod();
      }
      if (from_wallet_price === localTotalPrice) {
        handleChangeValue(totalPrice);
      } else if (from_wallet_price === localWalletPrice) {
        handleChangeValue(localWalletPrice);
      } else {
        handleChangeValue(from_wallet_price);
      }
      handleClose();
    },
  });

  const remainingBalance = localWalletPrice - formik.values?.from_wallet_price;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSetFullPrice = () => {
    formik.setFieldValue("from_wallet_price", localTotalPrice);
  };

  const getText = () => {
    if (localTotalPrice <= localWalletPrice) {
      return {
        title: "you.can.pay.the.full.amount.with.your.wallet",
        description: "want.to.pay.via.your.wallet",
      };
    }

    return {
      title: "you.do.not.have.sufficient.balance.to.pay.full.amount.via.wallet",
      description: "want.to.pay.partially.with.wallet",
    };
  };

  return (
    <div className={cls.container}>
      <div className={cls.header}>
        <h2 className={cls.title}>{t(getText().title)}</h2>
        <p className={cls.description}>{t(getText().description)}?</p>
      </div>
      <form id="checkoutWalletFundsForm" onSubmit={formik.handleSubmit}>
        <div className={cls.item}>
          <TextInput
            fullWidth
            type="number"
            name="from_wallet_price"
            label={`${t("amount")} (${currency?.symbol})`}
            value={formik.values?.from_wallet_price}
            onChange={formik.handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <div className={cls.setFullPrice}>
                    <Stack direction="row">
                      <IconButton
                        onClick={handleSetFullPrice}
                        disableRipple
                        aria-label={t("full.price")}
                      >
                        <SwapLineIcon size={20} />
                      </IconButton>
                    </Stack>
                  </div>
                </InputAdornment>
              ),
            }}
          />
          {!!formik.errors?.from_wallet_price && (
            <span className={cls.error}>
              {formik.errors?.from_wallet_price}
            </span>
          )}
        </div>
        {remainingBalance > 0 && (
          <div className={cls.remainingBalance}>
            {t("remaining.wallet.balance")}: <Price number={remainingBalance} />
          </div>
        )}
        <div className={cls.footer}>
          <SecondaryButton onClick={handleClose}>{t("cancel")}</SecondaryButton>
          <PrimaryButton type="submit">{t("yes.pay")}</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
