import React, { useMemo, useState } from "react";
import { Product } from "interfaces";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import {
  addToCart,
  removeFromCart,
  selectCart,
  updateCart,
  reduceCartItem,
} from "redux/slices/cart";
import ProductCardUI from "./productCardUI";
import { useMutation, useQuery } from "react-query";
import {
  clearUserCart,
  selectUserCart,
  setUserCartLoading,
  updateUserCart,
} from "redux/slices/userCart";
import cartService from "services/cart";
import { selectCurrency } from "redux/slices/currency";
import useDebounce from "hooks/useDebounce";
import useDidUpdate from "hooks/useDidUpdate";
import { useAuth } from "contexts/auth/auth.context";

type Props = {
  data: Product;
  shadow?: boolean;
};

export default function ProductCard({ data, shadow }: Props) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const currency = useAppSelector(selectCurrency);
  const userCart = useAppSelector(selectUserCart);
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const { isInCart, cartData } = useMemo(() => {
    const foundedItems = cart.filter(
      (item) => data?.stock?.id === item.stock?.id,
    );
    let foundedItem;
    if (foundedItems.length) {
      foundedItem = foundedItems.find((item) => item.addons.length === 0);
    }
    return {
      isInCart: !!foundedItem,
      cartData: foundedItem,
    };
  }, [cart, data]);

  const debounceQuantity = useDebounce(cartData?.quantity, 500);

  const { refetch } = useQuery(
    ["cart", currency?.id],
    () => {
      dispatch(setUserCartLoading(true));
      return cartService.get({ currency_id: currency?.id });
    },
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      enabled: false,
    },
  );

  const { mutate: insertProducts } = useMutation({
    mutationFn: (data: any) => {
      dispatch(setUserCartLoading(true));
      return cartService.insert(data);
    },
    onSuccess: (data: any) => {
      dispatch(updateUserCart(data.data));
    },
    onMutate: () => {
      return cart;
    },
    onError: (_, __, context) => {
      dispatch(clearUserCart());
      dispatch(updateCart(context));
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (data: any) => {
      return cartService.deleteCartProducts(data);
    },
    onSuccess: () => {
      return refetch();
    },
    onMutate: () => {
      const oldCart = cart;
      dispatch(removeFromCart(cartData));
      return oldCart;
    },
    onError: (_, __, context) => {
      dispatch(updateCart(context));
      dispatch(clearUserCart());
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  function addProduct(event?: any) {
    if (!checkIsAbleToAddProduct()) {
      return;
    }
    if (!!data.stocks_count && data.stocks_count <= 1) {
      event?.stopPropagation();
      event?.preventDefault();
      const product = {
        id: data?.id,
        img: data?.img,
        translation: data?.translation,
        quantity: 1,
        stock: data.stock,
        shop_id: data?.shop_id,
        extras: data.stock?.extras?.map((el) => el.value) || [],
        addons: data.stock?.addons || [],
      };
      dispatch(addToCart(product));
    }
  }

  // for adding product with addons into cart
  const addons = cartData?.addons?.length
    ? cartData?.addons?.map((addon) => {
        return {
          stock_id: addon.stock.id,
          quantity: addon.quantity,
          parent_id: cartData.stock.id,
        };
      })
    : [];

  function incrementProduct(event?: any) {
    if (!checkIsAbleToAddProduct()) {
      return;
    }
    event?.stopPropagation();
    event?.preventDefault();

    setLoading(true);

    if (!cartData) return;
    dispatch(addToCart({ ...cartData, quantity: 1 }));
  }
  function reduceProduct(event?: any) {
    event.stopPropagation();
    event.preventDefault();

    setLoading(true);
    if (!cartData) return;

    if (cartData?.quantity === 1) {
      userCart.user_carts[0].cartDetails.map((item) => {
        if (item.stock.id === cartData.stock.id) {
          deleteProduct({ ids: [item.id] });
        }
      });
      dispatch(removeFromCart(cartData));
    } else {
      dispatch(reduceCartItem(cartData));
    }
  }

  function checkIsAbleToAddProduct() {
    let isActiveCart: boolean;
    if (!!cart.length) {
      isActiveCart = cart.every((item) => item.shop_id === data?.shop_id);
    } else {
      isActiveCart = true;
    }
    return isActiveCart;
  }

  useDidUpdate(() => {
    if (debounceQuantity && loading && user?.id) {
      const payload = {
        shop_id: cartData?.shop_id,
        currency_id: currency?.id,
        rate: currency?.rate,
        products: [
          {
            stock_id: cartData?.stock.id,
            quantity: !!cartData?.quantity ? cartData?.quantity : 1,
          },
          ...addons,
        ],
      };
      insertProducts(payload);
    }
  }, [debounceQuantity]);

  return (
    <ProductCardUI
      data={data}
      quantity={cartData?.quantity || 0}
      isInCart={isInCart}
      addProduct={addProduct}
      incrementProduct={incrementProduct}
      decrementProduct={reduceProduct}
      shadow={shadow}
    />
  );
}
