/**
 * A Set that will render as a list in JSON.stringify
 */
export class JsonSet<V extends string> extends Set<V> {
  toJSON() {
    return [...this];
  }
}

/**
 * A Map that will render as an object in JSON.stringify
 */
export class JsonMap<K extends string, V> extends Map<K, V> {
  toJSON() {
    return Object.fromEntries(this);
  }
}
