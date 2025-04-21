import { createSlice } from "@reduxjs/toolkit";
import { CartType } from "interfaces";
import { RootState } from "redux/store";

type UserCartType = {
  userCart: CartType;
  userCartLoading: boolean;
};

const initialState: UserCartType = {
  userCartLoading: true,
  userCart: {
    id: 0,
    shop_id: 0,
    total_price: 0,
    user_carts: [
      {
        id: 0,
        name: "",
        user_id: 1,
        uuid: "",
        cartDetails: [],
      },
    ],
  },
};

const userCartSlice = createSlice({
  name: "userCart",
  initialState,
  reducers: {
    updateUserCart(state, action) {
      const { payload } = action;
      state.userCart = payload;
      state.userCartLoading = false;
    },
    updateGroupStatus(state, action) {
      const { payload } = action;
      state.userCart.group = !state.userCart.group;
      state.userCart.id = payload.id;
      state.userCart.owner_id = payload.owner_id;
      state.userCartLoading = false;
    },
    clearUserCart(state) {
      state.userCart = initialState.userCart;
      state.userCartLoading = false;
    },
    setUserCartLoading(state, action) {
      const { payload } = action;
      state.userCartLoading = payload;
    },
  },
});

export const {
  updateUserCart,
  updateGroupStatus,
  clearUserCart,
  setUserCartLoading,
} = userCartSlice.actions;

export const selectUserCart = (state: RootState) => state.userCart.userCart;

export const selectUserCartCount = (state: RootState) => ({
  id: state.userCart.userCart.id,
  count: state.userCart.userCart.user_carts.reduce(
    (total, item) => (total += item.cartDetails.length),
    0,
  ),
  isGroup: state.userCart.userCart.group,
});

export const selectCartLoading = (state: RootState) =>
  state.userCart.userCartLoading;

export default userCartSlice.reducer;
