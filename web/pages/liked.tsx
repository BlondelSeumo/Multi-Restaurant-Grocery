import React from "react";
import SEO from "components/seo";
import BannerContainer from "containers/banner/banner";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { useAppSelector } from "hooks/useRedux";
import { selectLikedProducts } from "redux/slices/favoriteProducts";
import { useQuery } from "react-query";
import bannerService from "services/banner";
import storyService from "services/story";

const FooterMenu = dynamic(() => import("containers/footerMenu/footerMenu"));
const ProductList = dynamic(
  () => import("containers/productList/productList"),
  {
    ssr: false,
  }
);
const Empty = dynamic(() => import("components/empty/empty"));

type Props = {};

export default function Liked({}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const favoriteProducts = useAppSelector(selectLikedProducts);

  const { data: stories, isLoading: isStoriesLoading } = useQuery(
    ["stories", locale],
    () => storyService.getAll()
  );

  const { data: banners, isLoading: isBannerLoading } = useQuery(
    ["banners", locale],
    () => bannerService.getAll()
  );

  return (
    <>
      <SEO />
      <div style={{ minHeight: "90vh" }}>
        <BannerContainer
          stories={stories || []}
          banners={banners?.data || []}
          loadingStory={isStoriesLoading}
          loadingBanner={isBannerLoading}
        />
        <ProductList
          title={t("liked.products")}
          products={favoriteProducts}
          isViewAll={false}
        />
        {favoriteProducts.length < 1 && (
          <Empty text={t("no.liked.products")} buttonText={t("go.to.menu")} />
        )}
      </div>
      <FooterMenu />
    </>
  );
}
