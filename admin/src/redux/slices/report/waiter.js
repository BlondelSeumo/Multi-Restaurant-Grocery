import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import ReportService from 'services/reports';
import SellerReportService from 'services/seller/reports';

const initialState = {
  loading: false,
  orders: {},
  error: '',
};

export const fetchReportWaiter = createAsyncThunk(
  'report/fetchReportWaiter',
  (params) => ReportService.getReportWaiter(params).then((res) => res.data),
);

export const fetchSellerReportWaiter = createAsyncThunk(
  'report/fetchSellerReportWaiter',
  (params) =>
    SellerReportService.getReportWaiter(params).then((res) => res.data),
);

const reportWaiterSlice = createSlice({
  name: 'reportWaiter',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchReportWaiter.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchReportWaiter.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
      state.error = '';
    });
    builder.addCase(fetchReportWaiter.rejected, (state, action) => {
      state.loading = false;
      state.orders = [];
      state.error = action.error.message;
    });
    builder.addCase(fetchSellerReportWaiter.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSellerReportWaiter.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
      state.error = '';
    });
    builder.addCase(fetchSellerReportWaiter.rejected, (state, action) => {
      state.loading = false;
      state.orders = {};
      state.error = action.error.message;
    });
  },
});

export default reportWaiterSlice.reducer;
