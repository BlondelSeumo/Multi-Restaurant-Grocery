import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import restaurantService from '../../services/restaurant';

const initialState = {
  loading: false,
  restaurants: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
};

export const fetchRestourant = createAsyncThunk(
  'shop/fetchRestourant',
  (params = {}) => {
    return restaurantService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  },
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchRestourant.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRestourant.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.restaurants = payload.data;
      state.meta = payload.meta;
      state.params.page = +payload.meta.current_page;
      state.params.perPage = +payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchRestourant.rejected, (state, action) => {
      state.loading = false;
      state.restaurants = [];
      state.error = action.error.message;
    });
  },
});

export default restaurantSlice.reducer;
