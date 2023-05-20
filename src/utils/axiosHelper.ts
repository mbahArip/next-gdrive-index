import axios, { AxiosError } from "axios";
import apiConfig from "config/api.config";

const fetch = axios.create({
  baseURL: apiConfig.basePath,
  maxRate: 5,
  timeout: 10000,
});

fetch.interceptors.response.use(
  (response) => response,
  (error: AxiosError<API_ErrorResponse>) => {
    if (error.response) {
      const payload = new ExtendedError(
        error.message,
        error.response.data.code,
        error.response.data.category,
        error.response.data.reason,
      );
      // Terjadi ketika request berhasil dikirimkan, namun server memberikan response dengan status code di luar range 2xx.
      return Promise.reject(JSON.stringify(payload));
    } else if (error.request) {
      const payload = new ExtendedError(
        Constant["noResponse"],
        500,
        "noResponse",
        error.message,
      );
      // Terjadi ketika request dikirimkan namun tidak menerima response dari server.
      return Promise.reject(JSON.stringify(payload));
    } else {
      const payload = new ExtendedError(
        Constant["badRequest"],
        400,
        "badRequest",
        error.message,
      );
      // Terjadi ketika terjadi kesalahan saat melakukan request.
      return Promise.reject(JSON.stringify(payload));
    }
  },
);

export default fetch;
