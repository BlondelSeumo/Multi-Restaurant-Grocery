import React, { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { dehydrate, QueryClient, useInfiniteQuery } from "react-query";
import bannerService from "services/banner";
import SEO from "components/seo";
import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import BannerHeader from "components/bannerHeader/bannerHeader";
import getImage from "utils/getImage";
import getLanguage from "utils/getLanguage";
import Loader from "components/loader/loader";
import ProductList from "containers/productList/productList";
import useLocale from "hooks/useLocale";
import { useBranch } from "contexts/branch/branch.context";

const FooterMenu = dynamic(() => import("containers/footerMenu/footerMenu"));
const PER_PAGE = 12;

type Props = {};

export default function BannerSinglePage({}: Props) {
  const { locale } = useLocale();
  const { query } = useRouter();
  const { branch } = useBranch();
  const bannerId = String(query.id);
  const loader = useRef(null);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ["banner", bannerId, locale, branch?.id],
      ({ pageParam = 1 }) =>
        bannerService.getById(bannerId, {
          page: pageParam,
          perPage: PER_PAGE,
          shop_id: branch?.id,
        }),
      {
        getNextPageParam: (lastPage: any, allPages) => {
          if (
            lastPage.data.products_count > lastPage.data.products.length &&
            lastPage.data.products.length > 0
          ) {
            return allPages.length + 1;
          }
          return undefined;
        },
      },
    );
  const pages = data?.pages?.flatMap((item) => item.data);
  const banner = pages ? pages[0] : {};

  const handleObserver = useCallback(
    (entries: any) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage],
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

  if (error) {
    console.log("error => ", error);
  }

  return (
    <>
      <SEO
        title={banner.translation?.title}
        description={banner.translation?.description}
        image={getImage(banner.img)}
      />
      <div style={{ minHeight: "90vh" }}>
        <BannerHeader data={banner} />
        <ProductList
          isViewAll={false}
          products={data?.pages?.flatMap((item) => item.data.products) || []}
        />
        {isFetchingNextPage && <Loader />}
        <div ref={loader} />
      </div>
      <FooterMenu />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const queryClient = new QueryClient();
  const bannerId = String(query.id);
  const locale = getLanguage(req.cookies?.locale);

  await queryClient.prefetchInfiniteQuery(["banner", bannerId, locale], () =>
    bannerService.getById(bannerId, { perPage: PER_PAGE }),
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
