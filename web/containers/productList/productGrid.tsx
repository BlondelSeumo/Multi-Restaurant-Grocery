import React from "react";
import cls from "./productList.module.scss";
import { Product } from "interfaces";
import { Grid, Skeleton, useMediaQuery } from "@mui/material";
import ProductCardContainer from "containers/productCardContainer/productCardContainer";

type Props = {
  data?: Product[];
  loading?: boolean;
};

export default function ProductGrid({ data, loading = false }: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");

  return (
    <section className="container">
      <div className={cls.container}>
        <Grid container spacing={isDesktop ? 3 : 1}>
          {!loading
            ? data?.map((item) => (
                <Grid key={item.id} item xs={6} sm={3} md={3} lg={3} xl={2}>
                  <ProductCardContainer data={item} />
                </Grid>
              ))
            : Array.from(new Array(4)).map((item, idx) => (
                <Grid key={"shimmer" + idx} item xs={6} sm={3} lg={3} xl={2}>
                  <Skeleton variant="rectangular" className={cls.shimmer} />
                </Grid>
              ))}
        </Grid>
      </div>
    </section>
  );
}
