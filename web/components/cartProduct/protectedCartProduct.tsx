import React, { useState } from "react";
import { CartStockWithProducts, InsertProductBody } from "interfaces";
import { useAppDispatch, useAppSelector } from "hooks/useRedux";
import useDebounce from "hooks/useDebounce";
import useDidUpdate from "hooks/useDidUpdate";
import { useMutation, useQuery } from "react-query";
import cartService from "services/cart";
import { selectCurrency } from "redux/slices/currency";
import { clearUserCart, updateUserCart } from "redux/slices/userCart";
import CartProductUI from "./cartProductUI";
import { useBranch } from "contexts/branch/branch.context";
import { removeFromCart, updateCartQuantity } from "redux/slices/cart";

type Props = {
  data: CartStockWithProducts;
  cartId: number;
  disabled?: boolean;
};

export default function ProtectedCartProduct({
  data,
  cartId,
  disabled,
}: Props) {
  const [quantity, setQuantity] = useState(data.quantity);
  const debouncedQuantity = useDebounce(quantity, 400);
  const currency = useAppSelector(selectCurrency);
  const dispatch = useAppDispatch();
  const { branch } = useBranch();

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
    onSuccess: (data: any, variables: any) => {
      dispatch(updateUserCart(data.data));
      dispatch(updateCartQuantity(variables.products));
    },
    onError: () => {
      handleClearCart();
    },
  });

  const { mutate: deleteProducts, isLoading: isDeleteLoading } = useMutation({
    mutationFn: (data: any) => cartService.deleteCartProducts(data),
    onSuccess: () => refetch(),
  });

  const { isLoading: isLoadingClearCart, mutate: mutateClearCart } =
    useMutation({
      mutationFn: (data: any) => cartService.delete(data),
      onSuccess: () => {
        dispatch(clearUserCart());
      },
    });

  function addProduct() {
    if (quantity !== data.stock.product.max_qty) {
      setQuantity((count) => count + 1);
    }
  }

  function reduceProduct() {
    if (quantity === data.stock.product.min_qty) {
      setQuantity(0);
    } else {
      setQuantity((count) => count - 1);
    }
  }

  useDidUpdate(() => {
    if (debouncedQuantity) {
      storeProductToCart(data);
    } else {
      deleteFromCart(data);
    }
  }, [debouncedQuantity]);

  function storeProductToCart(product: CartStockWithProducts) {
    const body: InsertProductBody = {
      shop_id: branch?.id,
      currency_id: currency?.id,
      rate: currency?.rate,
      products: [
        {
          stock_id: product.stock.id,
          quantity,
        },
      ],
    };
    if (product.addons) {
      product.addons?.forEach((addon) => {
        body.products.push({
          stock_id: addon.stock.id,
          quantity: addon.quantity,
          parent_id: product.stock.id,
        });
      });
    }
    if (!product.bonus) {
      storeProduct(body);
    }
  }

  function deleteFromCart(product: CartStockWithProducts) {
    const addons = product.addons?.map((item) => item.stock.id) || [];
    deleteProducts({ ids: [product.id, ...addons] });
    dispatch(removeFromCart(createProduct(product)));
  }

  function handleClearCart() {
    const ids = [cartId];
    mutateClearCart({ ids });
  }

  function createProduct(data: CartStockWithProducts) {
    return {
      id: data?.id,
      img: data?.stock.product.img,
      translation: data?.stock.product.translation,
      quantity: quantity,
      stock: data.stock,
      shop_id: data?.stock.product.shop_id,
      extras: data.stock.extras?.map((el) => el.value) || [],
      addons: data.stock.addons || data.addons || [],
    };
  }

  return (
    <CartProductUI
      data={data}
      loading={
        isLoading || isCartLoading || isDeleteLoading || isLoadingClearCart
      }
      addProduct={addProduct}
      reduceProduct={reduceProduct}
      quantity={quantity}
      disabled={disabled}
      deleteProduct={() => deleteFromCart(data)}
    />
  );
}
