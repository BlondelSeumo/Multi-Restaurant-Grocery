import React, { useCallback, useEffect, useRef } from "react";
import SEO from "components/seo";
import useLocale from "hooks/useLocale";
import { useAppSelector } from "hooks/useRedux";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mui/material";
import { useInfiniteQuery, useQuery } from "react-query";
import { selectCurrency } from "redux/slices/currency";
import shopService from "services/shop";
import { getCookie, removeCookie } from "utils/session";
import { Member, ShopProvider } from "contexts/shop/shop.provider";
import { useBranch } from "contexts/branch/branch.context";
import dynamic from "next/dynamic";
import productService from "services/product";
import ProductListContainer from "containers/productList/productListContainer";
import { selectProductFilter } from "redux/slices/productFilter";
import categoryService from "services/category";
import scrollToView from "utils/scrollToView";

const ProductSingleContainer = dynamic(
  () => import("containers/productSingle/productSingleContainer")
);
const JoinGroupContainer = dynamic(
  () => import("containers/joinGroupContainer/joinGroupContainer")
);
const ShopNavbar = dynamic(() => import("containers/shopNavbar/shopNavbar"));
const MobileShopNavbar = dynamic(
  () => import("containers/mobileShopNavbar/mobileShopNavbar")
);
const FeaturedShopsContainer = dynamic(
  () => import("containers/featuredShopsContainer/featuredShopsContainer")
);
const FooterMenu = dynamic(() => import("containers/footerMenu/footerMenu"));
const Empty = dynamic(() => import("components/empty/empty"));
const Loader = dynamic(() => import("components/loader/loader"));

type Props = {
  memberState: Member;
};

export default function GroupOrderPage({ memberState }: Props) {
  const { t, locale } = useLocale();
  const loader = useRef(null);
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const isLargeDesktop = useMediaQuery("(min-width:1536px)");
  const { query, replace } = useRouter();
  const { updateBranch } = useBranch();
  const branchId = Number(query.id);
  const currency = useAppSelector(selectCurrency);
  const { order_by } = useAppSelector(selectProductFilter);

  useQuery(["branch", branchId, locale], () => shopService.getById(branchId), {
    onSuccess: (data) => {
      updateBranch(data.data);
    },
  });

  const {
    data: categories,
    fetchNextPage: fetchCategoryNextPage,
    hasNextPage: hasCategoryNextPage,
    isLoading: isCategoryLoading,
    isFetchingNextPage: isCategoryFetchingNextPage,
  } = useInfiniteQuery(
    ["categories", locale, branchId],
    ({ pageParam = 1 }) =>
      categoryService.getAllProductCategories({
        page: pageParam,
        sort: "asc",
        column: "id",
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
  const categoryList = categories?.pages.flatMap((item) => item.data) || [];

  const { data: recommended, isLoading: isLoadingRecommended } = useQuery(
    ["recommended", currency?.id, locale, branchId, isLargeDesktop],
    () =>
      productService.getAllShopRecommendedProducts({
        currency_id: currency?.id,
        shop_id: branchId,
        recPerPage: isLargeDesktop ? 6 : 5,
      })
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      ["products", currency?.id, locale, branchId, isLargeDesktop, order_by],
      ({ pageParam = 1 }) =>
        productService.getAllShopProducts({
          page: pageParam,
          perPage: 4,
          currency_id: currency?.id,
          shop_id: branchId,
          productPerPage: isLargeDesktop ? 6 : 4,
          order_by,
        }),
      {
        onSettled: () => {
          if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            replace(
              { pathname: `/group/order/${query.id}`, query: { ...query } },
              undefined,
              {
                scroll: false,
                shallow: true,
              }
            ).finally(() => scrollToView(hash));
          }
        },
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

  const fetchRestCategories = () => {
    if (hasCategoryNextPage) {
      fetchCategoryNextPage();
    }
  };

  return (
    <>
      <SEO title={t("group.order")} />
      <ShopProvider memberState={memberState}>
        <FeaturedShopsContainer
          title={t("recommended")}
          featuredProducts={recommended?.data || []}
          loading={isLoadingRecommended}
        />
        {isDesktop ? (
          <ShopNavbar
            categories={categoryList}
            loading={isCategoryLoading}
            fetchRestCategories={fetchRestCategories}
            isFetchingRest={isCategoryFetchingNextPage}
          />
        ) : (
          <MobileShopNavbar
            categories={categoryList}
            loading={isCategoryLoading}
            fetchRestCategories={fetchRestCategories}
            isFetchingRest={isCategoryFetchingNextPage}
          />
        )}
        <div style={{ minHeight: "60vh" }}>
          <ProductListContainer data={products} loading={isLoading} />
          {isFetchingNextPage && <Loader />}
          <div id="the-end" ref={loader} />
          {!products?.length && !isLoading && <Empty text={t("no.products")} />}
        </div>
        <FooterMenu />

        {query.g ? <JoinGroupContainer /> : ""}
        <ProductSingleContainer />
      </ShopProvider>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const groupId = Number(ctx.query.g);
  let memberState = getCookie("member", ctx);

  if (memberState && groupId) {
    if (memberState.cart_id !== groupId) {
      removeCookie("member");
      memberState = null;
    }
  }

  return {
    props: {
      memberState,
    },
  };
};
