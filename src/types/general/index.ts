export type RequestContext<
  N extends string,
  T = unknown,
> = {
  params: {
    [K in N]: T;
  };
};
