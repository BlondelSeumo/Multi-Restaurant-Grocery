import React from "react";
import cls from "./featuredShopsContainer.module.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Skeleton, useMediaQuery } from "@mui/material";
import FeaturedRecipeCard from "components/shopHeroCard/recipeCard";
import { RecipeCategory } from "interfaces";
import ViewAll from "components/viewAll/viewAll";

const settings = {
  spaceBetween: 10,
  preloadImages: false,
  className: "featured-shops full-width",
  breakpoints: {
    1140: {
      slidesPerView: 6,
      spaceBetween: 30,
    },
  },
};

type Props = {
  title?: string;
  list: RecipeCategory[];
  loading?: boolean;
};

export default function RecipesList({ title, list, loading = false }: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");

  return (
    <div className="white-splash">
      <section
        className="container"
        style={{
          display: !loading && list.length === 0 ? "none" : "block",
        }}
      >
        <div className={cls.container}>
          <div className={cls.header}>
            <h2 className={cls.title}>{title}</h2>
            <ViewAll link="/recipes" />
          </div>
          {!loading ? (
            isDesktop ? (
              <div className={cls.row}>
                {list.map((item) => (
                  <div className={cls.row6Item} key={item.id}>
                    <FeaturedRecipeCard data={item} />
                  </div>
                ))}
              </div>
            ) : (
              <Swiper {...settings} slidesPerView="auto">
                {list.map((item) => (
                  <SwiperSlide key={item.id}>
                    <FeaturedRecipeCard data={item} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )
          ) : (
            <div className={cls.shimmerContainer}>
              {Array.from(new Array(6)).map((item, idx) => (
                <Skeleton
                  key={"recipe" + idx}
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
