import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orderItems: [],
  orderProducts: [],
  orderData: null,
  paymentData: null,
  data: {
    user: '',
    userUuid: '',
    address: null,
    currency: '',
    payment_type: '',
    deliveries: '',
    shop: null,
    delivery_time: null,
    delivery_date: null,
    currency_shop: null,
    coupon: null,
    calculate: null,
  },
  calculateProductsBody: [],
  totalPrices: {},
  recalculate: false,
  total: {},
  coupon: {},
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrderItem(state, action) {
      const { payload } = action;
      const existingItemIndex = state.orderItems.findIndex(
        (orderItem) =>
          orderItem?.stock_id === payload?.stock_id &&
          orderItem?.addons?.length === payload?.addons?.length &&
          orderItem?.addons?.every((addon) =>
            payload?.addons?.find(
              (item) =>
                item?.id === addon?.id && item?.quantity === addon?.quantity,
            ),
          ),
      );
      if (existingItemIndex !== -1) {
        state.orderItems[existingItemIndex].quantity = payload?.quantity;
      } else {
        state.orderItems.push(payload);
      }
    },
    reduceOrderItem(state, action) {
      const { payload } = action;
      const itemIndex = state.orderItems.findIndex(
        (item) => item.stockID.id === payload.stockID.id,
      );
      if (state.orderItems[itemIndex].quantity > 1) {
        state.orderItems[itemIndex].quantity -= 1;
      } else if (state.orderItems[itemIndex].quantity === 1) {
        const nextOrderItems = state.orderItems.filter(
          (item) => item.id !== payload.id,
        );
        state.orderItems = nextOrderItems;
      }
    },
    removeFromOrder(state, action) {
      const { payload } = action;

      const nextOrderItems = state.orderItems.filter(
        (item) => item.id !== payload.id,
      );

      state.orderItems = nextOrderItems;
      state.orderProducts = nextOrderItems;
      return state;
    },
    clearOrder(state) {
      state.orderItems = [];
      state.orderProducts = [];
      state.data = initialState.data;
      state.coupons = [];
      state.total = initialState.total;
    },
    setOrderProducts(state, action) {
      const { payload } = action;
      state.orderProducts = payload;
    },
    setOrderItems(state, action) {
      const { payload } = action;
      state.orderItems = payload;
    },
    setOrderCurrency(state, action) {
      const { payload } = action;
      state.data.currency = payload;
    },
    setCurrentShop(state, action) {
      const { payload } = action;
      state.data.shop = payload;
    },
    setOrderData(state, action) {
      const { payload } = action;
      state.data = { ...state.data, ...payload };
    },
    setOrder(state, action) {
      const { payload } = action;
      state.orderData = payload;
    },
    setPayment(state, action) {
      const { payload } = action;
      state.paymentData = payload;
    },
    setOrderTotal(state, action) {
      const { payload } = action;
      state.total = payload;
    },
    setCashback(state, action) {
      const { payload } = action;
      state.total.cashback = payload;
    },
    addOrderCoupon(state, action) {
      const { payload } = action;
      state.coupon = payload;
    },
    verifyOrderCoupon(state, action) {
      const { payload } = action;
      state.coupon.verified = payload.verified;
      state.coupon.price = payload.price;
    },
    clearOrderProducts(state) {
      state.orderProducts = [];
      state.total = initialState.total;
    },
    clearOrderItems(state) {
      state.orderItems = [];
    },
    changeOrderedProductQuantity(state, action) {
      state.orderProducts = state.orderProducts.map((product) => {
        if (product.id === action.payload.id) {
          return { ...product, quantity: action.payload.quantity };
        }
        return product;
      });
      state.orderItems = state.orderItems.map((product) => {
        if (product.id === action.payload.id) {
          return { ...product, quantity: action.payload.quantity };
        }
        return product;
      });
    },

    setCalculateProductsBody(state, action) {
      state.calculateProductsBody = action.payload;
    },
    addCalculateProductsBody(state, action) {
      const { payload } = action;

      const existingIndex = state.calculateProductsBody.findIndex((item) => {
        return (
          item?.stock_id === payload?.stock_id &&
          item?.addons?.length === payload?.addons?.length &&
          payload?.addons?.every((addon) =>
            item?.addons?.find(
              (item) =>
                item?.stock_id === addon?.stock_id &&
                item?.quantity === addon?.quantity,
            ),
          )
        );
      });
      if (existingIndex !== -1) {
        state.calculateProductsBody[existingIndex].quantity = payload?.quantity;
      } else {
        state.calculateProductsBody.push(payload);
      }
    },
    removeProductFromCalculateProductsBody(state, action) {
      const { payload } = action;
      state.calculateProductsBody = state.calculateProductsBody.filter(
        (item) =>
          !(
            item?.stock_id === payload?.stock_id &&
            item?.addons?.length === payload?.addons?.length &&
            payload?.addons?.every((addon) =>
              item?.addons?.find(
                (item) =>
                  item?.stock_id === addon?.stock_id &&
                  item?.quantity === addon?.quantity,
              ),
            )
          ),
      );
    },
    setTotalPrices(state, action) {
      const { payload } = action;
      state.totalPrices = payload;
    },
  },
});

export const {
  addOrderItem,
  removeFromOrder,
  clearOrder,
  setOrderProducts,
  setOrderItems,
  setOrderCurrency,
  setOrderData,
  clearOrderProducts,
  setOrderTotal,
  addOrderCoupon,
  verifyOrderCoupon,
  setCurrentShop,
  clearOrderItems,
  changeOrderedProductQuantity,
  setCalculateProductsBody,
  addCalculateProductsBody,
  setTotalPrices,
  removeProductFromCalculateProductsBody,
} = orderSlice.actions;
export default orderSlice.reducer;
