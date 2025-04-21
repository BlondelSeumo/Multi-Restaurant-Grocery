import { createSlice } from "@reduxjs/toolkit";
import { CartProduct } from "interfaces";
import { RootState } from "redux/store";
import compareArrays from "utils/compareArrays";

type CartType = {
  cartItems: CartProduct[];
};

const initialState: CartType = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { payload } = action;
      const existingIndex = state.cartItems.findIndex(
        (item) => item.stock.id === payload.stock?.id,
      );
      if (existingIndex >= 0) {
        const existingIndexWithAddon = state.cartItems.findIndex((item) =>
          compareArrays(
            item.addons.map((addon) => addon.stock.id),
            payload.addons.map((addon: CartProduct) => addon.stock.id),
          ),
        );
        if (existingIndexWithAddon >= 0 && action.payload.addons.length > 0) {
          state.cartItems[existingIndexWithAddon].quantity += payload.quantity;
        } else {
          state.cartItems[existingIndex].quantity += payload.quantity;
        }
      } else {
        state.cartItems.push(payload);
      }
    },
    setToCart(state, action) {
      const { payload } = action;
      const existingIndex = state.cartItems.findIndex(
        (item) => item.stock.id === payload.stock?.id,
      );
      if (existingIndex >= 0) {
        const existingIndexWithAddon = state.cartItems.findIndex((item) =>
          compareArrays(
            item.addons.map((addon) => addon.stock.id),
            payload.addons.map((addon: CartProduct) => addon.stock.id),
          ),
        );
        if (existingIndexWithAddon >= 0 && action.payload.addons.length > 0) {
          state.cartItems[existingIndexWithAddon].quantity +=
            action.payload.quantity;
        } else {
          state.cartItems.push(payload);
        }
      } else {
        state.cartItems.push(payload);
      }
    },
    reduceCartItem(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (item) => item.stock.id === action.payload.stock?.id,
      );
      if (itemIndex >= 0) {
        const existingIndexWithAddon = state.cartItems.findIndex((item) =>
          compareArrays(
            item.addons.map((addon) => addon.stock.id),
            action.payload.addons.map((addon: CartProduct) => addon.stock.id),
          ),
        );
        if (existingIndexWithAddon >= 0 && action.payload.addons.length > 0) {
          if (state.cartItems[existingIndexWithAddon].quantity > 1) {
            state.cartItems[existingIndexWithAddon].quantity -= 1;
          }
        } else if (state.cartItems[itemIndex].quantity > 1) {
          state.cartItems[itemIndex].quantity -= 1;
        }
      }
    },
    removeFromCart(state, action) {
      // const existingIndexWithAddon = state.cartItems.findIndex((item) =>
      //   compareArrays(
      //     item.addons.map((addon) => addon.stock.id),
      //     action.payload.addons.map((addon: CartProduct) => addon.stock.id),
      //   ),
      // );
      state.cartItems = state.cartItems.filter((cartItem) => {
        if (cartItem.stock.id === action.payload.stock?.id) {
          return cartItem.addons && action.payload.addons
            ? !compareArrays(
                cartItem.addons.map((addon) => addon.stock.id),
                action.payload.addons.map(
                  (addon: CartProduct) => addon.stock.id,
                ),
              )
            : false;
        }
        return true;
      });
    },
    updateCartQuantity(state, action) {
      const { payload } = action;
      state.cartItems.forEach((cartItem, index) => {
        const existingIndex = payload.find(
          (item: { stock_id: number }) => item.stock_id === cartItem.stock.id,
        );

        if (!!existingIndex) {
          state.cartItems[index].quantity = existingIndex.quantity;
        }
      });
    },
    clearCart(state) {
      state.cartItems = [];
    },
    updateCart(state, action) {
      state.cartItems = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  reduceCartItem,
  setToCart,
  updateCartQuantity,
  updateCart,
} = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart.cartItems;
export const selectTotalPrice = (state: RootState) =>
  state.cart.cartItems.reduce((total, item) => {
    const addonsTotalPrice = item.addons.length
      ? item.addons.reduce(
          (total, addon) =>
            (total +=
              (addon?.quantity ?? 0) * Number(addon?.stock?.total_price ?? 0)),
          0,
        )
      : 0;

    return (total +=
      item.quantity * Number(item.stock.total_price) + addonsTotalPrice);
  }, 0);
export default cartSlice.reducer;
