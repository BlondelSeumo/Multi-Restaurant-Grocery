import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import kitchenService from 'services/kitchen';
import sellerKitchenService from 'services/seller/kitchen';

const initialState = {
  loading: false,
  kitchens: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
  seller: {
    loading: false,
    kitchens: [],
    error: '',
    params: {
      page: 1,
      perPage: 10,
    },
    meta: {},
  },
};

export const fetchKitchens = createAsyncThunk(
  'kitchen/fetchKitchens',
  (params = {}) => kitchenService.getAll(params).then((res) => res),
);

export const fetchSellerKitchens = createAsyncThunk(
  'kitchen/fetchSellerKitchens',
  (params = {}) => sellerKitchenService.getAll(params).then((res) => res),
);

const kitchenSlice = createSlice({
  name: 'kitchen',
  initialState,
  extraReducers: (builder) => {
    // admin
    builder.addCase(fetchKitchens.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchKitchens.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.kitchens = payload?.data || [];
      state.meta = payload?.meta || {};
      state.params.page = payload?.meta?.current_page || 1;
      state.params.page = payload?.meta?.per_page || 10;
      state.error = '';
    });
    builder.addCase(fetchKitchens.rejected, (state, action) => {
      state.loading = false;
      state.error = action?.error?.message;
      state.kitchens = [];
    });
    // seller
    builder.addCase(fetchSellerKitchens.pending, (state) => {
      state.seller.loading = true;
    });
    builder.addCase(fetchSellerKitchens.fulfilled, (state, action) => {
      const { payload } = action;
      state.seller.loading = false;
      state.seller.kitchens = payload?.data || [];
      state.seller.meta = payload?.meta || {};
      state.seller.params.page = payload?.meta?.current_page || 1;
      state.seller.params.page = payload?.meta?.per_page || 10;
      state.seller.error = '';
    });
    builder.addCase(fetchSellerKitchens.rejected, (state, action) => {
      state.seller.loading = false;
      state.seller.error = action?.error?.message;
      state.seller.kitchens = [];
    });
  },
});

export default kitchenSlice.reducer;
