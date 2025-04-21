import React from "react";
import SEO from "components/seo";
import { GetServerSideProps } from "next";
import { QueryClient, dehydrate, useQuery } from "react-query";
import shopService from "services/shop";
import getLanguage from "utils/getLanguage";
import useLocale from "hooks/useLocale";
import ShopHeader from "containers/shopHeader/shopHeader";
import ShopGallery from "components/shopGallery/shopGallery";
import ShopPageContainer from "containers/shopPage/shopPageContainer";

type Props = {};

export default function About({}: Props) {
  const { t, locale } = useLocale();

  const { data } = useQuery(["shop", locale], () => shopService.get());

  const { data: shopGallery, isLoading } = useQuery(["shopGallery"], () =>
    shopService.getGalleries()
  );

  return (
    <>
      <SEO title={t("about")} />
      <ShopHeader data={data?.data} />
      <ShopGallery
        data={shopGallery?.data.galleries || []}
        loading={isLoading}
      />
      {!!data?.data && <ShopPageContainer data={data?.data} />}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient();
  const locale = getLanguage(ctx.req.cookies?.locale);

  await queryClient.prefetchQuery(["shop", locale], () => shopService.get());

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
