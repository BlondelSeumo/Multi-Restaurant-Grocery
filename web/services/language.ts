import request from "./request";
import { Langauge, SuccessResponse } from "interfaces";

const languageService = {
  getAllActive: (params?: any): Promise<SuccessResponse<Langauge[]>> =>
    request.get(`/rest/languages/active`, { params }),
};

export default languageService;
