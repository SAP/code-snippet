export type PromiseFunctions = {
  resolve(value: void | PromiseLike<void>): void;
  reject(reason?: any): void;
};
