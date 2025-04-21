import React from "react";
import SEO from "components/seo";
import BranchesContainer from "containers/branches/branchesContainer";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import getLanguage from "utils/getLanguage";
import shopService from "services/shop";
import useLocale from "hooks/useLocale";
import { useAppSelector } from "hooks/useRedux";
import { selectShopFilter } from "redux/slices/shopFilter";
import qs from "qs";

type Props = {};

export default function Branches({}: Props) {
  const { t, locale } = useLocale();
  const { newest, group, order_by, search } = useAppSelector(selectShopFilter);

  const { data, isLoading, error } = useQuery(
    ["branches", locale, newest, group, order_by, search],
    () =>
      shopService.getAllShops(
        qs.stringify({
          page: 1,
          perPage: 100,
          order_by: newest ? "new" : order_by,
          free_delivery: group.free_delivery,
          take: group.tag,
          rating: group.rating?.split(","),
          prices: group.prices,
          // open: Number(group.open) || undefined,
          deals: group.deals,
          open: 1,
          search,
        }),
      ),
  );

  if (error) {
    console.log("error => ", error);
  }

  return (
    <>
      <SEO title={t("branches")} />
      <BranchesContainer data={data?.data} loading={isLoading} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const queryClient = new QueryClient();
  const locale = getLanguage(req.cookies?.locale);

  await queryClient.prefetchQuery(["branches", locale], () =>
    shopService.getAll({ page: 1, perPage: 100, open: 1 }),
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
