type ActionResponseSuccess<T> = {
  success: true;
  data: T;
};
type ActionResponseError = {
  success: false;
  error: string;
};
export type ActionResponseSchema<T = undefined> = (ActionResponseSuccess<T> | ActionResponseError) & {
  message: string;
};
