import React, { useCallback, useEffect, useRef } from "react";
import SEO from "components/seo";
import dynamic from "next/dynamic";
import useLocale from "hooks/useLocale";
import { useRouter } from "next/router";
import productService from "services/product";
import { useInfiniteQuery } from "react-query";
import CategoryHeader from "components/bannerHeader/categoryHeader";
import ProductGrid from "containers/productList/productGrid";
import { selectCurrency } from "redux/slices/currency";
import { useAppSelector } from "hooks/useRedux";
import { useBranch } from "contexts/branch/branch.context";

const Empty = dynamic(() => import("components/empty/empty"));
const Loader = dynamic(() => import("components/loader/loader"));
const FooterMenu = dynamic(() => import("containers/footerMenu/footerMenu"));

const PER_PAGE = 12;

type Props = {};

export default function Recommended({}: Props) {
  const { t, locale } = useLocale();
  const { query } = useRouter();
  const { branch } = useBranch();
  const loader = useRef(null);
  const currency = useAppSelector(selectCurrency);
  const title = t("recommended");
  const category_id = Number(query.category_id) || undefined;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      ["recommended", locale, branch, category_id, currency?.id],
      ({ pageParam = 1 }) =>
        productService.getRecomended({
          page: pageParam,
          perPage: PER_PAGE,
          category_id,
          shop_id: branch?.id,
          currency_id: currency?.id,
        }),
      {
        getNextPageParam: (lastPage: any) => {
          if (lastPage.meta.current_page < lastPage.meta.last_page) {
            return lastPage.meta.current_page + 1;
          }
          return undefined;
        },
      }
    );
  const products = data?.pages.flatMap((item) => item.data) || [];

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
  }, [handleObserver]);

  return (
    <>
      <SEO title={title} />
      <div style={{ minHeight: "60vh" }}>
        <CategoryHeader title={title} />
        <ProductGrid data={products} loading={isLoading} />
        {isFetchingNextPage && <Loader />}
        <div ref={loader} />

        {!products?.length && !isLoading && <Empty text={t("no.products")} />}
      </div>
      <FooterMenu />
    </>
  );
}
