import {
  CategoryWithProducts,
  Paginate,
  Product,
  SuccessResponse,
} from "interfaces";
import request from "./request";

const productService = {
  getAll: (params?: any): Promise<Paginate<Product>> =>
    request.get(`/rest/products/paginate`, { params }),
  getAllShopProducts: (params?: any): Promise<Paginate<CategoryWithProducts>> =>
    request.get(`/rest/branch/products`, { params }),
  getAllShopRecommendedProducts: (
    params?: any
  ): Promise<SuccessResponse<Product[]>> =>
    request.get(`/rest/branch/recommended/products`, { params }),
  getById: (uuid: string, params?: any): Promise<SuccessResponse<Product>> =>
    request.get(`/rest/products/${uuid}`, { params }),
  search: (params: any): Promise<Paginate<Product>> =>
    request.get(`/rest/products/search`, { params }),
  getRecomended: (params?: any): Promise<Paginate<Product>> =>
    request.get(`/rest/products/most-sold`, { params }),
};

export default productService;
