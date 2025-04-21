import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bannerService from '../../services/banner';

const initialState = {
  loading: false,
  banners: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
  filters: {
    status: 'published',
  },
  statuses: ['published', 'deleted_at'],
};

export const fetchBanners = createAsyncThunk(
  'banner/fetchBanners',
  (params = {}) => {
    return bannerService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  },
);

const bannerSlice = createSlice({
  name: 'banner',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchBanners.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchBanners.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.banners = payload?.data;
      state.meta = payload?.meta;
      state.params.page =
        Number(payload?.meta?.current_page) || initialState.params.page;
      state.params.perPage =
        Number(payload?.meta?.per_page) || initialState.params.perPage;
      state.error = '';
    });
    builder.addCase(fetchBanners.rejected, (state, action) => {
      state = initialState;
    });
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    setParams: (state, action) => {
      state.params = {
        ...state.params,
        ...action.payload,
      };
    },
  },
});

export const { setFilters, setParams } = bannerSlice.actions;

export default bannerSlice.reducer;
