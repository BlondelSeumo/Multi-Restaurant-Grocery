import React from "react";
import SEO from "components/seo";
import BlogContent from "containers/blogContent/blogContent";
import { useRouter } from "next/router";
import { dehydrate, QueryClient, useQuery } from "react-query";
import blogService from "services/blog";
import { GetStaticPaths, GetStaticProps } from "next";
import getImage from "utils/getImage";
import { useTranslation } from "react-i18next";
import { getCookie } from "utils/session";
import getLanguage from "utils/getLanguage";
import { checkIsTrue } from "utils/checkIsTrue";
import NotFound from "containers/notFound/notFound";
import { useSettings } from "contexts/settings/settings.context";

type Props = {};

export default function BlogSingle({}: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { query } = useRouter();
  const blogId = String(query.id);
  const { settings } = useSettings();

  const { data, error } = useQuery(
    ["blog", blogId, locale],
    () => blogService.getById(blogId),
    { staleTime: 0 },
  );

  if (!checkIsTrue(settings?.blog_active)) {
    return <NotFound />;
  }

  if (error) {
    console.log("error => ", error);
  }

  return (
    <>
      <SEO
        title={data?.data?.translation?.title}
        description={data?.data?.translation?.short_desc}
        image={getImage(data?.data?.img)}
      />
      <BlogContent data={data?.data} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const queryClient = new QueryClient();
  const { params } = ctx;
  const locale = getLanguage(getCookie("locale", ctx));

  await queryClient.prefetchQuery(["blog", params?.id, locale], () =>
    blogService.getById(String(params?.id)),
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
