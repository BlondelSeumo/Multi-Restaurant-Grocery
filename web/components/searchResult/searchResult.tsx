import React, { useCallback, useEffect, useRef } from "react";
import cls from "./searchResult.module.scss";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Product } from "interfaces";
import ProductResultItem from "components/searchResultItem/productResultItem";
import Loader from "components/loader/loader";

interface Props {
  products: Product[];
  isLoading: boolean;
  handleClickItem?: () => void;
  productTotal: number;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export default function SearchResult({
  products,
  isLoading,
  handleClickItem,
  productTotal,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) {
  const { t } = useTranslation();
  const loader = useRef(null);

  const handleObserver = useCallback(
    (entries: any) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, [handleObserver, hasNextPage, fetchNextPage]);

  return (
    <div>
      {!isLoading ? (
        <div className={cls.wrapper}>
          <div className={cls.block}>
            <div className={cls.header}>
              <h3 className={cls.title}>{t("products")}</h3>
              <p className={cls.text}>
                {t("found.number.results", { count: productTotal })}
              </p>
            </div>
            <div className={cls.body}>
              {products.map((item) => (
                <ProductResultItem
                  key={item.id}
                  data={item}
                  onClickItem={handleClickItem}
                />
              ))}
            </div>
          </div>
          <div ref={loader} />
          {isFetchingNextPage && <Loader />}
        </div>
      ) : (
        <div className={cls.wrapper}>
          <div className={cls.container}>
            {Array.from(new Array(2)).map((item, idx) => (
              <Skeleton
                key={"result" + idx}
                variant="rectangular"
                className={cls.shimmer}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
