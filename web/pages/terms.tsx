import React from "react";
import SEO from "components/seo";
import Content from "containers/content/content";
import { useQuery } from "react-query";
import faqService from "services/faq";
import { useTranslation } from "react-i18next";

export default function Terms() {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const { data, error, isLoading } = useQuery(["terms", locale], () =>
    faqService.getTerms(),
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
