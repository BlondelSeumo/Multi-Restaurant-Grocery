import {
  Paginate,
  IShop,
  SuccessResponse,
  ShopGallery,
  ShopReview,
  IReviewGroupRating,
} from "interfaces";
import request from "./request";

const shopService = {
  get: (params?: any): Promise<SuccessResponse<IShop>> =>
    request.get(`/rest/main-shop`, { params }),
  getAll: (params: any): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/paginate`, { params }),
  getAllShops: (params: string): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/paginate?${params}`),
  getById: (id: number, params?: any): Promise<SuccessResponse<IShop>> =>
    request.get(`/rest/shops/${id}`, { params }),
  getByIdReviews: (id: number, params?: any): Promise<Paginate<ShopReview>> =>
    request.get(`/rest/shops/${id}/reviews`, { params }),
  getRecommended: (params?: any): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/recommended`, { params }),
  search: (params: any): Promise<Paginate<IShop>> =>
    request.get(`/rest/shops/search`, { params }),
  getAllTags: (params?: any) => request.get(`/rest/shops-takes`, { params }),
  getAveragePrices: (params?: any) =>
    request.get(`/rest/products-avg-prices`, { params }),
  create: (data: any) => request.post(`/dashboard/user/shops`, data),
  checkZone: (params?: any) =>
    request.get(`/rest/shop/delivery-zone/check/distance`, { params }),
  checkZoneById: (id: number, params?: any) =>
    request.get(`/rest/shop/${id}/delivery-zone/check/distance`, { params }),
  getNearestShop: (params?: any): Promise<SuccessResponse<IShop>> =>
    request.get(`/rest/branch/check-smallest`, { params }),
  getGalleries: (params?: any): Promise<SuccessResponse<ShopGallery>> =>
    request.get(`/rest/main-shop/galleries`, { params }),
  getShopReviews: (params?: any): Promise<SuccessResponse<ShopReview>> =>
    request.get(`/rest/main-shop/reviews`, { params }),
  getShopGroupRating: (params?: any): Promise<IReviewGroupRating> =>
    request.get(`/rest/main-shop/reviews-group-rating`, { params }),
};

export default shopService;
