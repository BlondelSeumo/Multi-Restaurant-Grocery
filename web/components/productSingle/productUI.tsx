import React, { useMemo } from "react";
import cls from "./productSingle.module.scss";
import { Product, ProductExtra, Stock } from "interfaces";
import getImage from "utils/getImage";
import ExtrasForm from "components/extrasForm/extrasForm";
import SubtractFillIcon from "remixicon-react/SubtractFillIcon";
import AddFillIcon from "remixicon-react/AddFillIcon";
import PrimaryButton from "components/button/primaryButton";
import Price from "components/price/price";
import Loading from "components/loader/loading";
import { useTranslation } from "react-i18next";
import Badge from "components/badge/badge";
import BonusCaption from "components/bonusCaption/bonusCaption";
import ProductShare from "components/productShare/productShare";
import ProductGalleries from "components/productGalleries/productGalleries";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  addToLiked,
  removeFromLiked,
  selectLikedProducts,
} from "redux/slices/favoriteProducts";
import FavoriteBtn from "components/favoriteBtn/favoriteBtn";

type Props = {
  children: any;
  data: Partial<Product>;
  loading?: boolean;
  stock: Stock;
  extras: Array<ProductExtra[]>;
  counter: number;
  loadingBtn?: boolean;
  handleExtrasClick: (e: any) => void;
  addCounter: () => void;
  reduceCounter: () => void;
  handleAddToCart: () => void;
  totalPrice: number;
  extrasIds: ProductExtra[];
};

export default function ProductUI({
  children,
  data,
  loading,
  stock,
  extras,
  counter,
  loadingBtn,
  handleExtrasClick,
  addCounter,
  reduceCounter,
  handleAddToCart,
  totalPrice,
  extrasIds,
}: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const favoriteProducts = useAppSelector(selectLikedProducts);
  const interval = data?.interval ? data?.interval : 1;
  const unit = data?.unit && data?.unit?.active ? data?.unit : null;

  const isLiked = useMemo(
    () => !!favoriteProducts.find((el) => el.uuid === data?.uuid),
    [favoriteProducts, data],
  );

  function toggleLike() {
    if (data) {
      const product = {
        ...data,
        stock: data.stocks ? data.stocks[0] : undefined,
      };
      if (isLiked) {
        dispatch(removeFromLiked(product));
      } else {
        dispatch(addToLiked(product));
      }
    }
  }

  return (
    <div className={cls.wrapper}>
      {loading ? (
        <>
          <ProductShare data={data} />
          <FavoriteBtn checked={isLiked} onClick={toggleLike} />
          <h1 className={cls.title}>{data.translation?.title}</h1>
          <div className={cls.flex}>
            <aside className={cls.aside}>
              <ProductGalleries galleries={data?.galleries} />
            </aside>
            <main className={cls.main}>
              <div className={cls.header}>
                <h1 className={cls.title}>{data.translation?.title}</h1>
                <p className={cls.text}>{data.translation?.description}</p>
                {!!stock.bonus && (
                  <div className={cls.bonus}>
                    <Badge type="bonus" variant="circle" />
                    <span className={cls.text}>
                      <BonusCaption data={stock.bonus} />
                    </span>
                  </div>
                )}
                {!!stock.discount && (
                  <div className={cls.bonus}>
                    <Badge type="discount" variant="circle" />
                    <span className={cls.text}>
                      <span>{t("discount")}</span>{" "}
                      <Price number={stock.discount} minus />
                    </span>
                  </div>
                )}
              </div>
              {extras.map((item, idx) => (
                <ExtrasForm
                  key={"extra" + idx}
                  name={item[0].group.translation.title}
                  data={item}
                  stock={stock}
                  selectedExtra={extrasIds[idx]}
                  handleExtrasClick={handleExtrasClick}
                />
              ))}
              {children}
            </main>
          </div>
          <div className={cls.footer}>
            <div className={cls.actions}>
              <div className={cls.counter}>
                <button
                  type="button"
                  className={`${cls.counterBtn} ${
                    counter === 1 ? cls.disabled : ""
                  }`}
                  disabled={counter === data.min_qty}
                  onClick={reduceCounter}
                >
                  <SubtractFillIcon />
                </button>
                {unit?.position === "before" && (
                  <div className={cls.unit}>{unit?.translation?.title}</div>
                )}
                <div className={cls.count}>{counter * interval}</div>
                {unit?.position === "after" && (
                  <div className={cls.unit}>{unit?.translation?.title}</div>
                )}
                <button
                  type="button"
                  className={`${cls.counterBtn} ${
                    counter === stock.quantity ? cls.disabled : ""
                  }`}
                  disabled={
                    counter === stock.quantity || counter === data.max_qty
                  }
                  onClick={addCounter}
                >
                  <AddFillIcon />
                </button>
              </div>
              <div className={cls.btnWrapper}>
                <PrimaryButton
                  onClick={handleAddToCart}
                  loading={loadingBtn}
                  disabled={!stock.quantity}
                >
                  {!stock.quantity ? t("out.of.stock") : t("add")}
                </PrimaryButton>
              </div>
            </div>
            <div className={cls.priceBlock}>
              <p>{t("total")}</p>
              <h5 className={cls.price}>
                <Price number={totalPrice} />
              </h5>
            </div>
          </div>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}
