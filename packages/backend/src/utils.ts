export type ResolveType = (value: void | PromiseLike<void>) => void;
export type RejectType = (reason?: any) => void;

export type PromiseFunctions = {
  resolve: ResolveType;
  reject: RejectType;
};
