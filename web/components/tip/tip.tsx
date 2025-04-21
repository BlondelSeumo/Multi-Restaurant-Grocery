import { useTranslation } from "react-i18next";
import { Order, Payment } from "interfaces";
import Price from "components/price/price";
import Edit2FillIcon from "remixicon-react/Edit2FillIcon";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import ArrowUpSLineIcon from "remixicon-react/ArrowUpSLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import React, { useState } from "react";
import TextInput from "components/inputs/textInput";
import PrimaryButton from "components/button/primaryButton";
import { useMutation, useQueryClient } from "react-query";
import paymentService from "services/payment";
import RadioInput from "components/inputs/radioInput";
import usePopover from "hooks/usePopover";
import PopoverContainer from "containers/popover/popover";
import { error, warning } from "components/alert/toast";
import { EXTERNAL_PAYMENTS } from "constants/constants";
import { percentToPrice } from "utils/calculatePercentTipToPrice";
import { tipPercents, tipFor } from "constants/tips";
import cls from "./tip.module.scss";

type Props = {
  data?: Order;
  handleClose: () => void;
  paymentList: Payment[];
  payment: Payment;
};

export default function Tip({
  data,
  handleClose,
  paymentList = [],
  payment,
}: Props) {
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const locale = i18n.language;

  const [openPayment, anchorPayment, handleOpenPayment, handleClosePayment] =
    usePopover();
  const [openTipFor, anchorTipFor, handleOpenTipFor, handleCloseTipFor] =
    usePopover();

  const [selectedTip, setSelectedTip] = useState<number | "custom">(
    tipPercents[0],
  );
  const [customTip, setCustomTip] = useState<string>();
  const [selectedPayment, setSelectedPayment] = useState(payment?.tag);
  const [selectedTipFor, setSelectedTipFor] = useState([tipFor[0]]);

  const disabledSubmitButton =
    (selectedTip === "custom" ? !customTip?.length : !selectedTip) ||
    !selectedPayment;

  const { isLoading: isExternalLoading, mutate: externalPayment } = useMutation(
    {
      mutationFn: (orderId: number) => {
        const body = {
          order_id: orderId,
          tips:
            selectedTip === "custom"
              ? Number(customTip)
              : percentToPrice(selectedTip, data?.total_price),
          for: selectedTipFor?.join(","),
        };
        return paymentService.payExternal(selectedPayment, body);
      },
      onSuccess: (data) => {
        handleClose();
        window.location.replace(data.data.data.url);
      },
      onError: (err: any) => {
        error(err?.data?.message);
      },
    },
  );

  const { isLoading: isWalletLoading, mutate: walletPayment } = useMutation({
    mutationFn: (orderId: number) => {
      const body = {
        order_id: orderId,
        tips:
          selectedTip === "custom"
            ? Number(customTip)
            : percentToPrice(selectedTip, data?.total_price),
        for: selectedTipFor?.join(","),
        payment_sys_id: paymentList.find((item) => item.tag === "wallet")?.id,
      };
      return paymentService.createTransaction(orderId, body);
    },
    onSuccess: () => {
      handleClose();
      queryClient.invalidateQueries(["order", data?.id, locale]);
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  const handleSubmit = () => {
    if (!data?.id) {
      warning(t("no.order.id"));
      return;
    }
    if (!selectedPayment) {
      warning(t("select.payment.type"));
      return;
    }
    if (!selectedTip) {
      warning(t("select.tip"));
      return;
    }
    if (selectedPayment === "wallet") {
      walletPayment(data.id);
    } else if (EXTERNAL_PAYMENTS.includes(selectedPayment)) {
      externalPayment(data.id);
    }
  };

  return (
    <div className={cls.wrapper}>
      <h2 className={cls.title}>{t("would.you.like.to.add.a.tip")}?</h2>
      <div className={cls.tipContainer}>
        <div className={cls.header}>
          <h3 className={cls.text}>{t("tip.for")}</h3>
          <button className={cls.selectedButton} onClick={handleOpenTipFor}>
            <div className={cls.selectedItems}>
              {selectedTipFor.map((item) => (
                <span className={cls.selectedItem} key={item}>
                  {t(item)}
                  {selectedTipFor?.length > 1 && (
                    <CloseLineIcon
                      className={cls.closeIcon}
                      size={18}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTipFor((prevState) =>
                          prevState?.filter(
                            (prevStateItem) => prevStateItem !== item,
                          ),
                        );
                      }}
                    />
                  )}
                </span>
              ))}
            </div>
            {openTipFor ? (
              <ArrowUpSLineIcon size={20} />
            ) : (
              <ArrowDownSLineIcon size={20} />
            )}
          </button>
        </div>
        <PopoverContainer
          open={openTipFor}
          anchorEl={anchorTipFor}
          onClose={handleCloseTipFor}
        >
          <div className={cls.paymentListWrapper}>
            {tipFor.map((item) => (
              <div key={item} className={cls.row}>
                <RadioInput
                  value={item}
                  id={item}
                  checked={selectedTipFor.includes(item)}
                  name="tipFor"
                  inputProps={{ "aria-label": item }}
                  onClick={() => {
                    setSelectedTipFor((prevState) => {
                      if (prevState.length === 1 && prevState.includes(item)) {
                        return [item];
                      }
                      return prevState.includes(item)
                        ? prevState.filter((i) => i !== item)
                        : [...prevState, item];
                    });
                  }}
                />
                <label className={cls.label} htmlFor={item}>
                  <span className={cls.text}>{t(item)}</span>
                </label>
              </div>
            ))}
          </div>
        </PopoverContainer>
      </div>
      <div className={cls.paymentContainer}>
        <div className={cls.header}>
          <h3 className={cls.text}>{t("payment.type")}</h3>
          <button className={cls.selectedButton} onClick={handleOpenPayment}>
            <span>{t(selectedPayment)}</span>
            {openPayment ? (
              <ArrowUpSLineIcon size={20} />
            ) : (
              <ArrowDownSLineIcon size={20} />
            )}
          </button>
        </div>
        <PopoverContainer
          open={openPayment}
          anchorEl={anchorPayment}
          onClose={handleClosePayment}
        >
          <div className={cls.paymentListWrapper}>
            {paymentList.map((item) => (
              <div key={item?.id} className={cls.row}>
                <RadioInput
                  value={item?.tag}
                  id={item?.tag}
                  onChange={() => {
                    setSelectedPayment(item?.tag);
                    handleClosePayment();
                  }}
                  checked={selectedPayment === item?.tag}
                  name="tipPayment"
                  inputProps={{ "aria-label": item?.tag }}
                />
                <label className={cls.label} htmlFor={item?.tag}>
                  <span className={cls.text}>{t(item?.tag)}</span>
                </label>
              </div>
            ))}
          </div>
        </PopoverContainer>
      </div>
      <div className={cls.body}>
        {tipPercents.map((percent) => (
          <button
            className={
              percent === selectedTip
                ? `${cls.item} ${cls.selectedItem}`
                : cls.item
            }
            key={percent}
            onClick={() => setSelectedTip(percent)}
          >
            <span className={cls.percent}>{percent}%</span>
            <span className={cls.price}>
              <Price
                number={percentToPrice(percent, data?.total_price)}
                symbol={data?.currency?.symbol}
              />
            </span>
          </button>
        ))}
        <button
          className={`${cls.item} ${
            selectedTip === "custom" ? cls.selectedItem : ""
          }`}
          onClick={() => setSelectedTip("custom")}
        >
          <Edit2FillIcon size={20} />
          <span className={cls.price}>{t("custom")}</span>
        </button>
      </div>
      {selectedTip === "custom" && (
        <div className={cls.customTip}>
          <TextInput
            name="customTip"
            label={`${t("custom.tip")} (${data?.currency?.symbol || "$"})`}
            placeholder={t("type.here")}
            type="number"
            value={customTip}
            inputProps={{
              pattern: "[0-9]*",
            }}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 0) {
                return;
              }
              setCustomTip(e.target.value);
            }}
          />
        </div>
      )}

      <div className={cls.footer}>
        <div
          className={`${cls.btnWrapper} ${
            disabledSubmitButton ? cls.btnWrapperDisabled : ""
          }`}
        >
          <PrimaryButton
            type="submit"
            loading={isExternalLoading || isWalletLoading}
            disabled={disabledSubmitButton}
            onClick={handleSubmit}
          >
            {t("submit")}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
