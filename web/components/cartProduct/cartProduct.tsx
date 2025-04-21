import React from "react";
import { CartProduct } from "interfaces";
import cls from "./cartProduct.module.scss";
import SubtractFillIcon from "remixicon-react/SubtractFillIcon";
import AddFillIcon from "remixicon-react/AddFillIcon";
import getImage from "utils/getImage";
import Price from "components/price/price";
import { useAppDispatch } from "hooks/useRedux";
import { addToCart, reduceCartItem, removeFromCart } from "redux/slices/cart";
import FallbackImage from "components/fallbackImage/fallbackImage";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import useLocale from "hooks/useLocale";

type Props = {
  data: CartProduct;
  totalPrice?: number;
};

export default function CartItem({ data, totalPrice }: Props) {
  const { t } = useLocale();
  const dispatch = useAppDispatch();

  function addProduct() {
    dispatch(addToCart({ ...data, quantity: 1 }));
  }

  function reduceProduct() {
    if (data.quantity === 1) {
      dispatch(removeFromCart(data));
    } else {
      dispatch(reduceCartItem(data));
    }
  }

  return (
    <div className={cls.wrapper}>
      <div className={cls.imageWrapper}>
        <FallbackImage
          fill
          src={getImage(data.img)}
          alt={data.translation?.title}
          sizes="320px"
          quality={90}
        />
      </div>
      <div className={cls.flex}>
        <div className={cls.block}>
          <div>
            <h6 className={cls.title}>
              {data.translation?.title}{" "}
              {data.extras.length > 0 ? `(${data.extras.join(", ")})` : ""}
            </h6>
            <p className={cls.description}>
              {data.addons
                ?.map(
                  (item) =>
                    item.translation?.title +
                    " x " +
                    item.quantity * (item?.interval ?? 1),
                )
                .join(", ")}
            </p>
            <p className={cls.description}>
              {data.translation?.description}
              <br />
            </p>
          </div>
          <button
            className={cls.btn}
            onClick={() => dispatch(removeFromCart(data))}
          >
            <DeleteBinLineIcon />
            <span className={cls.text}>{t("delete")}</span>
          </button>
        </div>
        <div className={cls.actions}>
          <div className={cls.price}>
            <Price number={totalPrice ?? data.stock.price * data.quantity} />
          </div>
          <div className={cls.counter}>
            <button
              type="button"
              className={cls.counterBtn}
              onClick={reduceProduct}
            >
              <SubtractFillIcon />
            </button>
            <div className={cls.count}>{data.quantity}</div>
            <button
              type="button"
              className={`${cls.counterBtn} ${
                data.stock.quantity > data.quantity ? "" : cls.disabled
              }`}
              disabled={!(data.stock.quantity > data.quantity)}
              onClick={addProduct}
            >
              <AddFillIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
