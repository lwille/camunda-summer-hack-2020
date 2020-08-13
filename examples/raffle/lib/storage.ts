export interface Store<Value> {
  [index: string]: Value;
}

export default class Storage<Type> {
  store: { [index: string]: Store<Type> } = {};

  add(key: string, subKey: string, value: Type) {
    this.new(key)
    this.store[key][subKey] = value;
    return this;
  }

  take(key: string): Type {
    const subKeys = Object.keys(this.store[key]);
    const idx = Math.floor(Math.random() * subKeys.length);
    return this.store[key][subKeys[idx]];
  }

  new(key: string) {
    if (!this.store[key]) {
      this.store[key] = {};
    }
  }

  drop(key: string) {
    delete this.store[key];
  }
}
