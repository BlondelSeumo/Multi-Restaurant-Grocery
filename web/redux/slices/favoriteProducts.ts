import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "interfaces";
import { RootState } from "redux/store";

export type FavoriteProductsType = {
  favoriteProducts: Product[];
};

const initialState: FavoriteProductsType = {
  favoriteProducts: [],
};

const favoriteProductSlice = createSlice({
  name: "favoriteProducts",
  initialState,
  reducers: {
    addToLiked(store, action: PayloadAction<Product>) {
      store.favoriteProducts.push({ ...action.payload });
    },
    removeFromLiked(state, action: PayloadAction<Product>) {
      const { payload } = action;
      const filtered = state.favoriteProducts.filter(
        (item) => item.uuid !== payload.uuid
      );
      state.favoriteProducts = filtered;
    },
    clearLikedProducts(state) {
      state.favoriteProducts = [];
    },
  },
});

export const { addToLiked, removeFromLiked, clearLikedProducts } =
  favoriteProductSlice.actions;

export const selectLikedProducts = (state: RootState) =>
  state.liked.favoriteProducts;

export default favoriteProductSlice.reducer;
