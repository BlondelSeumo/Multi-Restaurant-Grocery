import React from "react";
import cls from "./productList.module.scss";
import { CategoryWithProducts } from "interfaces";
import { Grid, Skeleton, useMediaQuery } from "@mui/material";
import ProductList from "./productList";

type Props = {
  data?: CategoryWithProducts[];
  loading?: boolean;
};

export default function ProductListContainer({ data, loading = false }: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const isLargeDesktop = useMediaQuery("(min-width:1536px)");

  if (loading) {
    return (
      <section className="container">
        <div className={cls.container}>
          <Grid container spacing={isDesktop ? 3 : 1}>
            {Array.from(new Array(isLargeDesktop ? 6 : 4)).map((item, idx) => (
              <Grid key={"shimmer" + idx} item xs={6} sm={3} lg={3} xl={2}>
                <Skeleton variant="rectangular" className={cls.shimmer} />
              </Grid>
            ))}
          </Grid>
        </div>
      </section>
    );
  } else {
    return (
      <div id="products-wrapper">
        {data?.map((item) => (
          <ProductList
            key={item.uuid}
            uuid={item.uuid}
            title={item.translation?.title}
            products={item.products || []}
          />
        ))}
      </div>
    );
  }
}
