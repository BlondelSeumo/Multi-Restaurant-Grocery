//@ts-nocheck
import React, { useEffect } from "react";
import SEO from "components/seo";
import CheckoutContainer from "containers/checkout/checkout";
import CheckoutDelivery from "containers/checkoutDelivery/checkoutDelivery";
import CheckoutProducts from "containers/checkoutProducts/checkoutProducts";
import { dehydrate, QueryClient, useQuery } from "react-query";
import cartService from "services/cart";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { updateUserCart } from "redux/slices/userCart";
import { selectCurrency } from "redux/slices/currency";
import { GetServerSideProps } from "next";
import getLanguage from "utils/getLanguage";
import shopService from "services/shop";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useBranch } from "contexts/branch/branch.context";
import { useAuth } from "../../contexts/auth/auth.context";

type Props = {};

export default function Checkout({}: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { query } = useRouter();
  const branchId = Number(query.id);
  const dispatch = useAppDispatch();
  const currency = useAppSelector(selectCurrency);
  const { updateBranch } = useBranch();
  const { refetchUser } = useAuth();

  const { data } = useQuery(["branch", branchId, locale], () =>
    shopService.getById(branchId),
  );
  useEffect(() => {
    updateBranch(data?.data);
    refetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data?.id]);

  const { isLoading } = useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  );

  return (
    <>
      <SEO />
      <CheckoutContainer data={data?.data}>
        <CheckoutDelivery />
        <CheckoutProducts loading={isLoading} />
      </CheckoutContainer>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const queryClient = new QueryClient();
  const branchId = Number(query.id);
  const locale = getLanguage(req.cookies?.locale);

  await queryClient.prefetchQuery(["branch", branchId, locale], () =>
    shopService.getById(branchId),
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
