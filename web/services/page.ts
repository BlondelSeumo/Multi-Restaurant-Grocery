import { SuccessResponse, IPage } from "interfaces";
import request from "./request";

const pageService = {
  getDeliverPage: (params?: any): Promise<SuccessResponse<IPage>> =>
    request.get(`/rest/pages/delivery`, { params }),
  getAboutPage: (params?: any): Promise<SuccessResponse<IPage>> =>
    request.get(`/rest/pages/about`, { params }),
};

export default pageService;
