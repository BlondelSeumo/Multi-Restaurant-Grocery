import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/product';
import restProductService from '../../services/rest/product';
import sellerProductService from '../../services/seller/product';

const initialState = {
  loading: false,
  products: [],
  error: '',
  params: {
    page: 1,
    perPage: 10,
  },
  meta: {},
  form: {
    // initially fetched stocks
    stocks: [],
    // filtered stocks
    filteredStocks: [],
    // holds filter values
    filters: {},
    // deleted ids in filter type
    deletedIds: [],
  },
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  (params = {}) => {
    return productService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  },
);

export const fetchRestProducts = createAsyncThunk(
  'product/fetchRestProducts',
  (params = {}) => {
    return restProductService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  },
);

export const fetchSellerProducts = createAsyncThunk(
  'product/fetchSellerProducts',
  (params = {}) => {
    return sellerProductService
      .getAll({ ...initialState.params, ...params })
      .then((res) => res);
  },
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.products = payload.data.map((item) => ({
        ...item,
        id: item.id,
        uuid: item.uuid,
        name: item.translation ? item.translation?.title : 'no name',
        active: item.active,
        img: item.img,
        category_name: item.category?.translation
          ? item.category.translation?.title
          : 'no name',
      }));
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.error = action.error.message;
    });

    //rest products
    builder.addCase(fetchRestProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRestProducts.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.products = payload.data.map((item) => ({
        ...item,
        id: item.id,
        uuid: item.uuid,
        name: item.product?.translation
          ? item.product?.translation?.title
          : 'no name',
        active: item.active,
        img: item?.img,
        category_name: item.product?.category?.translation
          ? item.product?.category.translation?.title
          : 'no name',
        unit: item?.unit,
      }));
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchRestProducts.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.error = action.error.message;
    });

    //seller product
    builder.addCase(fetchSellerProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSellerProducts.fulfilled, (state, action) => {
      const { payload } = action;
      state.loading = false;
      state.products = payload.data?.map((item) => ({
        ...item,
        id: item.id,
        uuid: item.uuid,
        name: item?.translation ? item?.translation?.title : 'no name',
        active: item.active,
        img: item?.img,
        category_name: item?.category?.translation
          ? item?.category?.translation?.title
          : 'no name',
      }));
      state.meta = payload.meta;
      state.params.page = payload.meta.current_page;
      state.params.perPage = payload.meta.per_page;
      state.error = '';
    });
    builder.addCase(fetchSellerProducts.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.error = action.error.message;
    });
  },
  reducers: {
    setFormStocks(state, action) {
      state.form.stocks = action.payload;
    },
    updateFormStocks(state, action) {
      state.form.stocks = state.form.stocks.map((stock) => {
        const updatedStock = action?.payload?.find(
          (item) => item?.fieldKey === stock?.fieldKey,
        );
        if (updatedStock) {
          return updatedStock;
        }
        return stock;
      });
    },
    resetFormStocks(state) {
      state.form.stocks = initialState.form.stocks;
    },
    setFilteredStocks(state, action) {
      state.form.filteredStocks = action.payload;
    },
    resetFilteredStocks(state) {
      state.form.filteredStocks = initialState.form.filteredStocks;
    },
    setFilters(state, action) {
      state.form.filters = { ...state.form.filters, ...action.payload };
    },
    deleteFilter(state, action) {
      delete state.form.filters[action.payload];
    },
    resetFilters(state) {
      state.form.filters = initialState.form.filters;
    },
    deleteStockFromStocks(state, action) {
      state.form.stocks = state.form?.stocks?.filter((stock) => {
        const isEqual = stock?.fieldKey !== action.payload?.fieldKey;
        if (!isEqual && stock?.stock_id) {
          state.form.deletedIds.push(stock?.stock_id);
        }
        return isEqual;
      });
    },
    resetDeletedIds(state) {
      state.form.deletedIds = initialState.form.deletedIds;
    },
  },
});

export const {
  setFormStocks,
  updateFormStocks,
  resetFormStocks,
  setFilteredStocks,
  resetFilteredStocks,
  setFilters,
  resetFilters,
  deleteFilter,
  deleteStockFromStocks,
  resetDeletedIds,
} = productSlice.actions;

export default productSlice.reducer;
