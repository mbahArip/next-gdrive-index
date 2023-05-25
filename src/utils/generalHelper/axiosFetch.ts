import axios, { AxiosError } from "axios";
import { notFound } from "next/navigation";

import ExtendedError from "utils/generalHelper/extendedError";

import { API_Error } from "types/api";
import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";

const AxiosFetch = axios.create({
  baseURL: apiConfig.basePath,
  maxRate: 5,
  timeout: 10000,
});

AxiosFetch.interceptors.response.use(
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

export function fetchData<D = unknown>(
  url: RequestInfo | URL,
  config?: RequestInit,
) {
  const isRelativeUrl =
    typeof url === "string" && url.startsWith("/");
  const fullPath = isRelativeUrl
    ? `${apiConfig.basePath}${url}`
    : url;

  return fetch(fullPath, config)
    .then((res) => res.json())
    .then((res) => res as D);
}

export function handleError(error: API_Error) {
  const errorData = error as API_Error;
  if (errorData.code === 404) {
    notFound();
  }
  return JSON.stringify(
    new ExtendedError(
      errorData.message,
      errorData.code,
      errorData.category,
      errorData.reason,
    ),
  );
}

export default AxiosFetch;
