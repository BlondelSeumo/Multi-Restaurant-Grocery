import React, { useMemo, useState } from "react";
import { CartStockWithProducts, Product, Stock } from "interfaces";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import { selectUserCart, updateUserCart } from "redux/slices/userCart";
import useDebounce from "hooks/useDebounce";
import useDidUpdate from "hooks/useDidUpdate";
import { selectCurrency } from "redux/slices/currency";
import { useMutation, useQuery } from "react-query";
import cartService from "services/cart";
import ProductCardUI from "./productCardUI";
import { useBranch } from "contexts/branch/branch.context";
import { useShop } from "contexts/shop/shop.context";

type Props = {
  data: Product;
  shadow?: boolean;
};

export default function MemberProductCard({ data, shadow }: Props) {
  const [quantity, setQuantity] = useState(0);
  const debouncedQuantity = useDebounce(quantity, 400);
  const cart = useAppSelector(selectUserCart);
  const currency = useAppSelector(selectCurrency);
  const dispatch = useAppDispatch();
  const { branch } = useBranch();
  const { member } = useShop();

  const { refetch, isLoading: isCartLoading } = useQuery(
    ["cart", member, currency?.id],
    () =>
      cartService.guestGet(cart.id, {
        shop_id: member?.shop_id,
        user_cart_uuid: member?.uuid,
        currency_id: currency?.id,
      }),
    {
      onSuccess: (data) => dispatch(updateUserCart(data.data)),
      enabled: false,
    },
  );

  const { mutate: storeProduct, isLoading } = useMutation({
    mutationFn: (data: any) => cartService.guestStore(data),
    onSuccess: (data) => {
      dispatch(updateUserCart(data.data));
    },
  });

  const { mutate: deleteProducts, isLoading: isDeleteLoading } = useMutation({
    mutationFn: (data: any) => cartService.deleteGuestProducts(data),
    onSuccess: () => refetch(),
  });

  const { isInCart, cartData } = useMemo(() => {
    const cartDetails = cart.user_carts.find((el) => el.uuid === member?.uuid)
      ?.cartDetails;
    const foundedItems =
      cartDetails?.filter((item) => data.id === item.stock.product.id) || [];
    let foundedItem;
    if (foundedItems.length) {
      foundedItem = foundedItems[foundedItems.length - 1];
      setQuantity(foundedItem.quantity);
    }
    return {
      isInCart: !!foundedItems.length,
      cartData: foundedItem,
    };
  }, [cart, data, member]);

  function addProduct(event?: any) {
    if (!checkIsAbleToAddProduct()) {
      return;
    }
    if (!!data.stocks_count && data.stocks_count <= 1) {
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
      storeProductToCart(cartData ? cartData.stock : data.stock);
    } else {
      deleteFromCart(cartData);
    }
  }, [debouncedQuantity]);

  function storeProductToCart(stock?: Stock) {
    const body = {
      shop_id: branch?.id,
      stock_id: stock?.id,
      quantity,
      cart_id: cart.id,
      user_cart_uuid: member?.uuid,
    };
    if (!stock?.bonus) {
      storeProduct(body);
    }
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
