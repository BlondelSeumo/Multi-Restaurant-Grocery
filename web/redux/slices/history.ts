import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "redux/store";

export type HistoryType = {
  history?: string;
};

const initialState: HistoryType = {
  history: undefined,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setHistory(state, action) {
      const { payload } = action;
      state.history = payload;
    },
    clearHistory(state) {
      state.history = undefined;
    },
  },
});

export const { setHistory, clearHistory } = historySlice.actions;

export const selectHistory = (state: RootState) => state.history.history;

export default historySlice.reducer;
