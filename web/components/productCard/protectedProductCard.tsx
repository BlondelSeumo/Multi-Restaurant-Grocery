import React, { useMemo, useState } from "react";
import { CartStockWithProducts, Product, Stock } from "interfaces";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { selectUserCart, updateUserCart } from "redux/slices/userCart";
import useDebounce from "hooks/useDebounce";
import useDidUpdate from "hooks/useDidUpdate";
import { selectCurrency } from "redux/slices/currency";
import { useMutation, useQuery } from "react-query";
import cartService from "services/cart";
import { error } from "components/alert/toast";
import ProductCardUI from "./productCardUI";
import useClearCart from "hooks/useClearCart";
import { useBranch } from "contexts/branch/branch.context";

type Props = {
  data: Product;
  shadow?: boolean;
};

export default function ProtectedProductCard({ data, shadow }: Props) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(0);
  const debouncedQuantity = useDebounce(quantity, 400);
  const cart = useAppSelector(selectUserCart);
  const currency = useAppSelector(selectCurrency);
  const dispatch = useAppDispatch();
  const { branch } = useBranch();
  const { clearCart } = useClearCart();

  const { refetch, isLoading: isCartLoading } = useQuery(
    ["cart", currency?.id],
    () => cartService.get({ currency_id: currency?.id }),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      enabled: false,
    },
  );

  const { mutate: storeProduct, isLoading } = useMutation({
    mutationFn: (data: any) => cartService.insert(data),
    onSuccess: (data) => {
      dispatch(updateUserCart(data.data));
    },
    onError: (err) => {
      console.log("err => ", err);
      error(t("try.again"));
      clearCart();
    },
  });

  const { mutate: deleteProducts, isLoading: isDeleteLoading } = useMutation({
    mutationFn: (data: any) => cartService.deleteCartProducts(data),
    onSuccess: () => refetch(),
  });

  const { isInCart, cartData } = useMemo(() => {
    const stocks = data.stocks?.map((item) => item.id);
    const foundedItems = cart.user_carts[0].cartDetails.filter(
      (item) => stocks?.includes(item.stock.id),
    );
    let foundedItem;
    if (foundedItems.length) {
      const lastOfStock = foundedItems[foundedItems.length - 1];
      if (!lastOfStock.bonus) {
        foundedItem = lastOfStock;
        setQuantity(foundedItem.quantity);
      }
    }
    return {
      isInCart: !!foundedItem,
      cartData: foundedItem,
    };
  }, [cart, data]);

  function addProduct(event?: any) {
    if (!checkIsAbleToAddProduct()) {
      return;
    }
    if (Number(data.stocks?.length) === 1) {
      event.preventDefault();
      event.stopPropagation();
      setQuantity(1);
    }
  }

  function incrementProduct(event: any) {
    event.stopPropagation();
    event.preventDefault();
    if (quantity !== data.max_qty) {
      setQuantity((count) => count + 1);
    }
  }

  function decrementProduct(event: any) {
    event.stopPropagation();
    event.preventDefault();
    if (quantity === data.min_qty) {
      setQuantity(0);
    } else {
      setQuantity((count) => count - 1);
    }
  }

  useDidUpdate(() => {
    if (debouncedQuantity) {
      if (data.stocks?.length) {
        storeProductToCart(cartData ? cartData.stock : data.stocks[0]);
      }
    } else {
      deleteFromCart(cartData);
    }
  }, [debouncedQuantity]);

  function storeProductToCart(stock?: Stock) {
    const body = {
      shop_id: branch?.id,
      currency_id: currency?.id,
      rate: currency?.rate,
      products: [
        {
          stock_id: stock?.id,
          quantity,
        },
      ],
    };
    storeProduct(body);
  }

  function deleteFromCart(stock?: CartStockWithProducts) {
    const addons = stock?.addons?.map((item) => item.stock.id) || [];
    deleteProducts({ ids: [stock?.id, ...addons] });
  }

  function checkIsAbleToAddProduct() {
    let isActiveCart: boolean = false;
    isActiveCart = cart.shop_id === 0 || cart.shop_id === data?.shop_id;
    return isActiveCart;
  }

  return (
    <ProductCardUI
      data={data}
      quantity={quantity}
      isInCart={isInCart}
      loading={isLoading || isCartLoading || isDeleteLoading}
      addProduct={addProduct}
      incrementProduct={incrementProduct}
      decrementProduct={decrementProduct}
      shadow={shadow}
    />
  );
}
