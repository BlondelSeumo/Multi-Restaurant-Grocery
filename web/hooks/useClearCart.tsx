import { useAuth } from "contexts/auth/auth.context";
import { selectCart, clearCart } from "redux/slices/cart";
import { selectUserCart, clearUserCart } from "redux/slices/userCart";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { useMutation } from "react-query";
import cartService from "services/cart";

export default function useClearCart() {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const protectedCart = useAppSelector(selectUserCart);
  const isProtectedCartEmpty = !protectedCart.user_carts.flatMap(
    (item) => item.cartDetails,
  )?.length;
  const isCartEmpty = !cart?.length;

  const { isLoading, mutate: mutateClearCart } = useMutation({
    mutationFn: (data: any) => cartService.delete(data),
    onSuccess: () => {
      dispatch(clearUserCart());
      dispatch(clearCart());
    },
  });

  const clearCartItems = () => {
    if (isAuthenticated) {
      clearProtectedCart();
      return;
    }
    dispatch(clearCart());
  };

  const clearProtectedCart = () => {
    const ids = [protectedCart.id];
    mutateClearCart({ ids });
  };

  return {
    isCartEmpty: isAuthenticated ? isProtectedCartEmpty : isCartEmpty,
    isLoadingClearCart: isLoading,
    clearCart: clearCartItems,
  };
}
