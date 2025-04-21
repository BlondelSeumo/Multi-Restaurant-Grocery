import React, { useMemo } from "react";
import cls from "./checkout.module.scss";
import { IShop, OrderFormValues, Payment } from "interfaces";
import CheckoutPayment from "containers/checkoutPayment/checkoutPayment";
import { useFormik } from "formik";
import { useSettings } from "contexts/settings/settings.context";
import orderService from "services/order";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { selectCurrency } from "redux/slices/currency";
import { selectUserCart } from "redux/slices/userCart";
import paymentService from "services/payment";
import { error, warning } from "components/alert/toast";
import { useTranslation } from "react-i18next";
import useShopWorkingSchedule from "hooks/useShopWorkingSchedule";
import getFirstValidDate from "utils/getFirstValidDate";
import { selectOrder } from "redux/slices/order";
import shopService from "services/shop";
import { clearCart } from "redux/slices/cart";

type Props = {
  data: IShop;
  children: any;
};

export default function CheckoutContainer({ data, children }: Props) {
  const { t } = useTranslation();
  const { address, location } = useSettings();
  const latlng = location;
  const { push, query } = useRouter();
  const currency = useAppSelector(selectCurrency);
  const cart = useAppSelector(selectUserCart);
  const { order } = useAppSelector(selectOrder);
  const { isOpen } = useShopWorkingSchedule(data);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const branchId = Number(query.id);

  const { data: payments } = useQuery("payments", () =>
    paymentService.getAll({ perPage: 100 }),
  );

  const { paymentType, paymentTypes } = useMemo(() => {
    const defaultPaymentType: Payment | undefined = payments?.data.find(
      (item: Payment) => item.tag === "cash",
    );
    const paymentTypesList: Payment[] = payments?.data || [];
    return {
      paymentType: defaultPaymentType,
      paymentTypes: paymentTypesList,
    };
  }, [payments]);

  const formik = useFormik({
    initialValues: {
      coupon: "",
      location: {
        latitude: latlng?.split(",")[0],
        longitude: latlng?.split(",")[1],
      },
      address: {
        address,
        office: "",
        house: "",
        floor: "",
      },
      delivery_date: order.delivery_date || getFirstValidDate(data).date,
      delivery_time: order.delivery_time || getFirstValidDate(data).time,
      delivery_type: "delivery",
      note: "",
      payment_type: paymentType,
      notes: {},
      from_wallet_price: 0,
      cash_change: undefined,
    },
    enableReinitialize: true,
    onSubmit: (values: OrderFormValues) => {
      if (!values.payment_type) {
        warning(t("choose.payment.method"));
        return;
      }
      if (!isOpen) {
        warning(t("shop.closed"));
        return;
      }
      const notes = Object.keys(values.notes).reduce((acc: any, key) => {
        const value = values.notes[key]?.trim()?.length
          ? values.notes[key]
          : undefined;
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {});
      const payload = {
        ...values,
        payment_type: undefined,
        payment_id: formik.values?.payment_type?.id,
        currency_id: currency?.id,
        rate: currency?.rate,
        shop_id: data.id,
        cart_id: cart.id,
        note: values?.note && values?.note?.length ? values?.note : undefined,
        notes,
        from_wallet_price:
          values?.payment_type?.tag !== "wallet" && values?.from_wallet_price
            ? values?.from_wallet_price
            : undefined,
        cash_change: values?.cash_change ? `${values?.cash_change}` : undefined,
      };
      mutate(payload);
    },
  });

  const { isLoading, mutate } = useMutation({
    mutationFn: (data: any) => orderService.create(data),
    onSuccess: (data) => {
      const payload = {
        id: data.data.id,
        payment: {
          payment_sys_id: formik.values.payment_type?.id,
        },
      };
      dispatch(clearCart());
      if (
        formik.values.payment_type?.tag &&
        formik.values.payment_type?.tag !== "cash" &&
        formik.values.payment_type?.tag !== "wallet"
      ) {
        externalPay({
          type: formik.values.payment_type?.tag,
          data: { order_id: payload.id },
        });
      }
      queryClient.invalidateQueries(["profile", currency?.id]);
      push(`/orders/${data.data.id}`);
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  const { isLoading: isLoadingPay, mutate: externalPay } = useMutation({
    mutationFn: ({ type, data }: { type: string; data: any }) =>
      paymentService.payExternal(type, data),
    onSuccess: (data) => {
      window.location.replace(data.data.data.url);
    },
    onError: (err: any) => {
      error(err?.data?.message);
    },
  });

  const { isSuccess: isInZone } = useQuery(
    ["shopZone", formik.values.location],
    () =>
      shopService.checkZoneById(branchId, { address: formik.values.location }),
  );

  return (
    <div className={cls.root}>
      {!isInZone && formik.values.delivery_type === "delivery" && (
        <div className="container">
          <div className={cls.warning}>
            <div className={cls.text}>{t("no.delivery.address")}</div>
          </div>
        </div>
      )}
      <div className="container">
        <section className={cls.wrapper}>
          <main className={cls.body}>
            {React.Children.map(children, (child) => {
              return React.cloneElement(child, { data, formik, isInZone });
            })}
          </main>
          <aside className={cls.aside}>
            <CheckoutPayment
              formik={formik}
              loading={isLoading || isLoadingPay}
              payments={paymentTypes}
              isInZone={isInZone}
            />
          </aside>
        </section>
      </div>
    </div>
  );
}
