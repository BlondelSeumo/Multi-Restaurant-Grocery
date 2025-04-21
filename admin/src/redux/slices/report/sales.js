import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SellerReportService from 'services/seller/reports';
import moment from 'moment';

const initialState = {
  salesHistory: {
    loading: false,
    data: [],
    meta: {},
    params: {
      page: 1,
      perPage: 10,
      type: 'history', // today, history, deliveryman
    },
  },
  salesCards: {
    loading: false,
    data: {},
  },
  salesMainCards: {
    loading: false,
    params: {
      type: 'month', // day, week, month
      date_from: moment().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD'),
    },
    data: {},
  },
  salesChart: {
    loading: false,
    data: [],
    params: {
      type: 'month', // day, week, month
      date_from: moment().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD'),
    },
  },
  salesStatistics: {
    loading: false,
    data: {},
    params: {
      type: 'month', // day, week, month
      date_from: moment().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD'),
    },
  },
};

export const fetchSellerSalesHistory = createAsyncThunk(
  'sales/fetchSellerSalesHistory',
  (params = {}) =>
    SellerReportService.getStatisticsSalesHistory({
      ...initialState.salesHistory.params,
      ...params,
    }).then((res) => res),
);

export const fetchSellerSalesCards = createAsyncThunk(
  'sales/fetchSellerSalesCards',
  () => SellerReportService.getStatisticsSalesCards().then((res) => res),
);

export const fetchSellerSalesMainCards = createAsyncThunk(
  'sales/fetchSellerSalesMainCards',
  (params = {}) =>
    SellerReportService.getStatisticsSalesMainCards({
      ...initialState.salesMainCards.params,
      ...params,
    }).then((res) => res),
);

export const fetchSellerSalesChart = createAsyncThunk(
  'sales/fetchSellerSalesChart',
  (params = {}) =>
    SellerReportService.getStatisticsSalesChart({
      ...initialState.salesChart.params,
      ...params,
    }).then((res) => res),
);

export const fetchSellerSalesStatistic = createAsyncThunk(
  'sales/fetchSellerSalesStatistic',
  (params = {}) =>
    SellerReportService.getStatisticsSalesStatistic({
      ...initialState.salesStatistics.params,
      ...params,
    }).then((res) => res),
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  extraReducers: (builder) => {
    // Sales History
    builder.addCase(fetchSellerSalesHistory.pending, (state) => {
      state.salesHistory.loading = true;
    });
    builder.addCase(fetchSellerSalesHistory.fulfilled, (state, action) => {
      const { payload } = action;
      state.salesHistory.loading = false;
      state.salesHistory.data = payload.data;
      state.salesHistory.meta = {
        total: Number(payload?.total),
        per_page: Number(payload?.per_page),
        current_page: Number(payload?.current_page),
        last_page: Number(payload?.last_page),
      };
      state.salesHistory.params.page = Number(payload?.current_page);
      state.salesHistory.params.perPage = Number(payload?.per_page);
    });
    builder.addCase(fetchSellerSalesHistory.rejected, (state) => {
      state.salesHistory = initialState.salesHistory;
    });
    // Sales Cards
    builder.addCase(fetchSellerSalesCards.pending, (state) => {
      state.salesCards.loading = true;
    });
    builder.addCase(fetchSellerSalesCards.fulfilled, (state, action) => {
      const { payload } = action;
      state.salesCards.loading = false;
      state.salesCards.data = payload;
    });
    builder.addCase(fetchSellerSalesCards.rejected, (state) => {
      state.salesCards = initialState.salesCards;
    });
    // Sales Main Cards
    builder.addCase(fetchSellerSalesMainCards.pending, (state) => {
      state.salesMainCards.loading = true;
    });
    builder.addCase(fetchSellerSalesMainCards.fulfilled, (state, action) => {
      const { payload } = action;
      state.salesMainCards.loading = false;
      state.salesMainCards.data = payload;
    });
    builder.addCase(fetchSellerSalesMainCards.rejected, (state) => {
      state.salesMainCards = initialState.salesMainCards;
    });
    // Sales Chart
    builder.addCase(fetchSellerSalesChart.pending, (state) => {
      state.salesChart.loading = true;
    });
    builder.addCase(fetchSellerSalesChart.fulfilled, (state, action) => {
      const { payload } = action;
      state.salesChart.loading = false;
      state.salesChart.data = payload;
    });
    builder.addCase(fetchSellerSalesChart.rejected, (state) => {
      state.salesChart = initialState.salesChart;
    });
    // Sales Statistics
    builder.addCase(fetchSellerSalesStatistic.pending, (state) => {
      state.salesStatistics.loading = true;
    });
    builder.addCase(fetchSellerSalesStatistic.fulfilled, (state, action) => {
      const { payload } = action;
      state.salesStatistics.loading = false;
      state.salesStatistics.data = payload;
    });
    builder.addCase(fetchSellerSalesStatistic.rejected, (state) => {
      state.salesStatistics = initialState.salesStatistics;
    });
  },
  reducers: {
    setSalesParams: (state, action) => {
      const { type, params } = action.payload;
      switch (type) {
        case 'history':
          state.salesHistory.params = {
            ...state.salesHistory.params,
            ...params,
          };
          break;
        case 'mainCards':
          state.salesMainCards.params = {
            ...state.salesMainCards.params,
            ...params,
          };
          break;
        case 'chart':
          state.salesChart.params = {
            ...state.salesChart.params,
            ...params,
          };
          break;
        case 'statistics':
          state.salesStatistics.params = {
            ...state.salesStatistics.params,
            ...params,
          };
          break;
        default:
          break;
      }
    },
  },
});

export const { setSalesParams } = salesSlice.actions;

export default salesSlice.reducer;
