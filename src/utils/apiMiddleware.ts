import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import Cors, { CorsRequest } from "cors";
import { ErrorResponse } from "types/googleapis";

export function _initMiddleware(middleware: CorsRequest | any) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}
const initMiddleware =
  (handler: NextApiHandler) =>
  async (request: NextApiRequest, response: NextApiResponse) => {
    try {
      const allowedMethods = ["GET"];
      const initCORS = _initMiddleware(
        Cors({
          methods: allowedMethods,
        }),
      );
      await initCORS(request, response);

      return handler(request, response);
    } catch (error: any) {
      const payload: ErrorResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        code: error.code || 500,
        errors: {
          message: error.message || "Internal Server Error",
          reason: error.reason || "internalError",
        },
      };
      return response.status(error.code || 500).json(payload);
    }
  };

export default initMiddleware;
