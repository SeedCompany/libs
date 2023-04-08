/**
 * A Set that will render as a list in JSON.stringify
 */
export class JsonSet extends Set<string> {
  toJSON() {
    return [...this];
  }
}

/**
 * A Map that will render as an object in JSON.stringify
 */
export class JsonMap<T> extends Map<string, T> {
  toJSON() {
    return Object.fromEntries(this);
  }
}
