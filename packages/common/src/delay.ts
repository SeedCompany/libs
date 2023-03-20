export interface DelayFn {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  (ms: number): Promise<void>;
}

const base = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const delayFnImpl = { current: base };

export const delay: DelayFn = (...args) =>
  // @ts-expect-error Trying to be smart here with a conditional overload.
  delayFnImpl.current(...args);
