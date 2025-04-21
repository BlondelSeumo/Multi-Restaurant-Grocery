import React from "react";
import { Product } from "interfaces";
import cls from "./productList.module.scss";
import { Grid, useMediaQuery } from "@mui/material";
import ProductCardContainer from "containers/productCardContainer/productCardContainer";
import ViewAll from "components/viewAll/viewAll";

type Props = {
  title?: string;
  products: Product[];
  uuid?: string;
  isViewAll?: boolean;
};

export default function ProductList({
  title,
  products,
  uuid = "popular",
  isViewAll = true,
}: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");

  return (
    <section
      className="container"
      id={uuid}
      data-name={uuid}
      style={{
        display: products.length === 0 ? "none" : "block",
      }}
    >
      <div className={cls.container}>
        <div className={cls.header}>
          <h2 className={cls.title}>{title}</h2>
          {isViewAll && (
            <ViewAll
              link={`/products?category_id=${products[0]?.category_id}&title=${title}&shop_id=${products[0]?.shop_id}`}
            />
          )}
        </div>
        <Grid container spacing={isDesktop ? 3 : 1}>
          {products.map((item) => (
            <Grid key={item.id} item xs={6} sm={3} md={3} lg={3} xl={2}>
              <ProductCardContainer data={item} />
            </Grid>
          ))}
        </Grid>
      </div>
    </section>
  );
}
