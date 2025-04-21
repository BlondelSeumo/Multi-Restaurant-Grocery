import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mui/material";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { clearProduct, selectProduct } from "redux/slices/product";

const ModalContainer = dynamic(() => import("containers/modal/modal"));
const ProductContainer = dynamic(
  () => import("containers/productContainer/productContainer"),
);
const MobileDrawer = dynamic(() => import("containers/drawer/mobileDrawer"));

type Props = {};

export default function ProductSingleContainer({}: Props) {
  const isDesktop = useMediaQuery("(min-width:1140px)");
  const { query, replace } = useRouter();
  const dispatch = useAppDispatch();
  const { product, isOpen } = useAppSelector(selectProduct);
  const isOpenProduct = Boolean(query.product) || isOpen;
  const uuid = String(query.product || "");

  const handleCloseProduct = () => {
    dispatch(clearProduct());
    if (uuid) {
      replace(
        {
          query: JSON.parse(
            JSON.stringify({ ...query, product: undefined, branch: undefined }),
          ),
        },
        undefined,
        {
          shallow: true,
        },
      );
    }
  };

  if (isDesktop) {
    return (
      <ModalContainer open={!!isOpenProduct} onClose={handleCloseProduct}>
        <ProductContainer
          handleClose={handleCloseProduct}
          data={product}
          uuid={uuid}
        />
      </ModalContainer>
    );
  } else {
    return (
      <MobileDrawer open={!!isOpenProduct} onClose={handleCloseProduct}>
        <ProductContainer
          handleClose={handleCloseProduct}
          data={product}
          uuid={uuid}
        />
      </MobileDrawer>
    );
  }
}
