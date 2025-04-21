import SEO from "components/seo";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { useMediaQuery } from "@mui/material";
import shopService from "services/shop";
import categoryService from "services/category";
import { useAppSelector } from "hooks/useRedux";
import bannerService from "services/banner";
import productService from "services/product";
import { selectCurrency } from "redux/slices/currency";
import useUserLocation from "hooks/useUserLocation";
import ProductListContainer from "containers/productList/productListContainer";
import useLocale from "hooks/useLocale";
import storyService from "services/story";
import RecipesList from "containers/featuredShopsContainer/recipesList";
import { useBranch } from "contexts/branch/branch.context";
import { useRouter } from "next/router";
import { selectProductFilter } from "redux/slices/productFilter";
import scrollToView from "utils/scrollToView";
import HomeChatButton from "components/homeChatButton/homeChatButton";

const ShopNavbar = dynamic(() => import("containers/shopNavbar/shopNavbar"));
const MobileShopNavbar = dynamic(
  () => import("containers/mobileShopNavbar/mobileShopNavbar"),
);
const BannerContainer = dynamic(() => import("containers/banner/banner"));
const FeaturedShopsContainer = dynamic(
  () => import("containers/featuredShopsContainer/featuredShopsContainer"),
);
const FooterMenu = dynamic(() => import("containers/footerMenu/footerMenu"));
const Empty = dynamic(() => import("components/empty/empty"));
const ZoneNotFound = dynamic(
  () => import("components/zoneNotFound/zoneNotFound"),
);
const NewsContainer = dynamic(
  () => import("containers/newsContainer/newsContainer"),
);
const Loader = dynamic(() => import("components/loader/loader"));

export default function Home() {
  const { t, locale } = useLocale();
  const loader = useRef(null);
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const isLargeDesktop = useMediaQuery("(min-width:1536px)");
  const isMobile = useMediaQuery("(max-width:640px)");
  const currency = useAppSelector(selectCurrency);
  const { order_by } = useAppSelector(selectProductFilter);
  const location = useUserLocation();
  const { branch } = useBranch();
  const { query, replace } = useRouter();
  const temporaryBranchId = Number(query.branch);

  const { data: stories, isLoading: isStoriesLoading } = useQuery(
    ["stories", locale],
    () => storyService.getAll(),
  );

  const { data: banners, isLoading: isBannerLoading } = useQuery(
    ["banners", locale, branch?.id],
    () => bannerService.getAll({ shop_id: branch?.id }),
  );

  const { data: recipesCategories, isLoading: isRecipeLoading } = useQuery(
    ["recipeCategories", locale, branch],
    () =>
      categoryService.getAllRecipeCategories({
        "receipt-count": 1,
        r_shop_id: branch?.id,
      }),
  );

  const { isSuccess: isInsideZone, isLoading: isZoneLoading } = useQuery(
    ["nearestBranch", locale, location],
    () => shopService.getNearestShop({ address: location }),
  );

  const {
    data: categories,
    fetchNextPage: fetchCategoryNextPage,
    hasNextPage: hasCategoryNextPage,
    isLoading: isCategoryLoading,
    isFetchingNextPage: isCategoryFetchingNextPage,
  } = useInfiniteQuery(
    ["categories", locale, branch],
    ({ pageParam = 1 }) =>
      categoryService.getAllProductCategories({
        page: pageParam,
        sort: "asc",
        column: "id",
        p_shop_id: branch?.id,
      }),
    {
      getNextPageParam: (lastPage: any) => {
        if (lastPage.meta.current_page < lastPage.meta.last_page) {
          return lastPage.meta.current_page + 1;
        }
        return undefined;
      },
    },
  );
  const categoryList = categories?.pages.flatMap((item) => item.data) || [];

  const { data: recommended, isLoading: isLoadingRecommended } = useQuery(
    ["recommended", currency?.id, locale, branch, isLargeDesktop],
    () =>
      productService.getAllShopRecommendedProducts({
        currency_id: currency?.id,
        shop_id: temporaryBranchId || branch?.id,
        recPerPage: isLargeDesktop ? 6 : 5,
      }),
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      ["products", currency?.id, locale, branch, isLargeDesktop, order_by],
      ({ pageParam = 1 }) =>
        productService.getAllShopProducts({
          page: pageParam,
          perPage: 4,
          currency_id: currency?.id,
          address: location,
          shop_id: temporaryBranchId || branch?.id,
          productPerPage: isLargeDesktop ? 6 : 4,
          order_by,
        }),
      {
        onSettled: () => {
          if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            replace({ pathname: "/" }, undefined, {
              scroll: false,
              shallow: true,
            }).finally(() => scrollToView(hash));
          }
        },
        getNextPageParam: (lastPage: any) => {
          if (lastPage.meta.current_page < lastPage.meta.last_page) {
            return lastPage.meta.current_page + 1;
          }
          return undefined;
        },
      },
    );
  const products = data?.pages.flatMap((item) => item.data) || [];

  const handleObserver = useCallback(
    (entries: any) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage],
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
      <SEO />
      <BannerContainer
        stories={stories || []}
        banners={banners?.data || []}
        loadingStory={isStoriesLoading}
        loadingBanner={isBannerLoading}
      />
      <RecipesList
        title={t("recipes")}
        list={recipesCategories?.data || []}
        loading={isRecipeLoading}
      />
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
        {!isInsideZone && !isZoneLoading && !products.length && (
          <ZoneNotFound />
        )}
        {!products.length && !isLoading && isInsideZone && (
          <Empty text={t("no.products")} />
        )}
      </div>
      <NewsContainer />
      <FooterMenu />
      {!isMobile && (
        <HomeChatButton
          userId={branch?.user_id}
          title={branch?.translation?.title}
        />
      )}
    </>
  );
}
