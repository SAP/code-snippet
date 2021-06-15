type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;

export type State<T> = {
  resolve: Resolve<T>;
  reject: Reject;
};

export type PromiseAndState<T> = {
  promise: Promise<T>;
  state: State<T>;
};

export function createPromiseAndState<T>(): PromiseAndState<T> {
  let state: State<T>;
  const promise: Promise<T> = new Promise<T>(
    (resolve: Resolve<T>, reject: Reject) => {
      state = { resolve, reject };
    }
  );
  return { promise, state };
}
