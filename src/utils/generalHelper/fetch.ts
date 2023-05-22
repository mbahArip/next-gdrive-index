import axios, { AxiosError } from "axios";
import apiConfig from "config/api.config";
import { API_Error } from "types/api";
import ExtendedError from "utils/generalHelper/extendedError";
import { Constant } from "types/general/constant";

const fetch = axios.create({
  baseURL: apiConfig.basePath,
  maxRate: 5,
  timeout: 10000,
});

fetch.interceptors.response.use(
  (response) => response,
  (error: AxiosError<API_Error>) => {
    if (error.response) {
      const payload = JSON.stringify(
        new ExtendedError(
          error.response.data.message,
          error.response.data.code,
          error.response.data.category,
          error.response.data.reason,
        ),
      );
      return Promise.reject(payload);
    } else if (error.request) {
      const payload = JSON.stringify(
        new ExtendedError(
          Constant.apiNoResponse,
          500,
          "noResponse",
          error.message,
        ),
      );
      return Promise.reject(payload);
    } else {
      const payload = JSON.stringify(
        new ExtendedError(
          Constant.apiBadRequest,
          400,
          "badRequest",
          error.message,
        ),
      );
      return Promise.reject(payload);
    }
  },
);

export default fetch;
