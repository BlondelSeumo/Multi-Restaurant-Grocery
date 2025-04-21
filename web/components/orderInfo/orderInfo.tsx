import React from "react";
import { Order } from "interfaces";
import cls from "./orderInfo.module.scss";
import { useTranslation } from "react-i18next";
import PhoneFillIcon from "remixicon-react/PhoneFillIcon";
import Chat1FillIcon from "remixicon-react/Chat1FillIcon";
import DarkButton from "components/button/darkButton";
import SecondaryButton from "components/button/secondaryButton";
import CustomerService2FillIcon from "remixicon-react/CustomerService2FillIcon";
import RepeatOneFillIcon from "remixicon-react/RepeatOneFillIcon";
import Price from "components/price/price";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import useModal from "hooks/useModal";
import orderService from "services/order";
import { useMutation, useQueryClient } from "react-query";
import { error, success, warning } from "components/alert/toast";
import { useRouter } from "next/router";
import cartService from "services/cart";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  clearUserCart,
  selectUserCart,
  updateUserCart,
} from "redux/slices/userCart";
import Avatar from "components/avatar";
import PrimaryButton from "components/button/primaryButton";
import OrderTipContainer from "containers/orderTipContainer/orderTipContainer";
import paymentService from "services/payment";
import DeleteBin4LineIcon from "remixicon-react/DeleteBin4LineIcon";
import RepeatFillIcon from "remixicon-react/RepeatFillIcon";
import HorizontalLine from "components/line/horizontalLine";
import { useDateHourFormat } from "utils/useDateHourFormat";
import { useSettings } from "../../contexts/settings/settings.context";
import { checkIsTrue } from "../../utils/checkIsTrue";

const ConfirmationModal = dynamic(
  () => import("components/confirmationModal/confirmationModal"),
);
const OrderRefund = dynamic(
  () => import("containers/orderRefundContainer/orderRefundContainer"),
);
const AutoRepeatOrderContainer = dynamic(
  () => import("containers/autoRepeatOrder/autoRepeatOrderContainer"),
);
const DrawerContainer = dynamic(() => import("containers/drawer/drawer"));
const Chat = dynamic(() => import("containers/chat/chat"));

type Props = {
  data?: Order;
};

export default function OrderInfo({ data }: Props) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const locale = i18n.language;
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const cart = useAppSelector(selectUserCart);
  const { hourFormat, getDeliveryTime } = useDateHourFormat();
  const [openModal, handleOpen, handleClose] = useModal();
  const [
    openDeleteAutoRepeatOrderModal,
    handleOpenDeleteAutoRepeatOrderModal,
    handleCloseDeleteAutoRepeatOrderModal,
  ] = useModal();
  const [
    openAutoRepeatModal,
    handleOpenAutoRepeatModal,
    handleCloseAutoRepeatModal,
  ] = useModal();
  const [openChat, handleOpenChat, handleCloseChat] = useModal();
  const [openTip, handleOpenTip, handleCloseTip] = useModal();
  const canRefund =
    checkIsTrue(settings?.system_refund) &&
    !data?.order_refunds?.some(
      (item) =>
        item.status === "approved" ||
        item.status === "pending" ||
        item.status === "accepted",
    );
  const isFromWalletPrice =
    (data?.transactions?.length || 0) > 1 &&
    data?.transactions?.some(
      (transaction) => transaction?.payment_system?.tag === "wallet",
    );

  const { mutate: orderCancel, isLoading } = useMutation({
    mutationFn: () => orderService.cancel(data?.id || 0),
    onSuccess: () => {
      handleClose();
      push("/orders");
      success(t("order.cancelled"));
    },
    onError: (err: any) => error(err?.statusCode),
  });

  const {
    mutate: orderAutoRepeatDelete,
    isLoading: isLoadingAutoRepeatDelete,
  } = useMutation({
    mutationFn: () => orderService.deleteAutoRepeat(data?.repeat?.id || 0),
    onSuccess: () => {
      handleCloseDeleteAutoRepeatOrderModal();
      queryClient.invalidateQueries(["orders", data?.id, locale]);
      success(t("auto.repeat.order.deleted"));
    },
    onError: (err: any) => error(err?.statusCode),
  });

  const { isLoading: loadingRepeatOrder, mutate: insertProducts } = useMutation(
    {
      mutationFn: (data: any) => cartService.insert(data),
      onSuccess: (data) => {
        dispatch(updateUserCart(data.data));
        push(`/checkout/${data.data.shop_id}`);
      },
      onError: () => {
        error(t("error.400"));
      },
    },
  );

  const { isLoading: isLoadingClearCart, mutate: mutateClearCart } =
    useMutation({
      mutationFn: (data: any) => cartService.delete(data),
      onSuccess: () => {
        dispatch(clearUserCart());
        repeatOrder();
      },
    });

  function repeatOrder() {
    if (!checkIsAbleToAddProduct()) {
      mutateClearCart({ ids: [cart.id] });
      return;
    }
    let products: any[] = [];
    data?.details.forEach((item) => {
      const addons = item.addons.map((el) => ({
        stock_id: el.stock.id,
        quantity: el.quantity,
        parent_id: item.stock.id,
      }));
      if (!item.bonus) {
        products.push({
          stock_id: item.stock.id,
          quantity: item.quantity,
        });
      }
      products.push(...addons);
    });
    const payload = {
      shop_id: data?.shop.id,
      currency_id: data?.currency?.id,
      rate: data?.rate,
      products,
    };
    insertProducts(payload);
  }

  function checkIsAbleToAddProduct() {
    return cart.shop_id === 0 || cart.shop_id === data?.shop.id;
  }

  const { isLoading: isLoadingPay, mutate: payExternal } = useMutation({
    mutationFn: (params: any) =>
      paymentService.payExternal(params?.type, params?.body),
    onSuccess: (data) => {
      window.location.replace(data.data.data.url);
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  const handlePay = () => {
    if (!data?.transaction?.payment_system?.tag) {
      warning(t("no.payment.system.tag"));
      return;
    }
    const body = {
      order_id: data?.id,
    };

    payExternal({ type: data?.transaction?.payment_system?.tag || "", body });
  };

  return (
    <div className={cls.wrapper}>
      <div className={cls.header}>
        <div>
          <h4 className={cls.title}>{t("order")}</h4>
          <div className={cls.subtitle}>
            <span className={cls.text}>#{data?.id}</span>
            <span className={cls.dot} />
            <span className={cls.text}>
              {dayjs(data?.created_at).format(`MMM DD, ${hourFormat}`)}
            </span>
          </div>
        </div>
        {data?.status === "delivered" && canRefund && <OrderRefund />}
      </div>
      <div className={cls.address}>
        {data?.delivery_type === "pickup" ? (
          <label>{t("pickup.address")}</label>
        ) : (
          <label>{t("delivery.address")}</label>
        )}
        <h6 className={cls.text}>{data?.address?.address}</h6>
        <br />
        {data?.delivery_type === "pickup" ? (
          <label>{t("pickup.time")}</label>
        ) : (
          <label>{t("delivery.time")}</label>
        )}
        <h6 className={cls.text}>
          {dayjs(data?.delivery_date).format("ddd, MMM DD,")}{" "}
          {getDeliveryTime(data?.delivery_time)}
        </h6>
        <br />
        <label>{t("code.for.order.confirmation")}</label>
        <h6 className={cls.text} style={{ textTransform: "capitalize" }}>
          {data?.otp ?? t("N/A")}
        </h6>
      </div>
      <div className={cls.body}>
        <div className={cls.flex}>
          <label>{t("subtotal")}</label>
          <span className={cls.price}>
            <Price
              number={data?.origin_price}
              symbol={data?.currency?.symbol}
            />
          </span>
        </div>
        <div className={cls.flex}>
          <label>{t("delivery.price")}</label>
          <span className={cls.price}>
            <Price
              number={data?.delivery_fee}
              symbol={data?.currency?.symbol}
            />
          </span>
        </div>
        <div className={cls.flex}>
          <label>{t("shop.tax")}</label>
          <span className={cls.price}>
            <Price
              number={data?.tax}
              symbol={data?.currency?.symbol}
              position={data?.currency?.position}
            />
          </span>
        </div>
        <div className={cls.flex}>
          <label>{t("tips")}</label>
          <span className={cls.price}>
            <Price number={data?.tips} symbol={data?.currency?.symbol} />
          </span>
        </div>
        <div className={cls.flex}>
          <label>{t("discount")}</label>
          <span className={cls.discount}>
            <Price
              number={data?.total_discount}
              minus
              symbol={data?.currency?.symbol}
            />
          </span>
        </div>
        {!!data?.coupon && (
          <div className={cls.flex}>
            <label>{t("promo.code")}</label>
            <span className={cls.discount}>
              <Price
                number={data.coupon.price}
                minus
                symbol={data.currency?.symbol}
              />
            </span>
          </div>
        )}
        <div className={cls.flex}>
          <label className={cls.totalLabel}>{t("total")}</label>
          <span className={cls.totalPrice}>
            <Price number={data?.total_price} symbol={data?.currency?.symbol} />
          </span>
        </div>
      </div>
      {!!data?.transactions && !!data?.transactions?.length && (
        <>
          <HorizontalLine color="var(--border-color)" margin="0 0 20px" />
          <div className={cls.transactions}>
            {data?.transactions?.map((transaction) => (
              <div key={transaction?.id} className={cls.item}>
                <span className={cls.label}>
                  {t(transaction?.payment_system?.tag)}
                </span>
                <span
                  className={`${cls.value} ${
                    transaction?.payment_system?.tag === "wallet" &&
                    isFromWalletPrice &&
                    cls.red
                  }`}
                >
                  <Price
                    number={transaction?.price}
                    minus={
                      transaction?.payment_system?.tag === "wallet" &&
                      isFromWalletPrice
                    }
                  />
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {data?.deliveryman ? (
        <div className={cls.courierBlock}>
          <div className={cls.courier}>
            <div className={cls.avatar}>
              <div className={cls.imgWrapper}>
                <Avatar data={data.deliveryman} />
              </div>
            </div>
            <div className={cls.naming}>
              <h5 className={cls.name}>
                {data.deliveryman.firstname}{" "}
                {data.deliveryman.lastname?.charAt(0)}.
              </h5>
              <p className={cls.text}>{t("driver")}</p>
            </div>
          </div>
          <div className={cls.actions}>
            <a href={`tel:${data.deliveryman.phone}`} className={cls.iconBtn}>
              <PhoneFillIcon />
            </a>
            <button className={cls.iconBtn} onClick={handleOpenChat}>
              <Chat1FillIcon />
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
      {data?.status !== "canceled" &&
        data?.transaction?.status === "progress" &&
        data?.transaction?.payment_system?.tag !== "cash" &&
        data?.transaction?.payment_system?.tag !== "wallet" &&
        !data?.order_refunds?.length && (
          <div className={cls.footer}>
            <PrimaryButton loading={isLoadingPay} onClick={handlePay}>
              {t("pay")}
            </PrimaryButton>
          </div>
        )}
      {data?.status === "new" ? (
        <div className={cls.footer}>
          <SecondaryButton type="button" onClick={handleOpen}>
            {t("cancel.order")}
          </SecondaryButton>
        </div>
      ) : data?.status === "delivered" || data?.status === "canceled" ? (
        <>
          <div className={cls.footer}>
            {!data?.tips && !data?.order_refunds?.length && (
              <PrimaryButton onClick={handleOpenTip}>
                {t("add.tip")}
              </PrimaryButton>
            )}
            {data?.status === "delivered" ? (
              data?.repeat ? (
                <div className={cls.main}>
                  <SecondaryButton
                    type="button"
                    icon={<DeleteBin4LineIcon />}
                    onClick={handleOpenDeleteAutoRepeatOrderModal}
                  >
                    {t("delete.repeat.order")}
                  </SecondaryButton>
                </div>
              ) : (
                <div className={cls.main}>
                  <SecondaryButton
                    icon={<RepeatFillIcon />}
                    type="button"
                    onClick={handleOpenAutoRepeatModal}
                  >
                    {t("auto.repeat.order")}
                  </SecondaryButton>
                </div>
              )
            ) : (
              ""
            )}
            <div className={cls.main}>
              <a
                href={`tel:${data.shop.phone}`}
                style={{ display: "block", width: "100%" }}
              >
                <DarkButton icon={<CustomerService2FillIcon />} type="button">
                  {t("support")}
                </DarkButton>
              </a>
              <SecondaryButton
                icon={<RepeatOneFillIcon />}
                type="button"
                onClick={repeatOrder}
                loading={isLoadingClearCart || loadingRepeatOrder}
              >
                {t("repeat.order")}
              </SecondaryButton>
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      <ConfirmationModal
        open={openModal}
        handleClose={handleClose}
        onSubmit={orderCancel}
        loading={isLoading}
        title={t("are.you.sure.cancel.order")}
      />

      <ConfirmationModal
        open={openDeleteAutoRepeatOrderModal}
        handleClose={handleCloseDeleteAutoRepeatOrderModal}
        onSubmit={orderAutoRepeatDelete}
        loading={isLoadingAutoRepeatDelete}
        title={t("are.you.sure.delete.auto.repeat.order")}
      />

      <DrawerContainer
        open={openChat}
        onClose={handleCloseChat}
        PaperProps={{ style: { padding: 0, width: "500px" } }}
      >
        <Chat
          receiverId={data?.deliveryman?.id}
          title={`${data?.deliveryman?.firstname || ""} ${data?.deliveryman?.lastname || ""}`}
          translateTitle={
            !data?.deliveryman?.firstname && !data?.deliveryman?.lastname
          }
        />
      </DrawerContainer>
      <OrderTipContainer data={data} open={openTip} onClose={handleCloseTip} />
      <AutoRepeatOrderContainer
        open={openAutoRepeatModal}
        onClose={handleCloseAutoRepeatModal}
      />
    </div>
  );
}
