import { Category, Paginate, RecipeCategory } from "interfaces";
import request from "./request";

const categoryService = {
  getAllShopCategories: (params: any = {}): Promise<Paginate<Category>> =>
    request.get(`/rest/categories/paginate`, {
      params: { ...params, type: "shop" },
    }),
  getAllProductCategories: (params?: any): Promise<Paginate<Category>> =>
    request.get(`/rest/categories/paginate`, {
      params: { ...params, type: "main" },
    }),
  getAllRecipeCategories: (
    params: any = {}
  ): Promise<Paginate<RecipeCategory>> =>
    request.get(`/rest/categories/paginate`, {
      params: { ...params, type: "receipt" },
    }),
};

export default categoryService;
