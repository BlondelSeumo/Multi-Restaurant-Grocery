import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import SellerReportService from 'services/seller/reports';
import moment from 'moment/moment';

const initialState = {
  reportOrdersPaginate: {
    loading: false,
    data: [],
    meta: {},
    params: {
      page: 1,
      perPage: 10,
      date_from: moment().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD'),
    },
  },
  reportOrder: {
    loading: false,
    data: {},
    params: {
      date_from: moment().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD'),
      type: 'day', // day, week, month, year
    },
  },
  reportOrdersChart: {
    loading: false,
    data: {},
    params: {
      date_from: moment().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD'),
      type: 'day', // day, week, month, year
    },
  },
  reportOrderTransactions: {
    loading: false,
    data: {},
    params: {
      date_from: moment().subtract(1, 'month').format('YYYY-MM-DD'),
      date_to: moment().format('YYYY-MM-DD'),
      type: 'seller', // seller, deliveryman
    },
    meta: {},
  },
};

export const fetchReportOrdersPaginate = createAsyncThunk(
  'report/fetchReportOrdersPaginate',
  (params = {}) =>
    SellerReportService.getStatisticsOrdersReportPaginate({
      ...initialState.reportOrdersPaginate.params,
      ...params,
    }).then((res) => res),
);

export const fetchReportOrder = createAsyncThunk(
  'report/fetchReportOrder',
  (params = {}) =>
    SellerReportService.getStatisticsOrderReport({
      ...initialState.reportOrder.params,
      ...params,
    }).then((res) => res),
);

export const fetchReportOrdersChart = createAsyncThunk(
  'report/fetchReportOrdersChart',
  (params = {}) =>
    SellerReportService.getStatisticsOrdersReportChart({
      ...initialState.reportOrdersChart.params,
      ...params,
    }).then((res) => res),
);

export const fetchReportOrderTransactions = createAsyncThunk(
  'report/fetchReportOrderTransactions',
  (params = {}) =>
    SellerReportService.getStatisticsOrdersReportTransactions({
      ...initialState.reportOrderTransactions.params,
      ...params,
    }).then((res) => res),
);

const reportOrdersSlice = createSlice({
  name: 'reportOrders',
  initialState,
  extraReducers: (builder) => {
    // Report Orders Paginate
    builder.addCase(fetchReportOrdersPaginate.pending, (state) => {
      state.reportOrdersPaginate.loading = true;
    });
    builder.addCase(fetchReportOrdersPaginate.fulfilled, (state, action) => {
      const { payload } = action;
      state.reportOrdersPaginate.loading = false;
      state.reportOrdersPaginate.data = payload?.data?.data;
      state.reportOrdersPaginate.meta = {
        total: Number(payload?.data?.total),
        per_page: Number(payload?.data?.per_page),
        current_page: Number(payload?.data?.current_page),
        last_page: Number(payload?.data?.last_page),
      };
      state.reportOrdersPaginate.params.page = Number(
        payload?.data?.current_page,
      );
      state.reportOrdersPaginate.params.perPage = Number(
        payload?.data?.per_page,
      );
    });
    builder.addCase(fetchReportOrdersPaginate.rejected, (state) => {
      state.reportOrdersPaginate = initialState.reportOrdersPaginate;
    });
    // Report Order
    builder.addCase(fetchReportOrder.pending, (state) => {
      state.reportOrder.loading = true;
    });
    builder.addCase(fetchReportOrder.fulfilled, (state, action) => {
      const { payload } = action;
      state.reportOrder.loading = false;
      state.reportOrder.data = payload?.data;
    });
    builder.addCase(fetchReportOrder.rejected, (state) => {
      state.reportOrder = initialState.reportOrder;
    });
    // Report Orders Chart
    builder.addCase(fetchReportOrdersChart.pending, (state) => {
      state.reportOrdersChart.loading = true;
    });
    builder.addCase(fetchReportOrdersChart.fulfilled, (state, action) => {
      const { payload } = action;
      state.reportOrdersChart.loading = false;
      state.reportOrdersChart.data = payload?.data;
    });
    builder.addCase(fetchReportOrdersChart.rejected, (state) => {
      state.reportOrdersChart = initialState.reportOrdersChart;
    });
    // Report Order Transactions
    builder.addCase(fetchReportOrderTransactions.pending, (state) => {
      state.reportOrderTransactions.loading = true;
    });
    builder.addCase(fetchReportOrderTransactions.fulfilled, (state, action) => {
      const { payload } = action;
      state.reportOrderTransactions.loading = false;
      state.reportOrderTransactions.data = payload?.data;
      state.reportOrderTransactions.meta = {
        total: Number(payload?.data?.meta?.total),
        per_page: Number(payload?.data?.meta?.perPage),
        current_page: Number(payload?.data?.meta?.page),
      };
    });
    builder.addCase(fetchReportOrderTransactions.rejected, (state) => {
      state.reportOrderTransactions = initialState.reportOrderTransactions;
    });
  },
  reducers: {
    setReportOrdersParams: (state, action) => {
      const { type, params } = action.payload;
      switch (type) {
        case 'paginate':
          state.reportOrdersPaginate.params = {
            ...state.reportOrdersPaginate.params,
            ...params,
          };
          break;
        case 'order':
          state.reportOrder.params = {
            ...state.reportOrder.params,
            ...params,
          };
          break;
        case 'chart':
          state.reportOrdersChart.params = {
            ...state.reportOrdersChart.params,
            ...params,
          };
          break;
        case 'transactions':
          state.reportOrderTransactions.params = {
            ...state.reportOrderTransactions.params,
            ...params,
          };
          break;
        default:
          break;
      }
    },
  },
});

export const { setReportOrdersParams } = reportOrdersSlice.actions;

export default reportOrdersSlice.reducer;
