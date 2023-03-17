export type MaybeAsync<T> = T | Promise<T>;

export type Nil = null | undefined;

export type ArrayItem<T> = T extends ReadonlyArray<infer U> ? U : never;
