import ExtendedError from "utils/generalHelper/extendedError";

async function triggerError(code?: number) {
  throw new ExtendedError(
    "Trigger Error",
    code || 500,
    "triggerError",
    "This is a test error",
  );
}

async function triggerLoading(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const trigger = {
  error: triggerError,
  loading: triggerLoading,
};
export default trigger;
