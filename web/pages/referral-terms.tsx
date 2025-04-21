import React from "react";
import SEO from "components/seo";
import Content from "containers/content/content";
import { useQuery } from "react-query";
import informationService from "services/information";
import { useTranslation } from "react-i18next";

export default function ReferralTerms() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const { data, error, isLoading } = useQuery(["referral-terms", locale], () =>
    informationService.getReferrals(),
  );

  if (error) {
    console.log("error => ", error);
  }

  return (
    <>
      <SEO title={t("referral.terms")} />
      <Content
        isLoading={isLoading}
        data={{
          title: t("referral.terms"),
          description: data?.data?.translation?.faq,
          locale: data?.data?.translation?.locale,
        }}
      />
    </>
  );
}
