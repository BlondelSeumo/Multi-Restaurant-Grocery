import React, { useState } from "react";
import {
  CartStockWithProducts,
  InsertProductBody,
  OrderFormValues,
} from "interfaces";
import cls from "./checkoutProductItem.module.scss";
import SubtractFillIcon from "remixicon-react/SubtractFillIcon";
import AddFillIcon from "remixicon-react/AddFillIcon";
import getImage from "utils/getImage";
import Price from "components/price/price";
import useDebounce from "hooks/useDebounce";
import { selectCurrency } from "redux/slices/currency";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { useRouter } from "next/router";
import cartService from "services/cart";
import { updateUserCart } from "redux/slices/userCart";
import { useMutation, useQuery } from "react-query";
import useDidUpdate from "hooks/useDidUpdate";
import Loading from "components/loader/loading";
import { useTranslation } from "react-i18next";
import calculateCartProductTotal from "utils/calculateCartProductTotal";
import FallbackImage from "components/fallbackImage/fallbackImage";
import { removeFromCart, updateCartQuantity } from "redux/slices/cart";
import TextInput from "components/inputs/textInput";
import { FormikProps } from "formik";

type Props = {
  data: CartStockWithProducts;
  disabled: boolean;
  formik: FormikProps<OrderFormValues>;
};

export default function CheckoutProductItem({ data, disabled, formik }: Props) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(data.quantity);
  const [note, setNote] = useState<string | undefined>();
  const debouncedQuantity = useDebounce(quantity, 400);
  const currency = useAppSelector(selectCurrency);
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const shopId = Number(query.id);
  const isReduceDisabled = quantity < 1 || data.bonus || disabled;
  const isAddDisabled =
    !(data.stock.quantity > quantity) ||
    data.bonus ||
    disabled ||
    !(data.stock.product?.max_qty && data.stock.product?.max_qty > quantity);

  const interval = data?.stock?.product?.interval
    ? data?.stock?.product?.interval
    : 1;

  const unit =
    data?.stock?.product?.unit && data?.stock?.product?.unit?.active
      ? data?.stock?.product?.unit
      : null;

  const { totalPrice, oldPrice } = calculateCartProductTotal(data);

  const { refetch, isLoading: isCartLoading } = useQuery(
    "cart",
    () => cartService.get(),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      enabled: false,
    },
  );
  const { mutate: storeProduct, isLoading } = useMutation({
    mutationFn: (data: any) => cartService.insert(data),
    onSuccess: (data: any, variables: any) => {
      dispatch(updateUserCart(data.data));
      dispatch(updateCartQuantity(variables.products));
    },
  });

  const { mutate: deleteProducts, isLoading: isDeleteLoading } = useMutation({
    mutationFn: (data: any) => cartService.deleteCartProducts(data),
    onSuccess: () => {
      dispatch(removeFromCart(data));
      return refetch();
    },
  });

  function addProduct() {
    if (quantity !== data.stock.product.max_qty) {
      setQuantity((count) => count + 1);
    }
  }

  function reduceProduct() {
    if (quantity === 1) {
      setQuantity(0);
    } else {
      setQuantity((count) => count - 1);
    }
  }

  useDidUpdate(() => {
    if (debouncedQuantity) {
      storeProductToCart(data);
    } else {
      deleteFromCart(data);
    }
  }, [debouncedQuantity]);

  function storeProductToCart(product: CartStockWithProducts) {
    const body: InsertProductBody = {
      shop_id: shopId,
      currency_id: currency?.id,
      rate: currency?.rate,
      products: [
        {
          stock_id: product.stock.id,
          quantity,
        },
      ],
    };
    if (product.addons) {
      product.addons?.forEach((addon) => {
        body.products.push({
          stock_id: addon.stock.id,
          quantity: addon.quantity,
          parent_id: product.stock.id,
        });
      });
    }
    if (!product.bonus) {
      storeProduct(body);
    }
  }

  function deleteFromCart(product: CartStockWithProducts) {
    const addons = product.addons?.map((item) => item.stock.id) || [];
    deleteProducts({ ids: [product.id, ...addons] });
  }

  return (
    <div className={cls.row}>
      <div className={cls.col}>
        <h4 className={cls.title}>
          {data.stock.product?.translation?.title}{" "}
          {data.stock.extras?.length
            ? data.stock.extras.map((item, idx) => (
                <span key={"extra" + idx}>({item.value})</span>
              ))
            : ""}
          {data.bonus && <span className={cls.red}> {t("bonus")}</span>}
        </h4>
        <p className={cls.desc}>
          {data.addons
            ?.map(
              (item) =>
                item.stock?.product?.translation?.title +
                " x " +
                item.quantity * (item?.stock?.product?.interval ?? 1),
            )
            .join(", ")}
        </p>
        <div className={cls.actions}>
          <div className={cls.counter}>
            <button
              type="button"
              className={`${cls.counterBtn} ${
                isReduceDisabled ? cls.disabled : ""
              }`}
              disabled={isReduceDisabled}
              onClick={reduceProduct}
            >
              <SubtractFillIcon />
            </button>
            {unit?.position === "before" && (
              <div className={cls.unit}>{unit?.translation?.title}</div>
            )}
            <div className={cls.count}>{quantity * interval}</div>
            {unit?.position === "after" && (
              <div className={cls.unit}>{unit?.translation?.title}</div>
            )}
            <button
              type="button"
              className={`${cls.counterBtn} ${
                isAddDisabled ? cls.disabled : ""
              }`}
              disabled={isAddDisabled}
              onClick={addProduct}
            >
              <AddFillIcon />
            </button>
          </div>
          <div className={cls.price}>
            {!!data.discount && (
              <span className={cls.oldPrice}>
                <Price number={oldPrice} old />
              </span>
            )}
            <Price number={totalPrice} />
          </div>
        </div>
      </div>
      <div className={cls.imageWrapper}>
        <FallbackImage
          fill
          src={getImage(data.stock.product?.img)}
          alt={data.stock.product?.translation?.title}
          sizes="320px"
          quality={90}
        />
      </div>
      <div className={cls.textarea}>
        <TextInput
          name={`notes.${data.stock.id}`}
          label={t("note")}
          placeholder={t("type.here")}
          value={note}
          onChange={(e) => {
            formik.handleChange(e);
            setNote(e.target.value);
          }}
        />
      </div>

      {(isLoading || isCartLoading || isDeleteLoading) && <Loading />}
    </div>
  );
}
