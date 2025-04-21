import React from "react";
import { Product } from "interfaces";
import cls from "./featuredShopsContainer.module.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Skeleton, useMediaQuery } from "@mui/material";
import ProductCardContainer from "containers/productCardContainer/productCardContainer";
import ViewAll from "components/viewAll/viewAll";

const settings = {
  spaceBetween: 10,
  preloadImages: false,
  className: "featured-shops full-width",
  breakpoints: {
    1140: {
      slidesPerView: 5,
      spaceBetween: 30,
    },
  },
};

type Props = {
  title?: string;
  featuredProducts: Product[];
  loading?: boolean;
};

export default function FeaturedShopsContainer({
  title,
  featuredProducts,
  loading = false,
}: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");

  return (
    <div className="white-splash">
      <section
        id="recommended"
        className="container"
        style={{
          display: !loading && featuredProducts.length === 0 ? "none" : "block",
        }}
      >
        <div className={cls.container}>
          <div className={cls.header}>
            <h2 className={cls.title}>{title}</h2>
            <ViewAll link="/recommended" />
          </div>
          {!loading ? (
            isDesktop ? (
              <div className={cls.row}>
                {featuredProducts.map((item) => (
                  <div className={cls.rowItem} key={item.id}>
                    <ProductCardContainer data={item} shadow />
                  </div>
                ))}
              </div>
            ) : (
              <Swiper {...settings} slidesPerView="auto">
                {featuredProducts.map((item) => (
                  <SwiperSlide key={item.id}>
                    <ProductCardContainer data={item} shadow />
                  </SwiperSlide>
                ))}
              </Swiper>
            )
          ) : (
            <div className={cls.shimmerContainer}>
              {Array.from(new Array(5)).map((item, idx) => (
                <Skeleton
                  key={"recomended" + idx}
                  variant="rectangular"
                  className={cls.shimmer}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
