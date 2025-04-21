import cart from "./slices/cart";
import currency from "./slices/currency";
import favoriteProducts from "./slices/favoriteProducts";
import shopFilter from "./slices/shopFilter";
import userCart from "./slices/userCart";
import product from "./slices/product";
import chat from "./slices/chat";
import search from "./slices/search";
import order from "./slices/order";
import productFilter from "./slices/productFilter";
import history from "./slices/history";

const rootReducer = {
  liked: favoriteProducts,
  cart: cart,
  filter: shopFilter,
  currency: currency,
  userCart: userCart,
  product: product,
  chat: chat,
  search: search,
  order: order,
  productFilter: productFilter,
  history: history,
};

export default rootReducer;
