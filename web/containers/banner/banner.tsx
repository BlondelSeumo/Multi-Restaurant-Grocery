import React from "react";
import cls from "./banner.module.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Banner, Story } from "interfaces";
import StoryComponent from "components/storySingle/storySingle";
import BannerSingle from "components/bannerSingle/bannerSingle";
import {
  NextButton,
  PrevButton,
} from "components/carouselArrows/carouselArrows";
import { Skeleton, useMediaQuery } from "@mui/material";

const bannerSettings = {
  spaceBetween: 10,
  preloadImages: false,
  className: "banner-swiper full-width",
  breakpoints: {
    1140: {
      slidesPerView: 2.5,
      spaceBetween: 30,
    },
  },
};

const storySettings = {
  spaceBetween: 10,
  centeredSlides: false,
  preloadImages: false,
  className: "story-swiper full-width",
  breakpoints: {
    1140: {
      slidesPerView: 10,
      spaceBetween: 0,
    },
    1920: {
      slidesPerView: 12,
      spaceBetween: 0,
    },
  },
};

type BannerProps = {
  stories?: Story[][];
  banners: Banner[];
  loadingStory?: boolean;
  loadingBanner: boolean;
};

export default function BannerContainer({
  stories,
  banners,
  loadingStory,
  loadingBanner,
}: BannerProps) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const isMobile = useMediaQuery("(max-width:576px)");

  return (
    <div className={cls.container}>
      <div className="container">
        <div className={cls.banner}>
          <div className={cls.storyContainer}>
            {!loadingStory ? (
              <Swiper {...storySettings} slidesPerView="auto">
                {stories?.map((item, idx) => (
                  <SwiperSlide key={idx}>
                    <StoryComponent data={item} list={stories} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className={cls.shimmerContainer}>
                {Array.from(new Array(isMobile ? 3 : isDesktop ? 10 : 6)).map(
                  (_, idx) => (
                    <Skeleton
                      key={"story" + idx}
                      variant="rectangular"
                      className={cls.shimmer}
                    />
                  ),
                )}
              </div>
            )}
          </div>
          <div className={cls.bannerContainer}>
            {!loadingBanner ? (
              <Swiper {...bannerSettings} slidesPerView="auto">
                {banners.map((item) => (
                  <SwiperSlide key={item.id}>
                    <BannerSingle data={item} />
                  </SwiperSlide>
                ))}
                {banners.length > 5 && (
                  <>
                    <PrevButton />
                    <NextButton />
                  </>
                )}
              </Swiper>
            ) : (
              <div className={cls.shimmerContainer}>
                {Array.from(new Array(isMobile ? 1 : 3)).map((_, idx) => (
                  <Skeleton
                    key={"banner" + idx}
                    variant="rectangular"
                    className={cls.shimmer}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
