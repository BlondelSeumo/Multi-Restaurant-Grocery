import { clearCart, selectCart, updateCart } from "redux/slices/cart";
import { useAppSelector } from "./useRedux";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";
import {
  clearUserCart,
  selectUserCart,
  setUserCartLoading,
  updateUserCart,
} from "redux/slices/userCart";
import cartService from "services/cart";
import { info } from "components/alert/toast";
import { selectCurrency } from "redux/slices/currency";

export const useSyncCartWithServer = () => {
  const dispatch = useDispatch();
  const userCart = useAppSelector(selectUserCart);
  const cartItems = useAppSelector(selectCart);
  const currency = useAppSelector(selectCurrency);
  const { mutate: insertProducts } = useMutation({
    mutationFn: (data: any) => {
      dispatch(setUserCartLoading(true));
      return cartService.insert(data);
    },
    onSuccess: (data) => {
      dispatch(updateUserCart(data.data));
      const userCart = data.data.user_carts?.[0];
      const cartItems = userCart?.cartDetails.map((detail) => {
        const addons =
          detail.addons?.map((addon) => ({
            id: addon.id,
            img: addon?.stock?.product?.img,
            translation: addon?.stock?.product?.translation,
            quantity: addon.quantity,
            stock: addon.stock,
            shop_id: addon.stock?.product?.shop_id,
            extras: [],
          })) || [];

        return {
          id: detail.stock.product.id,
          stock: detail.stock,
          addons,
          translation: detail.stock?.product?.translation,
          quantity: detail.quantity,
          img: detail.stock?.product?.img,
          shop_id: data.data.shop_id,
          extras: detail.stock.extras?.map((extra) => extra.value) || [],
        };
      });

      dispatch(updateCart(cartItems));
    },
    onMutate: () => {
      const oldCart = cartItems;
      return oldCart;
    },
    onError: (error: { data?: any }, variables, context) => {
      if (error?.data?.statusCode === "ERROR_440") {
        cartService.delete({ ids: [userCart?.id] }).then(() => {
          info("try.again");
        });
        return;
      }
      dispatch(updateCart(context));
      dispatch(clearUserCart());
    },
  });
  const products = cartItems.map((item) => ({
    stock_id: item.stock.id,
    quantity: item.quantity,
    addons: item.addons?.map((addon) => ({
      stock_id: addon.stock.id,
      quantity: addon.quantity,
    })),
  }));
  const shopId = cartItems?.[0]?.shop_id;

  const handleSync = () => {
    if (cartItems.length === 0) return;
    const payload = {
      shop_id: shopId,
      currency_id: currency?.id,
      rate: currency?.rate,
      products,
      first_insert: true
    };
    insertProducts(payload);
  };

  return { handleSync };
};
