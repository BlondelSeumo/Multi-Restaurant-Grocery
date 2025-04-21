import React from "react";
import { useAuth } from "contexts/auth/auth.context";
import { Product } from "interfaces";
import { useShop } from "contexts/shop/shop.context";
import ProductCard from "components/productCard/productCard";
import ProtectedProductCard from "components/productCard/protectedProductCard";
import MemberProductCard from "components/productCard/memberProductCard";

type Props = {
  data: Product;
  shadow?: boolean;
};

export default function ProductCardContainer({ data, shadow }: Props) {
  const { isAuthenticated } = useAuth();
  const { isMember } = useShop();

  if (isMember) {
    return <MemberProductCard data={data} shadow={shadow} />;
  } else if (isAuthenticated) {
    return <ProductCard data={data} shadow={shadow} />;
  } else {
    return <ProductCard data={data} shadow={shadow} />;
  }
}
