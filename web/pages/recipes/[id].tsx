import React from "react";
import SEO from "components/seo";
import RecipeContainer from "containers/recipeContainer/recipeContainer";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import getLanguage from "utils/getLanguage";
import recipeService from "services/recipe";
import { useRouter } from "next/router";
import RecipeHero from "components/recipeHero/recipeHero";
import RecipeContent from "components/recipeContent/recipeContent";
import dynamic from "next/dynamic";
import useLocale from "hooks/useLocale";

const FooterMenu = dynamic(() => import("containers/footerMenu/footerMenu"));

type Props = {};

export default function RecipeSingle({}: Props) {
  const { locale } = useLocale();
  const { query } = useRouter();
  const recipeId = Number(query.id);

  const { data } = useQuery(["recipe", recipeId, locale], () =>
    recipeService.getById(recipeId)
  );

  return (
    <>
      <SEO
        title={
          data?.data.shop?.translation.title +
          " - " +
          data?.data.translation?.title
        }
        description={data?.data.translation?.description}
      />
      <RecipeContainer data={data?.data}>
        <RecipeHero />
        <RecipeContent />
      </RecipeContainer>
      <FooterMenu />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const queryClient = new QueryClient();
  const recipeId = Number(query.id);
  const locale = getLanguage(req.cookies?.locale);

  await queryClient.prefetchQuery(["recipe", recipeId, locale], () =>
    recipeService.getById(recipeId)
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};
