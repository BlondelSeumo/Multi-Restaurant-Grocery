import React from "react";
import { useAuth } from "contexts/auth/auth.context";
import { useShop } from "contexts/shop/shop.context";
import MemberCart from "./memberCart";
import ProtectedCart from "./protectedCart";
import Cart from "./cart";

export default function CartContainer() {
  const { isMember } = useShop();
  const { isAuthenticated } = useAuth();

  if (isMember) {
    return <MemberCart />;
  } else if (isAuthenticated) {
    return <ProtectedCart />;
  } else {
    return <Cart />;
  }
}
