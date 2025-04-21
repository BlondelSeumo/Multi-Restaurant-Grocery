import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "redux/store";

export type ProductFilterType = {
  category_id?: number;
  order_by?: string;
};

const initialState: ProductFilterType = {
  category_id: undefined,
  order_by: undefined,
};

const productFilterSlice = createSlice({
  name: "productFilter",
  initialState,
  reducers: {
    setProductCategory(state, action) {
      const { payload } = action;
      state.category_id = payload;
    },
    setProductSorting(state, action) {
      const { payload } = action;
      state.order_by = payload;
    },
    clearProductFilter(state) {
      state.category_id = undefined;
      state.order_by = undefined;
    },
  },
});

export const { setProductCategory, setProductSorting, clearProductFilter } =
  productFilterSlice.actions;

export const selectProductFilter = (state: RootState) => state.productFilter;

export default productFilterSlice.reducer;
