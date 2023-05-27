import { API_Error } from "types/api";
import { Constant } from "types/general/constant";

function createErrorPayload(
  error: any,
  path: string,
  requestStart: number = Date.now(),
): API_Error {
  console.error(`Error @${path}: `, error.message);

  const payload: API_Error = {
    success: false,
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - requestStart,
    code: error.code || 500,
    message: Constant.apiInternalError,
    category: "internalError",
    reason: error.message || Constant.apiInternalError,
  };

  if ("extendedMessage" in error) {
    console.log("Reason: ", error.reason);
    payload.message = error.message;
    payload.category = error.category || "internalError";
    payload.reason =
      error.reason || Constant.apiInternalError;
  }

  return payload;
}

export default createErrorPayload;
