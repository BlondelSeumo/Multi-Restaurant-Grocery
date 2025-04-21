import React from "react";
import SEO from "components/seo";
import Content from "containers/content/content";
import { useQuery } from "react-query";
import faqService from "services/faq";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const { data, error, isLoading } = useQuery(
    ["privacy", locale],
    () => faqService.getPrivacy(),
    {
      staleTime: 0,
    },
  );

  if (error) {
    console.log("error => ", error);
  }

  return (
    <>
      <SEO title={data?.data?.translation?.title} />
      <Content data={data?.data?.translation} isLoading={isLoading} />
    </>
  );
}
